from django.shortcuts import render
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import permission_classes
# ministerio_salud_app/views.py

from rest_framework import generics
from .models import DatosSalud
from .serializers import DatosSaludSerializer


@permission_classes([AllowAny])
class DatosSaludListView(generics.ListAPIView):
    queryset = DatosSalud.objects.all()
    serializer_class = DatosSaludSerializer
