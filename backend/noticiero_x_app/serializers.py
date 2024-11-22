# noticiero_x_app/serializers.py

from rest_framework import serializers
from .models import Noticia


class NoticiaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Noticia
        fields = ['id', 'titulo', 'contenido',
                  'fecha_publicacion', 'categoria']
