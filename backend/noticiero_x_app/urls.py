# noticiero_x_app/urls.py

from django.urls import path
from .views import lista_noticias

urlpatterns = [
    path('obtener_noticias/', lista_noticias, name='lista_noticias'),
]
