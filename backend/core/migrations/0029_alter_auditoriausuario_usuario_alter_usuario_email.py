# Generated by Django 5.1.2 on 2024-11-04 22:31

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0028_remove_usuario_ubicacion_usuario_ubicacion_json'),
    ]

    operations = [
        migrations.AlterField(
            model_name='auditoriausuario',
            name='usuario',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Usuario'),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='email',
            field=models.TextField(unique=True),
        ),
    ]