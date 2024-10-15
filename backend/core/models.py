from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    role = models.CharField(max_length=50, verbose_name="Rol")

    # Solucionar el conflicto con groups y user_permissions
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_usuario_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_usuario_permissions',
        blank=True
    )


class EstudioPropio(models.Model):
    nombre = models.CharField(max_length=255)
    fecha_creacion = models.DateField(auto_now_add=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)  # Relación con Usuario
    tipo_archivo = models.CharField(max_length=50)
    estado = models.CharField(max_length=50)


class ArchivoCargado(models.Model):
    estudio = models.ForeignKey(EstudioPropio, on_delete=models.CASCADE)  # Relación con EstudioPropio
    nombre_archivo = models.CharField(max_length=255)
    formato = models.CharField(max_length=10)
    ruta = models.CharField(max_length=255)
    fecha_subida = models.DateField(auto_now_add=True)


class EstudioApi(models.Model):
    titulo = models.CharField(max_length=255)
    autores = models.CharField(max_length=255)
    fecha_publicacion = models.DateField()
    url = models.URLField()
    origen = models.CharField(max_length=100)


class Resultados(models.Model):
    estudio = models.ForeignKey(EstudioPropio, on_delete=models.CASCADE)  # Relación con EstudioPropio
    tipo_analisis = models.CharField(max_length=100)
    resultado = models.TextField()
    fecha_analisis = models.DateField(auto_now_add=True)


class VisualizacionDatos(models.Model):
    resultado = models.ForeignKey(Resultados, on_delete=models.CASCADE)  # Relación con Resultados
    tipo_grafico = models.CharField(max_length=50)
    configuracion = models.TextField()
