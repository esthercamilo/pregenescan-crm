# core/views.py
from django.http import JsonResponse
from rest_framework import viewsets

from api.models.crm import Person, Patient
from api.serializers import PersonSerializer, PatientSerializer


class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
