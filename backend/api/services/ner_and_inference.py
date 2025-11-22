# project/settings.py (trecho relevante)
"""
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'drf_yasg',
    'phenogen',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'rest_framework.schemas.coreapi.AutoSchema',
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
"""


# phenogen/models.py
"""
from django.db import models

class Patient(models.Model):
    name = models.CharField(max_length=200, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Exam(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='exams')
    original_filename = models.CharField(max_length=512)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    raw_text = models.TextField(null=True, blank=True)

class InferredGene(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='genes')
    gene_symbol = models.CharField(max_length=50)
    score = models.FloatField(default=0.0)
    evidence = models.JSONField(null=True, blank=True)

class Report(models.Model):
    exam = models.OneToOneField(Exam, on_delete=models.CASCADE, related_name='report')
    generated_at = models.DateTimeField(auto_now_add=True)
    content = models.JSONField()  # resumo estruturado do relatório
"""


# phenogen/serializers.py
"""
from rest_framework import serializers
from .models import Patient, Exam, InferredGene, Report

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exam
        fields = ['id','patient','original_filename','uploaded_at','raw_text']
        read_only_fields = ['uploaded_at','raw_text']

class InferredGeneSerializer(serializers.ModelSerializer):
    class Meta:
        model = InferredGene
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
"""


# phenogen/utils/pdf_processing.py
"""
# Funções utilitárias para extrair texto de PDFs
import fitz  # PyMuPDF
from typing import List

def extract_text_from_pdf(path: str) -> str:
    doc = fitz.open(path)
    parts = []
    for page in doc:
        text = page.get_text()
        if text:
            parts.append(text)
    return "\n".join(parts)

# Alternativa com pdfminer.six pode ser adicionada dependendo do PDF
"""


# phenogen/utils/ner_and_inference.py
"""
# Componentes para extrair entidades clínicas e mapear para genes.
# Aqui você pode usar spaCy + regras ou um modelo transformers fine-tuned.

import re
from typing import List, Dict

# exemplo simples baseado em regras (placeholder)
PHENOTYPE_KEYWORDS = {
    'glicemia elevada': ['GCK','HNF1A','HNF4A'],
    'hemoglobina glicada elevada': ['GCK','HNF1A'],
}


def extract_phenotypes(text: str) -> List[str]:
    text_low = text.lower()
    found = set()
    for k in PHENOTYPE_KEYWORDS.keys():
        if k in text_low:
            found.add(k)
    return list(found)


def infer_genes_from_phenotypes(phenotypes: List[str]) -> List[Dict]:
    results = []
    for p in phenotypes:
        candidates = PHENOTYPE_KEYWORDS.get(p, [])
        for gene in candidates:
            results.append({'gene': gene, 'phenotype': p, 'score': 0.7})
    # Agregar por gene
    agg = {}
    for r in results:
        g = r['gene']
        if g not in agg:
            agg[g] = {'gene': g, 'score': 0.0, 'evidence': []}
        agg[g]['score'] += r['score']
        agg[g]['evidence'].append(r['phenotype'])
    return list(agg.values())
"""

