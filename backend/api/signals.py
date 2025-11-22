from django.db.models.signals import post_save
from django.dispatch import receiver
from api.models.crm import Person


@receiver(post_save, sender=Person)
def after_upload(sender, instance, created, **kwargs):
    if created:
        print("Arquivo salvo no S3:", instance.file.url)
