from django.db import models


class Personas(models.Model):
    cedula = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=50)
    apellidos = models.CharField(max_length=100)
    correo = models.EmailField(max_length=50, unique=True)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    nacionalidad = models.CharField(max_length=50)

    class Meta:
        db_table = 'personas'  # Especifica el nombre de la tabla existente en la base de datos

    def __str__(self):
        return f"{self.nombre} {self.apellidos}"
