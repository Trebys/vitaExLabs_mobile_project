# database_router.py

class BancoXRouter:
    route_app_labels = {'banco_x_app'}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'banco_x'
        return None

    def db_for_write(self, model, **hints):
        return None  # Solo lectura para bases de datos externas

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == 'default'  # Solo migraciones en la base de datos principal


class NoticieroXRouter:
    route_app_labels = {'noticiero_x_app'}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'noticiero_x'
        return None

    def db_for_write(self, model, **hints):
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == 'default'


class TSERouter:
    route_app_labels = {'tse_app'}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'tse'
        return None

    def db_for_write(self, model, **hints):
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == 'default'


class UniversidadXRouter:
    route_app_labels = {'universidad_x_app'}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'universidad_x'
        return None

    def db_for_write(self, model, **hints):
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == 'default'


class MinisterioSaludRouter:
    route_app_labels = {'ministerio_salud_app'}

    def db_for_read(self, model, **hints):
        if model._meta.app_label in self.route_app_labels:
            return 'ministerio_salud'
        return None

    def db_for_write(self, model, **hints):
        return None

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == 'default'
