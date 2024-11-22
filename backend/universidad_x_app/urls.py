from django.urls import path
from .views import consultar_estudiante

urlpatterns = [
    path('consultar_estudiante/', consultar_estudiante,
         name='consultar_estudiante'),
]
