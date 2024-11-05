from .models import AuditoriaUsuario
from django.core.cache import cache
from .utils import encrypt_data, decrypt_data
from rest_framework import viewsets
from .models import Usuario, EstudioPDF, EstudioApi, ArchivoResultados, VisualizacionDatos, DatosEstandarizados, AuditoriaUsuario, Ubicacion
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
    UbicacionSerializer,
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
from django.http import JsonResponse
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from datetime import timedelta
# Apis más personalizadas


from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import traceback

# Define la función send_verification_code aquí


def send_verification_code(user=None, email=None, purpose='login'):
    plain_code = get_random_string(length=6, allowed_chars='0123456789')

    # Si se proporciona un objeto de usuario, guardar el código y otros detalles en la base de datos
    if user:
        user.verify_code = encrypt_data(plain_code)
        user.verify_code_created = timezone.now()
        user.is_for_login = (purpose == 'login')
        user.save(update_fields=['verify_code',
                  'verify_code_created', 'is_for_login'])
        decrypted_email = decrypt_data(user.email)
    elif email:
        decrypted_email = email
    else:
        raise ValueError(
            "Debe proporcionar un 'user' o un 'email' para enviar el código de verificación.")

    # Personalizar el asunto y mensaje según el propósito
    if purpose == 'login':
        subject = 'Código de Verificación 2FA para Iniciar Sesión - VitaEx Labs'
        message = f'Tu código de verificación para 2FA es:{
            plain_code}\nEste código expira en 10 minutos.'
    elif purpose == 'verify_email':
        subject = 'Verificación de Correo Electrónico - VitaEx Labs'
        message = f'Tu código de verificación para completar el registro es:{
            plain_code}\nEste código expira en 10 minutos.'
    else:
        subject = 'Recuperación de Cuenta - VitaEx Labs'
        message = f'Tu código de verificación para recuperar tu cuenta es:{
            plain_code}\nEste código expira en 10 minutos.'

    # Enviar el correo electrónico
    send_mail(
        subject,
        message,
        'no-reply@vitaexlabs.com',
        [decrypted_email],
        fail_silently=False,
    )

    return plain_code  # Retorna el código generado para que pueda ser almacenado en caché

# Define el endpoint email_and_code_verification aquí


@api_view(['POST'])
@permission_classes([AllowAny])
def email_and_code_verification(request):
    email = request.data.get('email')
    code = request.data.get('code')

    # Paso 1: Verificar si el correo ya está en uso
    if Usuario.objects.filter(email=encrypt_data(email)).exists():
        return Response(
            {"error": "El correo ya está registrado. Por favor, ingresa otro correo."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Paso 2: Enviar el código de verificación si no se proporciona aún el código
    if not code:
        try:
            # Enviar el código de verificación sin guardar el usuario
            generated_code = send_verification_code(
                email=email, purpose='verify_email')

            # Almacenar el código en caché
            cache.set(f'verification_code_{email}', {
                      'code': generated_code, 'timestamp': timezone.now()}, timeout=600)

            # Registrar en la auditoría
            AuditoriaUsuario.objects.create(
                accion="Envío de Código de Verificación",
                detalles=f"Código de verificación enviado a {email}"
            )

            return Response(
                {"message": "Código de verificación enviado al correo. Por favor ingrésalo para continuar."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            traceback.print_exc()
            AuditoriaUsuario.objects.create(
                accion="Error al Enviar Código de Verificación",
                detalles=f"Error al enviar código de verificación a {
                    email}: {e}"
            )
            return Response(
                {"error": "Error al enviar el código de verificación. Intenta de nuevo."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Paso 3: Verificar el código de verificación cuando el usuario lo proporciona
    else:
        cached_data = cache.get(f'verification_code_{email}')
        if not cached_data or cached_data['code'] != code:
            AuditoriaUsuario.objects.create(
                accion="Error de Verificación de Código",
                detalles=f"Intento de verificación fallido para {
                    email} con código {code}"
            )
            return Response(
                {"error": "Código incorrecto o ha expirado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Registrar en la auditoría
        AuditoriaUsuario.objects.create(
            accion="Verificación de Código Exitosa",
            detalles=f"Código de verificación confirmado para {email}"
        )

        return Response(
            {"message": "Código verificado correctamente. Ahora puedes proceder con el registro completo."},
            status=status.HTTP_200_OK
        )


# Método de inicio de sesión con verificación de expiración de contraseña
# NOTA: INTENTAR SEPARA LOS METODOS DE LOGUEO Y TOKENS CUANDO SEPA QUE METODO 2FA USAR
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
            print(f"Correo desencriptado para el usuario {
                  u.username}: {decrypted_email}")
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
        print(f"Verificando usuario: {
              user.username}, Email desencriptado: {decrypted_email}")
        if decrypted_email == email:
            try:
                validate_password(new_password)
            except ValidationError as e:
                return Response({"errors": e.messages}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.set_password_change_date()
            user.failed_attempts = 0
            user.is_locked = False
            user.is_for_login = False
            user.save(update_fields=['password', 'last_password_change',
                      'password_change_date', 'failed_attempts', 'is_locked', 'is_for_login'])

            AuditoriaUsuario.objects.create(
                usuario=user,
                accion="Cambio de contraseña",
                detalles="Contraseña cambiada y cuenta desbloqueada exitosamente")

            return Response({"message": "Contraseña cambiada con éxito. Tu próxima renovación será en 90 días."}, status=status.HTTP_200_OK)

    print("El usuario no existe con el correo proporcionado.")
    return Response({"error": "El correo electrónico no está registrado."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([AllowAny])
def email_and_code_verification(request):
    email = request.data.get('email')
    code = request.data.get('code')

    # Paso 1: Verificar si el correo ya está en uso
    usuarios = Usuario.objects.all()
    for usuario in usuarios:
        decrypted_email = usuario.get_decrypted_email()
        if decrypted_email == email:
            # Guardar en la auditoría que se intentó usar un correo registrado
            AuditoriaUsuario.objects.create(
                accion="Intento de registro con correo ya registrado",
                detalles=f"Intento de registro con correo ya registrado: {
                    email}"
            )
            return Response(
                {"error": "El correo ya está registrado. Por favor, ingresa otro correo."},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Paso 2: Enviar el código de verificación si no se proporciona aún el código
    if not code:
        try:
            # Enviar el código de verificación y guardarlo en el caché
            generated_code = send_verification_code(
                email=email, purpose='verify_email')
            cache.set(f'verification_code_{email}', {
                      'code': generated_code, 'timestamp': timezone.now()}, timeout=600)

            # Guardar en la auditoría que el código fue enviado
            AuditoriaUsuario.objects.create(
                accion="Código de verificación enviado",
                detalles=f"Código de verificación enviado a {email}"
            )
            return Response(
                {"message": "Código de verificación enviado al correo. Por favor ingrésalo para continuar."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            # Log de error y auditoría en caso de falla
            traceback.print_exc()
            AuditoriaUsuario.objects.create(
                accion="Error al Enviar Código de Verificación",
                detalles=f"Error al enviar código de verificación a {
                    email}: {str(e)}"
            )
            return Response(
                {"error": "Error al enviar el código de verificación. Intenta de nuevo."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    # Paso 3: Verificar el código de verificación cuando el usuario lo proporciona
    else:
        try:
            # Recuperar el código de verificación del caché
            cached_data = cache.get(f'verification_code_{email}')
            if not cached_data:
                return Response(
                    {"error": "Código no encontrado o expirado."},
                    status=status.HTTP_404_NOT_FOUND
                )

            cached_code = cached_data['code']
            timestamp = cached_data['timestamp']

            # Validar el código de verificación
            if cached_code != code or timezone.now() > timestamp + timedelta(minutes=10):
                return Response(
                    {"error": "Código incorrecto o ha expirado"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Guardar en la auditoría que el código fue verificado exitosamente
            AuditoriaUsuario.objects.create(
                accion="Código de verificación exitoso",
                detalles=f"Código de verificación para {
                    email} verificado correctamente."
            )

            # Si el código es correcto, se permite continuar con el registro
            return Response(
                {"message": "Código verificado correctamente. Ahora puedes proceder con el registro completo."},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            # Manejo de errores y registro en la auditoría
            traceback.print_exc()
            AuditoriaUsuario.objects.create(
                accion="Error al verificar código",
                detalles=f"Error al verificar el código para {email}: {str(e)}"
            )
            return Response(
                {"error": "Error al verificar el código. Intenta de nuevo."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    favorite_color = request.data.get('favorite_color')
    pets_name = request.data.get('pets_name')

    # Validar la contraseña antes de proceder
    try:
        validate_password(password)
    except ValidationError as e:
        return Response({"errors": e.messages}, status=status.HTTP_400_BAD_REQUEST)

    # Guardar los datos completos del usuario
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
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
# Permitir a cualquiera acceder sin autenticación
@permission_classes([AllowAny])
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
# Asegúrate de que el usuario esté autenticado
@permission_classes([IsAuthenticated])
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


# Apis de Estudios y Carga de Archivos
@api_view(['POST'])
# Solo usuarios autenticados pueden cargar archivos
@permission_classes([IsAuthenticated])
def upload_result_file(request):
    try:
        # Obtener el usuario y los datos
        usuario = request.user
        # ID del estudio al que pertenece el archivo de resultados
        estudio_id = request.data.get('estudio_id')
        # Tipo de análisis que se está subiendo
        tipo_analisis = request.data.get('tipo_analisis')
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
                {"error": f"Ya existe un archivo {
                    extension} para este estudio y tipo de análisis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guardar el archivo en el servidor
        ruta_archivo = default_storage.save(
            f'resultados/{archivo.name}', archivo)

        # Procesar el archivo CSV o Excel
        if extension == 'csv':
            data = pd.read_csv(default_storage.path(
                ruta_archivo))  # Procesar archivo CSV
        else:  # Excel
            data = pd.read_excel(default_storage.path(
                ruta_archivo))  # Procesar archivo Excel

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
            detalles=f"Archivo {
                archivo.name} cargado exitosamente para el estudio ID {estudio_id}."
        )

        return Response({"message": "Archivo cargado y procesado con éxito."}, status=status.HTTP_201_CREATED)

    except Exception as e:
        # Capturar y registrar el error completo en los logs
        print("Error al procesar el archivo:", str(e))
        traceback.print_exc()
        return Response({"error": f"Error al procesar el archivo: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
# Solo usuarios autenticados pueden cargar archivos
@permission_classes([IsAuthenticated])
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
        ruta_archivo = default_storage.save(
            f'pdfs/{archivo_pdf.name}', archivo_pdf)

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
# Solo usuarios autenticados pueden obtener los estudios
@permission_classes([IsAuthenticated])
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
            resultados_serializados = ArchivoResultadosSerializer(
                resultados, many=True).data

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
            default_storage.save(
                new_file_path, default_storage.open(old_file_path))
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
            detalles=f"Estudio con ID {pk} actualizado: nombre_archivo='{
                nombre_archivo_nuevo}', estado='{estado}'"
        )

        return Response({"message": "Estudio actualizado correctamente."}, status=status.HTTP_200_OK)

    except EstudioPDF.DoesNotExist:
        return Response({"error": "Estudio no encontrado."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"Error al actualizar el estudio: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # views.py


@api_view(['GET'])
@permission_classes([AllowAny])
def get_paises(request):
    paises = Ubicacion.objects.filter(referencia=None)
    serializer = UbicacionSerializer(paises, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_provincias(request, pais_id):
    provincias = Ubicacion.objects.filter(referencia_id=pais_id)
    serializer = UbicacionSerializer(provincias, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_cantones(request, provincia_id):
    cantones = Ubicacion.objects.filter(referencia_id=provincia_id)
    serializer = UbicacionSerializer(cantones, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_distritos(request, canton_id):
    distritos = Ubicacion.objects.filter(referencia_id=canton_id)
    serializer = UbicacionSerializer(distritos, many=True)
    return Response(serializer.data)


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
