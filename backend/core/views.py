from rest_framework import viewsets
from .models import Usuario, EstudioPDF, EstudioApi, ArchivoResultados, VisualizacionDatos, DatosEstandarizados,AuditoriaUsuario

from rest_framework.authtoken.serializers import AuthTokenSerializer
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .serializers import (
    UsuarioSerializer,
    EstudioPDFSerializer,
    EstudioApiSerializer,
    ArchivoResultadosSerializer,
    VisualizacionDatosSerializer,
    
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.core.files.storage import default_storage
import pandas as pd  # Librería para procesar CSV/Excel
import traceback
from datetime import timedelta
from rest_framework.authtoken.views import ObtainAuthToken
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice  # Importa el modelo de TOTP
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile
from django.http import HttpResponse
import pyotp
import io
import base64
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from datetime import timedelta
from .utils import encrypt_data, decrypt_data
# Apis más personalizadas

# Método para verificar la vigencia de la contraseña
def verificar_vigencia_contraseña(user):
    vigencia = timedelta(days=90)
    return timezone.now() > user.password_change_date + vigencia

def send_verification_code(user, purpose='login'):
    # Generar el código de verificación (sin encriptar)
    plain_code = get_random_string(length=6, allowed_chars='0123456789')
    
    # Encriptar el código antes de guardarlo en la base de datos
    user.verify_code = encrypt_data(plain_code)  # Encriptar y guardar en BD
    user.verify_code_created = timezone.now()
    user.is_for_login = (purpose == 'login')  # Marca si el código es para login
    user.save(update_fields=['verify_code', 'verify_code_created', 'is_for_login'])
    
    # Desencriptar el email
    decrypted_email = decrypt_data(user.email)

    # Configura el asunto y el mensaje del correo en función del propósito
    # Configura el asunto y el mensaje del correo en función del propósito
    if purpose == 'login':
        subject = 'Código de Verificación 2FA para Iniciar Sesión - VitaEx Labs'
        message = f'Tu código de verificación para 2FA es:{plain_code}\nÚsalo para completar el acceso a tu cuenta. Este código expira en 10 minutos.'
    elif purpose == 'recover_account':
        subject = 'Recuperación de Cuenta - VitaEx Labs'
        message = f'Tu código de verificación para cambio de contraseña es:{plain_code}\nÚsalo para recuperar tu cuenta. Este código expira en 10 minutos.'


    # Enviar el correo con el código de verificación sin encriptar
    send_mail(
        subject,
        message,
        'no-reply@vitaexlabs.com',
        [decrypted_email],
        fail_silently=False,
    )




# Método de inicio de sesión con verificación de expiración de contraseña
#NOTA: INTENTAR SEPARA LOS METODOS DE LOGUEO Y TOKENS CUANDO SEPA QUE METODO 2FA USAR
class CustomObtainAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        username = request.data.get('username')

        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']

            # Si el usuario está bloqueado, envía un mensaje específico para el frontend
            if user.is_locked:
                AuditoriaUsuario.objects.create(
                    usuario=user, 
                    accion="Intento de inicio de sesión bloqueado", 
                    detalles="Cuenta bloqueada"
                )
                return Response({"message": "Tu cuenta está bloqueada. Contacte al administrador."}, status=status.HTTP_403_FORBIDDEN)

            # Si la contraseña ha expirado, envía el mensaje adecuado
            if user.is_password_expired():
                AuditoriaUsuario.objects.create(
                    usuario=user, 
                    accion="Intento de inicio de sesión con contraseña expirada", 
                    detalles="Contraseña expirada"
                )
                return Response({"message": "Tu contraseña ha expirado. Debes cambiarla."}, status=status.HTTP_400_BAD_REQUEST)

            # Enviar siempre el código de verificación para 2FA
            send_verification_code(user, purpose='login')
            AuditoriaUsuario.objects.create(
                usuario=user, 
                accion="Envío de código de verificación 2FA", 
                detalles="Código de verificación enviado por correo para login"
            )
            return Response({
                "message": "Código de verificación enviado a tu correo. Por favor ingrésalo para completar el inicio de sesión por 2FA."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("Excepción durante la autenticación:", str(e))
            try:
                user = Usuario.objects.get(username=username)
                response_data = self.handle_failed_attempt(user)
                AuditoriaUsuario.objects.create(
                    usuario=user, 
                    accion="Intento de inicio de sesión fallido", 
                    detalles=f"{response_data['message']}"
                )
                return Response(response_data, status=status.HTTP_401_UNAUTHORIZED)
            except Usuario.DoesNotExist:
                print(f"Usuario {username} no encontrado en la base de datos.")

            return Response({"message": "Credenciales incorrectas."}, status=status.HTTP_401_UNAUTHORIZED)

    def handle_failed_attempt(self, user):
        user.failed_attempts += 1
        remaining_attempts = max(4 - user.failed_attempts, 0)

        if user.failed_attempts >= 4:
            user.is_locked = True
            user.save()
            return {"message": "Tu cuenta está bloqueada. Cambia la contraseña para desbloquearla."}

        user.save()
        if remaining_attempts == 1:
            return {
                "message": "Credenciales incorrectas. Si fallas una vez más, tu cuenta será bloqueada y deberás restablecerla cambiando su contraseña.",
                "remaining_attempts": remaining_attempts,
            }

        return {
            "message": f"Credenciales incorrectas. Te quedan {remaining_attempts} intentos.",
            "remaining_attempts": remaining_attempts,
        }

custom_obtain_auth_token = CustomObtainAuthToken.as_view()



# Función para recuperar la cuenta y encriptar el correo y contraseña temporal
@api_view(['POST'])
@permission_classes([AllowAny])
def recover_account(request):
    email = request.data.get('email')
    print(f"Recuperación de cuenta iniciada para el correo: {email}")
    
    try:
        users = Usuario.objects.all()
        user = None
        for u in users:
            decrypted_email = u.get_decrypted_email()
            print(f"Correo desencriptado para el usuario {u.username}: {decrypted_email}")
            if decrypted_email == email:
                user = u
                break

        if not user:
            print("No se encontró el usuario con el correo proporcionado.")
            return Response({"error": "El correo electrónico no está registrado."}, status=404)

        # Usar el método send_verification_code para enviar el correo de recuperación
        send_verification_code(user, purpose='recover_account')
        
        # Registrar en la auditoría
        AuditoriaUsuario.objects.create(
            usuario=user, 
            accion="Generación de código de verificación", 
            detalles="Código enviado al correo"
        )

        print("Correo enviado exitosamente.")
        return Response({"message": "Código de verificación enviado a tu correo electrónico. Tienes 10 minutos para usarlo."}, status=200)

    except Exception as e:
        print("Error inesperado al recuperar la cuenta:", str(e))
        return Response({"error": "Error interno del servidor."}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_code(request):
    email = request.data.get('email')
    username = request.data.get('username')
    code = request.data.get('code')

    try:
        # Buscar al usuario usando `email` o `username` dependiendo de cuál esté disponible
        if email:
            # Buscar el usuario por correo
            users = Usuario.objects.all()
            user = None
            for u in users:
                decrypted_email = u.get_decrypted_email()
                if decrypted_email == email:
                    user = u
                    break
            if not user:
                return Response({"error": "El correo electrónico no está registrado."}, status=404)
        elif username:
            # Buscar el usuario por nombre de usuario
            user = Usuario.objects.get(username=username)
        else:
            return Response({"error": "Debe proporcionar un correo electrónico o un nombre de usuario."}, status=400)

        # Verificar si el código de verificación coincide y si aún es válido
        if user.get_decrypted_verify_code() == code:
            if timezone.now() > user.verify_code_created + timedelta(minutes=10):
                return Response({"valid": False, "message": "El código ha expirado. Solicita uno nuevo."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Registrar en la auditoría
            AuditoriaUsuario.objects.create(
                usuario=user, 
                accion="Verificación de código", 
                detalles="Código verificado exitosamente"
            )
            
            # Generar y devolver el token solo en el flujo de inicio de sesión
            if username:
                token, created = Token.objects.get_or_create(user=user)
                return Response({"valid": True, "token": token.key}, status=status.HTTP_200_OK)
            
            # Para el flujo de cambio de contraseña, solo devolvemos validación exitosa
            return Response({"valid": True}, status=status.HTTP_200_OK)

        # Si el código es incorrecto
        return Response({"valid": False, "message": "El código es incorrecto."}, status=status.HTTP_400_BAD_REQUEST)

    except Usuario.DoesNotExist:
        return Response({"error": "El nombre de usuario no está registrado."}, status=404)
    except Exception as e:
        print("Error al verificar código:", str(e))
        return Response({"error": "Error interno del servidor."}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def validate_security_question(request):
    email = request.data.get('email')
    answer = request.data.get('answer')

    try:
        users = Usuario.objects.all()
        user = None
        for u in users:
            decrypted_email = u.get_decrypted_email()
            if decrypted_email == email:
                user = u
                break

        if not user:
            return Response({"error": "El correo electrónico no está registrado."}, status=404)

        # Desencriptar las respuestas de seguridad
        decrypted_favorite_color = decrypt_data(user.favorite_color)
        decrypted_pets_name = decrypt_data(user.pets_name)

        # Elegir una pregunta al azar
        if "color" in request.data.get('question', '').lower():
            if answer.lower() == decrypted_favorite_color.lower():
                return Response({"valid": True, "message": "Respuesta correcta."}, status=200)
        elif "mascota" in request.data.get('question', '').lower():
            if answer.lower() == decrypted_pets_name.lower():
                return Response({"valid": True, "message": "Respuesta correcta."}, status=200)

        # Si la respuesta es incorrecta
        return Response({"valid": False, "message": "La respuesta es incorrecta."}, status=400)

    except Exception as e:
        print("Error al validar la pregunta de seguridad:", str(e))
        return Response({"error": "Error interno del servidor."}, status=500)




@api_view(['POST'])
@permission_classes([AllowAny])
def change_password(request):
    email = request.data.get('email')
    new_password = request.data.get('newPassword')
    print("Solicitud de cambio de contraseña recibida.") 

    for user in Usuario.objects.all():
        decrypted_email = user.get_decrypted_email()
        print(f"Verificando usuario: {user.username}, Email desencriptado: {decrypted_email}")
        if decrypted_email == email:
            try:
                validate_password(new_password)
            except ValidationError as e:
                return Response({"errors": e.messages}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.set_password_change_date()
            user.failed_attempts = 0
            user.is_locked = False
            user.save(update_fields=['password', 'last_password_change', 'password_change_date', 'failed_attempts', 'is_locked'])
            
            AuditoriaUsuario.objects.create(
            usuario=user, 
            accion="Cambio de contraseña", 
            detalles="Contraseña cambiada y cuenta desbloqueada exitosamente")

            return Response({"message": "Contraseña cambiada con éxito. Tu próxima renovación será en 90 días."}, status=status.HTTP_200_OK)

    print("El usuario no existe con el correo proporcionado.")
    return Response({"error": "El correo electrónico no está registrado."}, status=status.HTTP_404_NOT_FOUND)


# Registro de usuario con encriptación de email
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    password = request.data.get('password')
    email = request.data.get('email')
    favorite_color = request.data.get('favorite_color')
    pets_name = request.data.get('pets_name')

    try:
        validate_password(password)
    except ValidationError as e:
        return Response({"errors": e.messages}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UsuarioSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Asignar la fecha de cambio de contraseña automáticamente
        user.set_password_change_date()
        
        # Encriptar el email, favorite_color y pets_name antes de guardar
        user.email = encrypt_data(email)
        user.favorite_color = encrypt_data(favorite_color)
        user.pets_name = encrypt_data(pets_name)
        user.save()

        # Registrar en auditoría
        AuditoriaUsuario.objects.create(
            usuario=user,
            accion="Registrar Usuario",
            detalles="Se registró exitosamente"
        )

        # Generar el token de autenticación
        token, created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




   
@api_view(['GET'])
@permission_classes([AllowAny])  # Permitir a cualquiera acceder sin autenticación
def password_policy(request):
    policy = {
        "min_length": 8,
        "max_length": 14,
        "must_contain": ["uppercase", "lowercase", "special_char"],
        "no_repeated_chars": True
    }
    return Response(policy)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Requiere autenticación
def get_user_data(request):
    user = request.user
    serializer = UsuarioSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Asegúrate de que el usuario esté autenticado
def logout_user(request):
    try:
        # Obtener el token del usuario autenticado
        token = Token.objects.get(user=request.user)
        token.delete()  # Eliminar el token del usuario
        
        # Registrar en auditoría
        AuditoriaUsuario.objects.create(
            usuario=request.user,
            accion="Cierre de sesión",
            detalles="El usuario cerró sesión exitosamente"
        )

        return Response({"message": "Cierre de sesión exitoso"}, status=status.HTTP_200_OK)
    except Token.DoesNotExist:
        return Response({"error": "Token no encontrado"}, status=status.HTTP_400_BAD_REQUEST)


#Apis de Estudios y Carga de Archivos
@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Solo usuarios autenticados pueden cargar archivos
def upload_result_file(request):
    try:
        # Obtener el usuario y los datos
        usuario = request.user
        estudio_id = request.data.get('estudio_id')  # ID del estudio al que pertenece el archivo de resultados
        tipo_analisis = request.data.get('tipo_analisis')  # Tipo de análisis que se está subiendo
        archivo = request.FILES.get('archivo')  # Obtener el archivo

        # Validar que el archivo, estudio_id y tipo_analisis se hayan enviado
        if not archivo or not estudio_id or not tipo_analisis:
            return Response({"error": "Debe proporcionar archivo, estudio_id y tipo_analisis."}, status=status.HTTP_400_BAD_REQUEST)

        # Validar si el estudio PDF existe
        try:
            estudio = EstudioPDF.objects.get(id=estudio_id)
        except EstudioPDF.DoesNotExist:
            return Response({"error": "El estudio no existe."}, status=status.HTTP_404_NOT_FOUND)

        # Determinar el formato del archivo subido (CSV o Excel)
        extension = archivo.name.split('.')[-1].lower()
        formatos_permitidos = ['csv', 'xls', 'xlsx']
        if extension not in formatos_permitidos:
            return Response({"error": "Formato de archivo no soportado."}, status=status.HTTP_400_BAD_REQUEST)

        # Validar si ya existe un archivo con el mismo estudio, tipo de análisis y extensión
        archivo_existente = ArchivoResultados.objects.filter(
            estudio=estudio,
            tipo_analisis=tipo_analisis,
            ruta__endswith=f".{extension}"
        ).exists()

        if archivo_existente:
            return Response(
                {"error": f"Ya existe un archivo {extension} para este estudio y tipo de análisis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guardar el archivo en el servidor
        ruta_archivo = default_storage.save(f'resultados/{archivo.name}', archivo)

        # Procesar el archivo CSV o Excel
        if extension == 'csv':
            data = pd.read_csv(default_storage.path(ruta_archivo))  # Procesar archivo CSV
        else:  # Excel
            data = pd.read_excel(default_storage.path(ruta_archivo))  # Procesar archivo Excel

        # Convertir el contenido del archivo a JSON
        contenido = data.to_dict(orient='records')

        # Crear una entrada en la tabla ArchivoResultados
        archivo_resultado = ArchivoResultados.objects.create(
            estudio=estudio,
            tipo_analisis=tipo_analisis,
            ruta=ruta_archivo,
            contenido=contenido  # Almacenar el contenido del archivo en formato JSON
        )

        # Registrar en la auditoría
        AuditoriaUsuario.objects.create(
            usuario=usuario,
            accion="Carga de archivo de resultados",
            detalles=f"Archivo {archivo.name} cargado exitosamente para el estudio ID {estudio_id}."
        )

        return Response({"message": "Archivo cargado y procesado con éxito."}, status=status.HTTP_201_CREATED)

    except Exception as e:
        # Capturar y registrar el error completo en los logs
        print("Error al procesar el archivo:", str(e))
        traceback.print_exc()
        return Response({"error": f"Error al procesar el archivo: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Solo usuarios autenticados pueden cargar archivos
def upload_pdf(request):
    try:
        # Obtener el usuario y el archivo del request
        usuario = request.user
        archivo_pdf = request.FILES.get('archivo')  # Obtener el archivo PDF

        # Validar que el archivo haya sido enviado
        if not archivo_pdf:
            return Response({"error": "Debe proporcionar un archivo PDF."}, status=status.HTTP_400_BAD_REQUEST)

        # Validar que el archivo sea un PDF
        if not archivo_pdf.name.endswith('.pdf'):
            return Response({"error": "Solo se permiten archivos en formato PDF."}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si ya existe un archivo PDF con el mismo nombre para el usuario
        if EstudioPDF.objects.filter(nombre_archivo=archivo_pdf.name, usuario=usuario).exists():
            return Response(
                {"error": "Este archivo PDF ya ha sido subido anteriormente. Por favor, elija otro estudio."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guardar el archivo en el servidor
        ruta_archivo = default_storage.save(f'pdfs/{archivo_pdf.name}', archivo_pdf)

        # Crear una entrada en la tabla EstudioPDF
        estudio_pdf = EstudioPDF.objects.create(
            usuario=usuario,
            nombre_archivo=archivo_pdf.name,
            ruta=ruta_archivo,
            estado='activo'  # Puedes ajustar el estado según la lógica del negocio
        )

        # Registrar en la auditoría
        AuditoriaUsuario.objects.create(
            usuario=usuario,
            accion="Carga de archivo PDF",
            detalles=f"Archivo PDF {archivo_pdf.name} cargado exitosamente."
        )

        return Response({"message": "Archivo PDF cargado con éxito.", "estudio_id": estudio_pdf.id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        # Capturar la excepción exacta y registrar el error
        print("Error al subir el archivo PDF:", str(e))
        traceback.print_exc()  # Muestra el error completo en los logs
        return Response({"error": f"Error al procesar el archivo PDF: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Solo usuarios autenticados pueden obtener los estudios
def get_studies_with_results(request):
    try:
        # Obtener el usuario autenticado
        usuario = request.user

        # Obtener todos los estudios subidos por el usuario
        estudios = EstudioPDF.objects.filter(usuario=usuario)

        # Serializar los estudios
        estudios_serializados = []
        for estudio in estudios:
            estudio_serializado = EstudioPDFSerializer(estudio).data

            # Obtener los resultados asociados a este estudio
            resultados = ArchivoResultados.objects.filter(estudio=estudio)
            resultados_serializados = ArchivoResultadosSerializer(resultados, many=True).data

            # Añadir los resultados al estudio
            estudio_serializado['resultados'] = resultados_serializados
            estudios_serializados.append(estudio_serializado)

        return Response(estudios_serializados, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": f"Error fetching studies: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])  # Requiere autenticación
def edit_study(request, pk):
    try:
        # Obtener el estudio por su pk
        estudio = EstudioPDF.objects.get(pk=pk)

        # Obtener los datos enviados
        nombre_archivo_nuevo = request.data.get('nombre_archivo')
        estado = request.data.get('estado')

        # Si el nombre del archivo ha cambiado, renombrar el archivo físico
        if nombre_archivo_nuevo and nombre_archivo_nuevo != estudio.nombre_archivo:
            # Obtener la ruta actual y la nueva ruta
            ruta_actual = estudio.ruta
            nueva_ruta = f"pdfs/{nombre_archivo_nuevo}"

            # Renombrar el archivo en el sistema de archivos
            old_file_path = default_storage.path(ruta_actual)
            new_file_path = default_storage.path(nueva_ruta)
            default_storage.save(new_file_path, default_storage.open(old_file_path))
            default_storage.delete(old_file_path)

            # Actualizar la ruta en el modelo
            estudio.ruta = nueva_ruta

        # Actualizar el nombre del archivo en la base de datos
        estudio.nombre_archivo = nombre_archivo_nuevo if nombre_archivo_nuevo else estudio.nombre_archivo
        estudio.estado = estado if estado else estudio.estado

        # Guardar los cambios en la base de datos
        estudio.save()

        # Registrar en la auditoría
        AuditoriaUsuario.objects.create(
            usuario=request.user,
            accion="Edición de Estudio",
            detalles=f"Estudio con ID {pk} actualizado: nombre_archivo='{nombre_archivo_nuevo}', estado='{estado}'"
        )

        return Response({"message": "Estudio actualizado correctamente."}, status=status.HTTP_200_OK)

    except EstudioPDF.DoesNotExist:
        return Response({"error": "Estudio no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"Error al actualizar el estudio: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




# ViewSet para el modelo Usuario
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

# ViewSet para el modelo EstudioArchivo
class EstudioPDFViewSet(viewsets.ModelViewSet):
    queryset = EstudioPDF.objects.all()
    serializer_class = EstudioPDFSerializer
    permission_classes = [IsAuthenticated]

# ViewSet para el modelo EstudioApi
class EstudioApiViewSet(viewsets.ModelViewSet):
    queryset = EstudioApi.objects.all()
    serializer_class = EstudioApiSerializer
    permission_classes = [IsAuthenticated]

# ViewSet para el modelo Resultados
class ArchivoResultadosViewSet(viewsets.ModelViewSet):
    queryset = ArchivoResultados.objects.all()
    serializer_class = ArchivoResultadosSerializer
    permission_classes = [IsAuthenticated]

# ViewSet para el modelo VisualizacionDatos
class VisualizacionDatosViewSet(viewsets.ModelViewSet):
    queryset = VisualizacionDatos.objects.all()
    serializer_class = VisualizacionDatosSerializer
    permission_classes = [IsAuthenticated]