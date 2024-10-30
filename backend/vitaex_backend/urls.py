from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from two_factor.urls import urlpatterns as tf_urls
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')), # Incluye las rutas de la app 'core'
    path('account/', include(tf_urls)),  # Ruta estándar para 2FA
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) #Para que los archivos sean accesibles desde el frontend
