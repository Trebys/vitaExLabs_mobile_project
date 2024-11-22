from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Estudiante
from .serializers import EstudianteSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import permission_classes


@api_view(['GET'])
@permission_classes([AllowAny])
def consultar_estudiante(request):
    correo = request.query_params.get('correo')
    try:
        estudiante = Estudiante.objects.get(correo=correo)
        serializer = EstudianteSerializer(estudiante)
        return Response(serializer.data)
    except Estudiante.DoesNotExist:
        return Response({'error': 'Estudiante no encontrado'}, status=404)
