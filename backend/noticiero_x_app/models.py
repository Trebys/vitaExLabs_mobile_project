# noticiero_x_app/models.py

from django.db import models


class Noticia(models.Model):
    id = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255)
    contenido = models.TextField()
    fecha_publicacion = models.DateField()
    # Ajusta el tipo de dato si es necesario
    categoria = models.CharField(max_length=100)

    class Meta:
        managed = False  # Evita que Django intente crear migraciones para esta tabla
        db_table = 'noticias'  # Nombre exacto de la tabla en la base de datos
