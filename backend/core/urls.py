from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    UsuarioViewSet,
    EstudioPropioViewSet,
    ArchivoCargadoViewSet,
    EstudioApiViewSet,
    ResultadosViewSet,
    VisualizacionDatosViewSet,
)

# Crea un router que manejará todas las rutas del API
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'estudios-propios', EstudioPropioViewSet, basename='estudiopropio')
router.register(r'archivos-cargados', ArchivoCargadoViewSet, basename='archivocargado')
router.register(r'estudios-api', EstudioApiViewSet, basename='estudioapi')
router.register(r'resultados', ResultadosViewSet, basename='resultado')
router.register(r'visualizacion-datos', VisualizacionDatosViewSet, basename='visualizaciondatos')

urlpatterns = [
    path('token-auth/', obtain_auth_token, name='token_auth'),  # URL para obtener el token
    path('', include(router.urls)),  # Incluye todas las rutas gestionadas por el router
]
