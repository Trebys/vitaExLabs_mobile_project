# Generated by Django 5.1.2 on 2024-10-29 17:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0025_usuario_favorite_color_usuario_pets_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usuario',
            name='favorite_color',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='pets_name',
            field=models.TextField(blank=True, null=True),
        ),
    ]
