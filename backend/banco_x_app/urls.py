# banco_x_app/urls.py
from django.urls import path
from .views import ProcessPaymentView, TransactionStatusView, UpgradeUserView

urlpatterns = [
    path('procesar_pago/', ProcessPaymentView.as_view(),
         name='procesar_pago'),  # Procesa un pago
    path('estado_transaccion/<int:transaction_id>/', TransactionStatusView.as_view(),
         name='estado_transaccion'),  # Consulta el estado de una transacción
    path('actualizar_usuario_premium/', UpgradeUserView.as_view(),
         name='actualizar_usuario_premium'),  # Actualiza un usuario a premium

]
