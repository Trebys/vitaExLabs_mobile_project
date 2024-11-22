# banco_x_app/views.py
from django.shortcuts import render
# banco_x_app/views.py
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Usuario, Tarjeta, Transaccion
from .serializers import TarjetaSerializer, TransaccionSerializer
from decimal import Decimal  # Importar Decimal para conversiones
from datetime import datetime


class ProcessPaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Datos recibidos de la solicitud
        correo_usuario = request.data.get("correo")
        nombre_usuario = request.data.get("nombre")
        apellidos_usuario = request.data.get("apellidos")
        numero_tarjeta = request.data.get("numero_tarjeta")
        cvv = request.data.get("cvv")
        mes_vencimiento = int(request.data.get("mes_vencimiento"))
        anio_vencimiento = int(request.data.get("anio_vencimiento"))
        monto = Decimal(request.data.get("monto"))  # Convertir monto a Decimal
        descripcion = request.data.get("descripcion", "Transacción en Banco X")

        try:
            # Verificar si el usuario existe por correo
            usuario = Usuario.objects.using(
                'banco_x').get(correo=correo_usuario)

            # Verificar si los nombres y apellidos coinciden con el usuario
            if usuario.nombre != nombre_usuario or usuario.apellidos != apellidos_usuario:
                return Response({"error": "Datos del usuario no coinciden."}, status=status.HTTP_400_BAD_REQUEST)

            # Verificar si la tarjeta está asociada al usuario y si los datos son correctos
            tarjeta = Tarjeta.objects.using('banco_x').get(
                usuario=usuario,
                numero_tarjeta=numero_tarjeta,
                cvv=cvv
            )

            # Verificar si la tarjeta está vencida
            current_date = datetime.now()
            if anio_vencimiento < current_date.year or (anio_vencimiento == current_date.year and mes_vencimiento < current_date.month):
                return Response({"error": "La tarjeta está vencida."}, status=status.HTTP_400_BAD_REQUEST)

            # Verificar si la tarjeta tiene saldo suficiente
            if tarjeta.saldo >= monto:
                # Actualizar saldo de la tarjeta
                tarjeta.saldo -= monto
                tarjeta.save(using='banco_x')

                # Crear una transacción exitosa
                transaccion = Transaccion.objects.using('banco_x').create(
                    tarjeta=tarjeta,
                    monto=monto,
                    descripcion=descripcion,
                    estado="SUCCESS"
                )
                return Response(TransaccionSerializer(transaccion).data, status=status.HTTP_201_CREATED)
            else:
                # Crear una transacción fallida por saldo insuficiente
                transaccion = Transaccion.objects.using('banco_x').create(
                    tarjeta=tarjeta,
                    monto=monto,
                    descripcion=descripcion,
                    estado="FAILED"
                )
                return Response({"error": "Saldo insuficiente"}, status=status.HTTP_400_BAD_REQUEST)

        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Tarjeta.DoesNotExist:
            return Response({"error": "Tarjeta no válida o datos incorrectos"}, status=status.HTTP_404_NOT_FOUND)


# REVISAR SI LAS NECESITO
class TransactionStatusView(APIView):
    permission_classes = [AllowAny]  # Permitir acceso sin autenticación

    def get(self, request, transaction_id):
        try:
            # Obtener el estado de la transacción usando el ID
            transaccion = Transaccion.objects.using(
                'banco_x').get(id=transaction_id)
            return Response(TransaccionSerializer(transaccion).data, status=status.HTTP_200_OK)
        except Transaccion.DoesNotExist:
            return Response({"error": "Transacción no encontrada"}, status=status.HTTP_404_NOT_FOUND)


class UpgradeUserView(APIView):
    permission_classes = [AllowAny]  # Permitir acceso sin autenticación

    def post(self, request):
        # Obtener el correo del usuario desde la solicitud
        correo_usuario = request.data.get("correo")

        try:
            # Obtener el usuario por correo
            usuario = Usuario.objects.using(
                'banco_x').get(correo=correo_usuario)

            # Actualizar el usuario a premium (aquí podemos agregar una lógica específica en el futuro)
            return Response({"message": f"El usuario {usuario.nombre} ha sido actualizado a premium"}, status=status.HTTP_200_OK)

        except Usuario.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
