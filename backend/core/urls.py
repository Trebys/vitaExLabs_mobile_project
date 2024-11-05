from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsuarioViewSet,
    EstudioPDFViewSet,
    EstudioApiViewSet,
    ArchivoResultadosViewSet,
    VisualizacionDatosViewSet,
    register_user,
    get_user_data,
    logout_user,
    upload_result_file,
    upload_pdf,
    get_studies_with_results,
    edit_study,
    password_policy,
    custom_obtain_auth_token,
    recover_account,
    verify_code,
    change_password,
    validate_security_question,
    get_paises,
    get_provincias,
    get_cantones,
    get_distritos,
    email_and_code_verification,

)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'estudio-pdf', EstudioPDFViewSet, basename='estudiopdf')
router.register(r'estudios-api', EstudioApiViewSet, basename='estudioapi')
router.register(r'archivo-resultados', ArchivoResultadosViewSet,
                basename='archivoresultados')
router.register(r'visualizacion-datos', VisualizacionDatosViewSet,
                basename='visualizaciondatos')

urlpatterns = [
    path('token-auth/', custom_obtain_auth_token,
         name='custom_token_auth'),  # Inicio de sesión con bloqueo
    path('register/', register_user, name='register'),  # Registro de usuario

    path('paises/', get_paises,
         name='get_paises'),  # Nueva ruta para países
    path('provincias/<int:pais_id>',
         get_provincias, name='get_provincias'),
    path('cantones/<int:provincia_id>',
         get_cantones, name='get_cantones'),
    path('distritos/<int:canton_id>',
         get_distritos, name='get_distritos'),
    # Otras rutas

    path('email-and-code-verification/', email_and_code_verification,
         name='email_and_code_verification'),  # Verificación de correo y código
    path('password-policy/', password_policy,
         name='password_policy'),  # Política de contraseñas
    # Obtener datos del usuario
    path('user/', get_user_data, name='get_user_data'),
    path('recover-account/', recover_account, name='recover_account'),
    path('verify-code/', verify_code, name='verify_code'),
    path('validate-security-question/', validate_security_question,
         name='validate-security-question'),
    path('change-password/', change_password, name='change_password'),
    path('logout/', logout_user, name='logout'),  # Cerrar sesión
    path('upload-result-file/', upload_result_file,
         name='upload_file'),  # Subir archivos de resultados
    path('upload-pdf/', upload_pdf, name='upload_pdf'),  # Subir PDF
    path('get-studies-with-results/', get_studies_with_results,
         name='get_studies_with_results'),  # Obtener estudios y resultados
    path('edit-study/<int:pk>/', edit_study,
         name='edit-study'),  # Editar estudio
    # Incluye los viewsets registrados en el router
    path('', include(router.urls)),

]
