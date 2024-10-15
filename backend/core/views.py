from rest_framework import viewsets
from .models import Usuario, EstudioPropio, ArchivoCargado, EstudioApi, Resultados, VisualizacionDatos
from .serializers import (
    UsuarioSerializer,
    EstudioPropioSerializer,
    ArchivoCargadoSerializer,
    EstudioApiSerializer,
    ResultadosSerializer,
    VisualizacionDatosSerializer,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# ViewSet para el modelo Usuario
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

# ViewSet para el modelo EstudioPropio
class EstudioPropioViewSet(viewsets.ModelViewSet):
    queryset = EstudioPropio.objects.all()
    serializer_class = EstudioPropioSerializer
    permission_classes = [IsAuthenticated]

# ViewSet para el modelo ArchivoCargado
class ArchivoCargadoViewSet(viewsets.ModelViewSet):
    queryset = ArchivoCargado.objects.all()
    serializer_class = ArchivoCargadoSerializer
    permission_classes = [IsAuthenticated]

# ViewSet para el modelo EstudioApi
class EstudioApiViewSet(viewsets.ModelViewSet):
    queryset = EstudioApi.objects.all()
    serializer_class = EstudioApiSerializer
    permission_classes = [IsAuthenticated]

# ViewSet para el modelo Resultados
class ResultadosViewSet(viewsets.ModelViewSet):
    queryset = Resultados.objects.all()
    serializer_class = ResultadosSerializer
    permission_classes = [IsAuthenticated]

# ViewSet para el modelo VisualizacionDatos
class VisualizacionDatosViewSet(viewsets.ModelViewSet):
    queryset = VisualizacionDatos.objects.all()
    serializer_class = VisualizacionDatosSerializer
    permission_classes = [IsAuthenticated]
