from rest_framework import serializers
from .models import Estudiante


class EstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiante
        fields = ['nombre', 'identificador_universitario', 'carrera',
                  'nivel_academico', 'fecha_graduacion', 'correo']
