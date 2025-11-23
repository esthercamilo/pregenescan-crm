import os
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from api.views.admin import UserRoleView, StaffUserCreateView
from api.views.crm import PersonViewSet, PatientViewSet, DoctorViewSet, AppointmentViewSet, ClinicalNoteViewSet, \
    PatientRecordViewSet, PatientSandboxViewSet, PreConsultaView

url = os.environ.get("URL")

schema_view = get_schema_view(
    openapi.Info(
        title="API PreGeneScan",
        default_version='v1',
        description="API ",
        contact=openapi.Contact(email="esthercamilo@gmail.com"),
    ),
    url=url,
    public=True,
    permission_classes=[permissions.AllowAny, ],
    authentication_classes=[],
)

router = DefaultRouter()
router.register(r'person', PersonViewSet, basename='person')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'appointments', AppointmentViewSet, basename="agenda")
router.register(r'clinical-notes', ClinicalNoteViewSet, basename="notas")
router.register(r"records", PatientRecordViewSet, basename="record")
router.register(r"sandbox", PatientSandboxViewSet, basename="sandbox")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls'), name='rest_framework_transaction'),

    path('api/', include(router.urls)),

    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # 2. Rota para renovar o token (boa prática para produção)
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/role/', UserRoleView.as_view(), name='user_role'),

    path('api/staff/create/', StaffUserCreateView.as_view(), name='create_staff_user'),
    path("api/preconsulta/<int:patient_id>/", PreConsultaView.as_view()),
    # path('person/', PersonViewSet.as_view({'get': 'get'}), name='person_view'),
    # path('metab/predict_neighbor/<ens_gene_id>/', PredictViewSet.as_view({'post': 'post'}), name='metab_predict_view'),

]
