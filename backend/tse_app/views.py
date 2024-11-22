from django.http import JsonResponse
from .models import Personas


def obtencion_datos_tse(request):
    email = request.GET.get('email', None)
    if email:
        try:
            persona = Personas.objects.get(correo=email)
            data = {
                "nombre": persona.nombre,
                "apellidos": persona.apellidos,
            }
            return JsonResponse(data, status=200)
        except Personas.DoesNotExist:
            return JsonResponse({"error": "No existe una persona con ese correo."}, status=404)
    return JsonResponse({"error": "Correo no proporcionado."}, status=400)
