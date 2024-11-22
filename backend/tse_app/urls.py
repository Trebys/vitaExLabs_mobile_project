from django.urls import path
from . import views

urlpatterns = [
    path('obtencion_datos_tse/', views.obtencion_datos_tse,
         name='obtencion_datos_tse'),
]
