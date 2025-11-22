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


class Staff(models.Model):
    person = models.OneToOneField(Person, on_delete=models.CASCADE)
