# banco_x_app/models.py
from django.db import models


class Usuario(models.Model):
    nombre = models.CharField(max_length=50)
    apellidos = models.CharField(max_length=50)
    correo = models.EmailField(unique=True)

    class Meta:
        db_table = 'usuarios'  # Nombre exacto de la tabla en la base de datos
        # No queremos que Django intente crear o modificar esta tabla en la base de datos
        managed = False

    def __str__(self):
        return f'{self.nombre} {self.apellidos}'


class Tarjeta(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    numero_tarjeta = models.CharField(max_length=16, unique=True)
    # Nuevo campo para el mes de vencimiento
    mes_vencimiento = models.IntegerField()
    # Nuevo campo para el año de vencimiento
    anio_vencimiento = models.IntegerField()
    cvv = models.CharField(max_length=3)
    saldo = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    class Meta:
        db_table = 'tarjetas'
        managed = False

    def __str__(self):
        return f'{self.numero_tarjeta} - Saldo: {self.saldo}'


class Transaccion(models.Model):
    tarjeta = models.ForeignKey(Tarjeta, on_delete=models.SET_NULL, null=True)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    descripcion = models.CharField(max_length=255)
    estado = models.CharField(max_length=20, default='PENDING')
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'transacciones'
        managed = False

    def __str__(self):
        return f'Transacción {self.id} - Estado: {self.estado}'
