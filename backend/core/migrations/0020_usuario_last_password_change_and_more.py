# Generated by Django 5.1.2 on 2024-10-26 20:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0019_alter_usuario_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='last_password_change',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='usuario',
            name='password_change_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
