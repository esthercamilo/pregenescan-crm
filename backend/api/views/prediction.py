# core/views.py
from django.http import JsonResponse
from rest_framework import viewsets

from api.services.prediction import neighbors


class PersonViewSet(viewsets.ModelViewSet):
    def get(self, request):
        return JsonResponse({'status': "Sucesso"})


class PredictViewSet(viewsets.ModelViewSet):
    def post(self, request, ens_gene_id):
        # result = neighbors('ENSG00000000419')
        result = neighbors(ens_gene_id)
        return JsonResponse(result)
