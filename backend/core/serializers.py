from rest_framework import serializers
from .models import Usuario, EstudioPropio, ArchivoCargado, EstudioApi, Resultados, VisualizacionDatos

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'password', 'date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario(**validated_data)
        user.set_password(password)  # Encriptar la contraseña
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)  # Encriptar la nueva contraseña
        return super().update(instance, validated_data)

# Serializador para el modelo EstudioPropio
class EstudioPropioSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstudioPropio
        fields = ['id', 'nombre', 'fecha_creacion', 'usuario', 'tipo_archivo', 'estado']

# Serializador para el modelo ArchivoCargado
class ArchivoCargadoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArchivoCargado
        fields = ['id', 'estudio', 'nombre_archivo', 'formato', 'ruta', 'fecha_subida']

# Serializador para el modelo EstudioApi
class EstudioApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstudioApi
        fields = ['id', 'titulo', 'autores', 'fecha_publicacion', 'url', 'origen']

# Serializador para el modelo Resultados
class ResultadosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resultados
        fields = ['id', 'estudio', 'tipo_analisis', 'resultado', 'fecha_analisis']

# Serializador para el modelo VisualizacionDatos
class VisualizacionDatosSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisualizacionDatos
        fields = ['id', 'resultado', 'tipo_grafico', 'configuracion']
