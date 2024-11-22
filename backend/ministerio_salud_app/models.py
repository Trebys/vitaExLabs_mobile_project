# ministerio_salud_app/models.py

from django.db import models


class DatosSalud(models.Model):
    enfermedad = models.CharField(max_length=100)
    tasa_incidente = models.DecimalField(max_digits=5, decimal_places=2)
    factores_riesgo = models.TextField()
    region = models.CharField(max_length=100)
    año = models.IntegerField()

    class Meta:
        managed = False  # Evita que Django intente crear migraciones para esta tabla
        db_table = 'datos_salud'  # Nombre exacto de la tabla en la base de datos

    def __str__(self):
        return f"{self.enfermedad} - {self.region} ({self.año})"
