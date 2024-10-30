from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re

class CustomPasswordValidator:
    def validate(self, password, user=None):
        # Longitud entre 8 y 14 caracteres
        if len(password) < 8 or len(password) > 14:
            raise ValidationError(
                _("La contraseña debe tener entre 8 y 14 caracteres.")
            )

        # Verificar que tenga mayúsculas, minúsculas y caracteres especiales
        if not re.search(r'[A-Z]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos una letra mayúscula.")
            )
        if not re.search(r'[a-z]', password):
            raise ValidationError(
                _("La contraseña debe contener al menos una letra minúscula.")
            )
        if not re.search(r'\W', password):
            raise ValidationError(
                _("La contraseña debe contener al menos un carácter especial.")
            )

        # Verificar que no tenga caracteres repetidos
        if len(set(password)) != len(password):
            raise ValidationError(
                _("La contraseña no debe tener caracteres repetidos.")
            )

    def get_help_text(self):
        return _(
            "Tu contraseña debe tener entre 8 y 14 caracteres, incluir al menos una letra mayúscula, una letra minúscula, un carácter especial y no debe tener caracteres repetidos."
        )
