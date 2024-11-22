# noticiero_x_app/views.py

from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Noticia
from .serializers import NoticiaSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import permission_classes


@api_view(['GET'])
@permission_classes([AllowAny])
def lista_noticias(request):
    noticias = Noticia.objects.all().order_by('-fecha_publicacion')
    serializer = NoticiaSerializer(noticias, many=True)
    return Response(serializer.data)
