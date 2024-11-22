from django.db import models


class Estudiante(models.Model):
    nombre = models.CharField(max_length=100)
    identificador_universitario = models.CharField(max_length=50, unique=True)
    carrera = models.CharField(max_length=100)
    nivel_academico = models.CharField(max_length=50)
    fecha_graduacion = models.DateField()
    correo = models.EmailField(max_length=100, unique=True)

    class Meta:
        managed = False  # Evita que Django intente crear migraciones para esta tabla
        db_table = 'estudiantes'  # Nombre exacto de la tabla en la base de datos

    def __str__(self):
        return self.nombre
