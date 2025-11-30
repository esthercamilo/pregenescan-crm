# core/views.py
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from api.models.crm import Person, Patient, Doctor, Appointment, ClinicalNote, PatientRecord, PatientSandbox
from api.permissions import CanEditRecord, IsDoctor
from api.serializers import PersonSerializer, PatientSerializer, DoctorSerializer, AppointmentSerializer, \
    ClinicalNoteSerializer, PatientRecordSerializer, PatientSandboxSerializer, DoctorPatientSerializer


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer

    @action(detail=True, methods=['get'], url_path='pacientes')
    def pacientes(self, request, pk=None):
        doctor = self.get_object()
        patients = doctor.patients.all()
        serializer = DoctorPatientSerializer(patients, many=True)
        return Response(serializer.data)


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    @action(detail=False, methods=["get"], url_path="doctor-patients")
    def doctor_patients(self, request):
        doctor_id = request.query_params.get("doctor")
        if not doctor_id:
            return Response({"error": "Doctor ID required"}, status=400)

        # Filtra agendamentos do médico
        appointments = Appointment.objects.filter(doctor_id=doctor_id)

        # Pega IDs únicos de pacientes
        patient_ids = appointments.values_list("patient_id", flat=True).distinct()

        patients = Patient.objects.filter(id__in=patient_ids)
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)


class ClinicalNoteViewSet(viewsets.ModelViewSet):
    queryset = ClinicalNote.objects.all()
    serializer_class = ClinicalNoteSerializer

    def get_queryset(self):
        user = self.request.user

        # Médico → vê apenas notas dos seus pacientes
        if user.groups.filter(name="Doctor").exists():
            doctor = user.doctor
            return ClinicalNote.objects.filter(patient__doctor=doctor)

        # Staff → não vê nada clínico
        if user.groups.filter(name="Staff").exists():
            return ClinicalNote.objects.none()

        # Paciente → vê apenas notas liberadas (para MVP, nenhuma)
        if user.groups.filter(name="Patient").exists():
            return ClinicalNote.objects.none()

        return ClinicalNote.objects.none()

    def perform_create(self, serializer):
        doctor = self.request.user.doctor
        serializer.save(doctor=doctor)


class PatientRecordViewSet(viewsets.ModelViewSet):
    queryset = PatientRecord.objects.all()
    serializer_class = PatientRecordSerializer
    permission_classes = [IsAuthenticated, CanEditRecord]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        user = self.request.user

        if user.groups.filter(name="Médico").exists():
            return PatientRecord.objects.all()

        if user.groups.filter(name="Secretaria").exists():
            # Secretária vê apenas identificação básica
            return PatientRecord.objects.only("id", "patient", "created_at")

        # Paciente vê apenas registros próprios
        return PatientRecord.objects.filter(patient=user)


class PatientSandboxViewSet(viewsets.ModelViewSet):
    queryset = PatientSandbox.objects.all()
    serializer_class = PatientSandboxSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.groups.filter(name="Médico").exists():
            return PatientSandbox.objects.all()

        # paciente só vê própria sandbox
        return PatientSandbox.objects.filter(patient=user)

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)

    def perform_update(self, serializer):
        # médico NÃO pode editar sandbox do paciente
        if self.request.user.groups.filter(name="Médico").exists():
            raise PermissionDenied("Médicos não podem editar o sandbox do paciente.")
        serializer.save()


class PreConsultaView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsDoctor]

    def get(self, request, patient_id):
        # 1. Buscar paciente
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({"error": "Paciente não encontrado."},
                            status=status.HTTP_404_NOT_FOUND)

        # 2. Próximo agendamento do paciente
        now = timezone.now()
        next_appointment = (Appointment.objects
                            .filter(patient=patient, start_time__gte=now)
                            .order_by('start_time')
                            .first())

        # 3. Últimas anotações clínicas
        clinical_notes = (ClinicalNote.objects
                          .filter(patient=patient)
                          .order_by('-created_at')[:5])

        # 4. Dados do sandbox do paciente
        sandbox = (PatientSandbox.objects
                   .filter(patient=patient)
                   .first())

        # 5. Insights mínimos
        insights = []
        if sandbox and sandbox.symptoms:
            if "dor no peito" in sandbox.symptoms.lower():
                insights.append("Atenção: paciente relatou dor torácica recente.")

            if "falta de ar" in sandbox.symptoms.lower():
                insights.append("Sintoma de falta de ar relatado.")

        # 6. Montar resposta
        response_data = {
            "patient": PatientSerializer(patient).data,
            "next_appointment": (AppointmentSerializer(next_appointment).data
                                 if next_appointment else None),
            "last_clinical_notes": ClinicalNoteSerializer(clinical_notes, many=True).data,
            "sandbox_data": (PatientSandboxSerializer(sandbox).data
                             if sandbox else None),
            "insights": insights,
        }

        return Response(response_data, status=status.HTTP_200_OK)


