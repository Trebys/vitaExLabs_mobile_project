from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from two_factor.urls import urlpatterns as tf_urls
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),  # Incluye las rutas de la app 'core'
    path('account/', include(tf_urls)),  # Ruta estándar para 2FA
    # Incluir rutas de banco_x_app en español
    path('api/banco_x/', include('banco_x_app.urls')),
    # Para que los archivos sean accesibles desde el frontend
    path('api/tse/', include('tse_app.urls')),
    path('api/noticiero_x/', include('noticiero_x_app.urls')),
    path('api/universidad_x/', include('universidad_x_app.urls')),
    path('api/ministerio_salud/', include('ministerio_salud_app.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
