# Generated by Django 5.1.2 on 2024-10-29 17:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0024_usuario_is_for_login'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='favorite_color',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Color Favorito'),
        ),
        migrations.AddField(
            model_name='usuario',
            name='pets_name',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='Nombre de Mascota'),
        ),
    ]
