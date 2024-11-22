# ministerio_salud_app/urls.py

from django.urls import path
from .views import DatosSaludListView

urlpatterns = [
    path('obtencion_datos/',
         DatosSaludListView.as_view(), name='datos-salud-list'),
]
