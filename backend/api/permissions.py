from rest_framework import permissions
from django.contrib.auth.models import Group

#<QuerySet [<Group: Paciente>, <Group: Staff>, <Group: Médico>, <Group: Admin>]>

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


class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name="Médico").exists()

class IsStaffOrDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.groups.filter(name="Médico").exists() or
            request.user.groups.filter(name="Staff").exists()
        )

class IsPatientSelf(permissions.BasePermission):
    """Paciente só pode ver dados próprios."""
    def has_object_permission(self, request, view, obj):
        return obj.patient == request.user

class CanEditRecord(permissions.BasePermission):
    """Só médico pode editar o prontuário"""
    def has_permission(self, request, view):
        # editar = PUT PATCH DELETE
        if request.method in ["PUT", "PATCH", "DELETE"]:
            return request.user.groups.filter(name="Médico").exists()
        return True