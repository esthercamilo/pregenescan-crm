from django.contrib.auth.models import User
from django.db import models

from api.services.s3_service import S3Service
from api.services.storages import MediaStorage


class Party(models.Model):
    is_company = models.BooleanField(default=False)


class Person(models.Model):
    party = models.OneToOneField(Party, on_delete=models.CASCADE)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    fullname = models.CharField(max_length=200, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, null=True, blank=True)
    fileserver_path = models.CharField(max_length=255, null=True, blank=True)

    # Campos médicos se aplicam só a pessoas físicas
    # Por isso eles ficam aqui e não no Party
    def create_client_folder(self):
        s3 = S3Service()
        folder = f"persons/{self.id}"
        s3.create_folder(folder)
        return folder

    def save(self, *args, **kwargs):
        creating = self._state.adding
        super().save(*args, **kwargs)

        if creating and not self.fileserver_path:
            folder = self.create_client_folder()
            self.fileserver_path = folder
            super().save(update_fields=["fileserver_path"])


class Company(models.Model):
    party = models.OneToOneField(Party, on_delete=models.CASCADE)
    cnpj = models.CharField(max_length=20, unique=True)
    legal_name = models.CharField(max_length=255)


class Phone(models.Model):
    party = models.ForeignKey(Party, on_delete=models.CASCADE, related_name="phones")
    number = models.CharField(max_length=20)


class Email(models.Model):
    party = models.ForeignKey(Party, on_delete=models.CASCADE, related_name='party_email')
    email = models.CharField(max_length=200)


class Address(models.Model):
    party = models.ForeignKey(Party, on_delete=models.CASCADE)
    street = models.CharField(max_length=255)
    number = models.CharField(max_length=20, null=True, blank=True)
    district = models.CharField(max_length=100, null=True, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=20)
    is_primary = models.BooleanField(default=False)


class Document(models.Model):
    party = models.ForeignKey(Party, on_delete=models.CASCADE)
    doc_type = models.CharField(max_length=50, choices=[
        ("cpf", "CPF"),
        ("rg", "RG"),
        ("crm", "CRM"),
        ("cnpj", "CNPJ"),
        ("contract", "Contract"),
    ])
    value = models.CharField(max_length=100)
    file = models.FileField(storage=MediaStorage(), upload_to="person_docs/")
    uploaded_at = models.DateTimeField(auto_now_add=True)


class Patient(models.Model):
    person = models.OneToOneField(Person, on_delete=models.CASCADE)
    medical_record_number = models.CharField(max_length=30, unique=True)
    health_insurance = models.CharField(max_length=100, null=True, blank=True)


class Doctor(models.Model):
    person = models.OneToOneField(Person, on_delete=models.CASCADE)
    crm = models.CharField(max_length=20)
    specialty = models.CharField(max_length=100)
    patients = models.ManyToManyField('Patient', related_name='doctors', blank=True)


class Staff(models.Model):
    person = models.OneToOneField(Person, on_delete=models.CASCADE)


class Appointment(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name="appointments")
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="appointments")

    date = models.DateField()
    start_time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=[
            ("marcado", "Marcado"),
            ("cancelado", "Cancelado"),
            ("finalizado", "Finalizado")
        ],
        default="marcado"
    )

    notes = models.TextField(null=True, blank=True)

    class Meta:
        # evita marcar o mesmo horário 2x
        unique_together = ("doctor", "date", "start_time")
        ordering = ("date", "start_time")

    def __str__(self):
        return f"{self.date} {self.start_time} - Dr(a). {self.doctor.person.fullname}"


class ClinicalNote(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="clinical_notes")
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name="clinical_notes")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class PatientRecord(models.Model):
    patient = models.ForeignKey(User, related_name="patient_records", on_delete=models.CASCADE)
    author = models.ForeignKey(User, related_name="created_records", on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Campos clínicos básicos
    complaint = models.TextField(blank=True)        # Queixa / apresentação
    history = models.TextField(blank=True)          # História clínica
    notes = models.TextField(blank=True)            # Anotações do médico
    vitals = models.JSONField(blank=True, null=True)  # JSON para flexibilidade (pressão, FC, etc)
    attachments = models.JSONField(blank=True, null=True)  # arquivos futuros

    def __str__(self):
        return f"Prontuário de {self.patient} - {self.created_at:%d/%m/%Y}"


class PatientSandbox(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    updated_at = models.DateTimeField(auto_now=True)

    # Campos exploratórios (livres)
    symptoms = models.JSONField(null=True, blank=True)
    vitals = models.JSONField(null=True, blank=True)
    calculators = models.JSONField(null=True, blank=True)   # resultados tipo MDCalc
    genomic = models.JSONField(null=True, blank=True)        # fenogenômica, riscos
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"Sandbox de {self.patient}"
