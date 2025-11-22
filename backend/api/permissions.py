from rest_framework import permissions
from django.contrib.auth.models import Group

class IsAdminUser(permissions.BasePermission):
    """
    Permite acesso apenas se o usuário for membro do grupo 'Admin'.
    """
    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado
        if not request.user.is_authenticated:
            return False

        # Verifica se o usuário pertence ao grupo 'Admin'
        try:
            admin_group = Group.objects.get(name='Admin')
            return admin_group in request.user.groups.all()
        except Group.DoesNotExist:
            # Se o grupo Admin não existe, por segurança, nega o acesso
            return False


class IsAdmin(permissions.BasePermission):
    """Permissão customizada para permitir acesso apenas a usuários no grupo 'Admin'."""

    def has_permission(self, request, view):
        # 1. Deve estar autenticado
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. Verifica se o usuário pertence ao grupo 'Admin'
        return request.user.groups.filter(name='Admin').exists()