# Generated by Django 5.1.2 on 2024-10-24 18:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_datosestandarizados_prueba'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='datosestandarizados',
            name='prueba',
        ),
    ]
