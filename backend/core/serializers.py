from rest_framework import serializers
from .models import Usuario, EstudioPDF, EstudioApi, ArchivoResultados, VisualizacionDatos
from .utils import decrypt_data

# Serializador para el modelo Usuario
class UsuarioSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()  # Desencripta el correo al mostrarlo
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = [
            'id', 'first_name', 'username', 'last_name', 'email', 'role', 
            'password', 'date_joined', 'password_change_date', 'favorite_color', 'pets_name'
        ]

    def get_email(self, obj):
        """Desencripta el correo antes de devolverlo."""
        return decrypt_data(obj.email)

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

# Serializador para el modelo EstudioPDF
class EstudioPDFSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField()  # Para mostrar el nombre del usuario, puedes cambiar esto según tus necesidades

    class Meta:
        model = EstudioPDF
        fields = ['id', 'nombre_archivo', 'ruta', 'estado', 'fecha_subida', 'usuario']  # Agregamos 'usuario'

# Serializador para el modelo EstudioApi
class EstudioApiSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstudioApi
        fields = ['id', 'titulo', 'autores', 'fecha_publicacion', 'url', 'origen']

# Serializador para el modelo ArchivoResultados (antes Resultados)
class ArchivoResultadosSerializer(serializers.ModelSerializer):
    estudio = serializers.PrimaryKeyRelatedField(queryset=EstudioPDF.objects.all())  # Serializamos el estudio completo o solo el ID si prefieres

    class Meta:
        model = ArchivoResultados
        fields = ['id', 'tipo_analisis', 'ruta', 'fecha_analisis', 'estudio']  # Incluimos 'estudio' para mostrar la relación

# Serializador para el modelo VisualizacionDatos
class VisualizacionDatosSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisualizacionDatos
        fields = ['id', 'resultado', 'tipo_grafico', 'configuracion']
