from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        # AQUI é onde você importa seus módulos de modelo
        # O Django lerá esses arquivos DEPOIS que todo o App Registry estiver carregado.
        try:
            from api.models import crm  # Importa o módulo api/models/crm.py
            # from .models import financeiro # Se você tiver mais módulos
            # from .models import vendas
        except ImportError:
            # Isso é opcional, mas ajuda a evitar falhas se a estrutura
            # de arquivos estiver temporariamente incorreta durante a inicialização.
            pass
