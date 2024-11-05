from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .utils import encrypt_data, decrypt_data  # Importa las funciones
# Modelo de usuario personalizado
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .utils import encrypt_data, decrypt_data  # Importa las funciones
from django.db.models import JSONField


class Ubicacion(models.Model):
    cod_ubicacion = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    referencia = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.CASCADE, related_name='sub_ubicaciones')

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'ubicaciones'


class Usuario(AbstractUser):
    role = models.CharField(max_length=50, verbose_name="Rol")
    last_password_change = models.DateTimeField(
        null=True, blank=True)  # Fecha del último cambio de contraseña
    # Fecha de la próxima renovación de contraseña
    password_change_date = models.DateTimeField(null=True, blank=True)
    # Cambiado de CharField a TextField para manejar la longitud en la encriptación
    email = models.TextField(unique=True)
    verify_code = models.CharField(max_length=255, null=True, blank=True)
    verify_code_created = models.DateTimeField(null=True, blank=True)
    # Indica si el código es para login o cambio de contraseña
    is_for_login = models.BooleanField(default=False)
    failed_attempts = models.IntegerField(default=0)
    is_locked = models.BooleanField(default=False)
# Campos para preguntas de seguridad
    favorite_color = models.TextField(
        null=True, blank=True)  # Cambiado a TextField
    pets_name = models.TextField(null=True, blank=True)
    # Campo JSON para la ubicación
    ubicacion_json = JSONField(null=True, blank=True)

    # REVISAR SU FUNCIONAMIENTO

    def save(self, *args, **kwargs):
        if self.verify_code and not self.verify_code.startswith('gAAAAA'):
            self.verify_code = encrypt_data(self.verify_code)
        if self.email and not self.email.startswith('gAAAAA'):
            self.email = encrypt_data(self.email)
        super().save(*args, **kwargs)

    def set_password_change_date(self):
        self.last_password_change = timezone.now()
        self.password_change_date = self.last_password_change + \
            timedelta(days=90)

    def is_password_expired(self):
        return timezone.now() > self.password_change_date

    # REVISAR SU FUNCIONAMIENTO
    def disable_main_password(self):
        """Temporarily disable the main password by setting it to None."""
        self.set_unusable_password()
    # REVISAR SU FUNCIONAMIENTO

    def enable_new_password(self, new_password):
        """Enable a new password, replacing the temporary password."""
        self.set_password(new_password)
        self.verify_code = None  # Clear the verification code
        self.set_password_change_date()
        self.save(update_fields=['password', 'verify_code',
                  'last_password_change', 'password_change_date'])

    def get_decrypted_email(self):
        try:
            return decrypt_data(self.email)
        except Exception as e:
            print(f"Error al desencriptar el correo: {e}")
            return None

    def get_decrypted_verify_code(self):
        if self.verify_code:
            try:
                return decrypt_data(self.verify_code)
            except Exception as e:
                print(f"Error al desencriptar el código de verificación: {e}")
        return None


class AuditoriaUsuario(models.Model):
    # Permitir valores nulos y omitir el campo usuario si no está disponible
    usuario = models.ForeignKey(
        Usuario, on_delete=models.CASCADE, verbose_name="Usuario", null=True, blank=True)
    accion = models.CharField(max_length=255, verbose_name="Acción")
    fecha_hora = models.DateTimeField(
        auto_now_add=True, verbose_name="Fecha y Hora")
    detalles = models.TextField(null=True, blank=True, verbose_name="Detalles")

    def __str__(self):
        return f"Auditoría: {self.usuario.username if self.usuario else 'N/A'} - {self.accion} en {self.fecha_hora}"


# Modelo para los estudios almacenados en PDF
class EstudioPDF(models.Model):
    # Relación con el usuario
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    nombre_archivo = models.CharField(max_length=255)  # Nombre del archivo PDF
    # Ruta del archivo PDF en el servidor
    ruta = models.CharField(max_length=500)
    # Estado del estudio (activo, inactivo, etc.)
    estado = models.CharField(max_length=50)
    # Fecha de subida del archivo
    fecha_subida = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Estudio PDF: {self.nombre_archivo} (Subido por {self.usuario.username})"

# Modelo para estudios API externos


class EstudioApi(models.Model):
    titulo = models.CharField(max_length=255)
    autores = models.CharField(max_length=255)
    fecha_publicacion = models.DateField()
    url = models.URLField()
    origen = models.CharField(max_length=100)

    def __str__(self):
        return f"API Estudio: {self.titulo}"

# Modelo para almacenar resultados de estudios (CSV/Excel)


class ArchivoResultados(models.Model):
    # Relación con la tabla de estudios PDF
    estudio = models.ForeignKey(EstudioPDF, on_delete=models.CASCADE)
    tipo_analisis = models.CharField(max_length=100)
    ruta = models.CharField(max_length=255, blank=True,
                            null=True)  # Ruta del archivo CSV/Excel
    # Almacena el contenido procesado del archivo
    contenido = models.JSONField(blank=True, null=True)
    fecha_analisis = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Resultados para {self.estudio.nombre_archivo} - {self.tipo_analisis}"

# Modelo para la visualización de los datos analizados


class VisualizacionDatos(models.Model):
    resultado = models.ForeignKey(
        ArchivoResultados, on_delete=models.CASCADE)  # Relación con Resultados
    tipo_grafico = models.CharField(max_length=50)
    configuracion = models.TextField()

    def __str__(self):
        return f"Visualización de {self.tipo_grafico} para {self.resultado.estudio.nombre_archivo}"

# Modelo para almacenar datos estandarizados del archivo


class DatosEstandarizados(models.Model):
    # Relación con ArchivoResultados
    archivo = models.ForeignKey(ArchivoResultados, on_delete=models.CASCADE)
    # Encabezados del archivo procesado (formato flexible)
    encabezados = models.JSONField()
    # Contenido del archivo estandarizado en formato JSON
    contenido = models.JSONField()
    fecha_procesamiento = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Datos estandarizados para {self.archivo.estudio.nombre_archivo}"
