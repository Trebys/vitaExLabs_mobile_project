# Generated by Django 5.1.2 on 2024-10-27 18:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0021_rename_temp_password_usuario_verify_code_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usuario',
            name='lock_until',
        ),
    ]
