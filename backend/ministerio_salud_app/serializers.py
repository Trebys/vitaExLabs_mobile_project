# ministerio_salud_app/serializers.py

from rest_framework import serializers
from .models import DatosSalud


class DatosSaludSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatosSalud
        fields = ['id', 'enfermedad', 'tasa_incidente',
                  'factores_riesgo', 'region', 'año']
