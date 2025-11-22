import boto3
from botocore.exceptions import ClientError
from django.conf import settings
import uuid

class S3Service:
    def __init__(self):
        self.bucket = settings.AWS_STORAGE_BUCKET_NAME
        self.region = settings.AWS_S3_REGION_NAME
        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=self.region,
        )

    # Criar uma "pasta" (prefixo vazio)
    def create_folder(self, folder_name):
        if not folder_name.endswith("/"):
            folder_name += "/"
        self.s3.put_object(Bucket=self.bucket, Key=folder_name)
        return folder_name

    # Upload genérico
    def upload_file(self, folder, file_obj, filename=None):
        if not filename:
            filename = str(uuid.uuid4())

        key = f"{folder}/{filename}"
        self.s3.upload_fileobj(file_obj, self.bucket, key)
        return key

    # Remover arquivo
    def delete_file(self, key):
        self.s3.delete_object(Bucket=self.bucket, Key=key)
        return True

    # Gerar URL assinada
    def generate_presigned_url(self, key, expires=3600):
        try:
            return self.s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires,
            )
        except ClientError:
            return None

    # Listar arquivos de um prefixo
    def list_files(self, folder):
        # 1. Trata a barra final para subdiretórios
        if folder and not folder.endswith("/"):
            folder += "/"

        # 2. Se a pasta for vazia (raiz), garante que o prefixo seja ""
        if folder == "/":
            folder = ""

        # Se você chamar com folder='', o fluxo será:
        # '' -> não entra no if 1 (se adicionar 'and folder')
        # '' -> if 2 é False (correto)

        # Se você voltar à sua lógica original, a correção mais simples é:
        if not folder:  # Se for a raiz, garanta que seja ""
            prefix = ""
        elif not folder.endswith("/"):  # Para pastas, adicione a barra
            prefix = folder + "/"
        else:  # Já tem barra
            prefix = folder

        response = self.s3.list_objects_v2(
            Bucket=self.bucket,
            Prefix=prefix
        )

        contents = response.get("Contents", [])
        return [item["Key"] for item in contents]


if __name__=='__main__':
    import django
    import os
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    r = S3Service().list_files('')
    print(r)

