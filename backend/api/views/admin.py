from api.permissions import IsAdminUser, IsAdmin
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, generics

from api.serializers import StaffUserSerializer


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, format=None):
        data = {
            "status": "Acesso Autorizado",
            "mensagem": "Bem-vindo à área de Administração. Este conteúdo é restrito."
        }
        return Response(data)


class UserRoleView(APIView):
    """Endpoint que retorna o papel (role/grupo) do usuário autenticado."""
    # Garante que só usuários com um token válido possam acessar
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user

        # Tenta obter o nome do primeiro grupo (papel)
        group_name = user.groups.first().name if user.groups.exists() else None

        # 💡 NOVO: Obtém o objeto Person (assumindo a relação OneToOne do Person com User)
        try:
            person = user.person
            fullname = person.fullname
        except AttributeError:
            # Caso o User ainda não esteja ligado a um Person (improvável se a criação aninhada estiver ok)
            fullname = user.username

        if not group_name:
            return Response({'error': 'Usuário não possui um papel (grupo) atribuído.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # 💡 RETORNO ATUALIZADO
        return Response({
            'role': group_name,
            'fullname': fullname  # Retorna o nome completo
        }, status=status.HTTP_200_OK)


class StaffUserCreateView(generics.CreateAPIView):
    """Endpoint para criação de novos usuários Staff."""
    serializer_class = StaffUserSerializer

    # 💡 REQUER ADMIN: Apenas usuários no grupo 'Admin' podem criar Staff
    # Se você está usando grupos (roles) para permissão:
    permission_classes = [IsAuthenticated, IsAdmin]

    # Se você usa is_staff=True no modelo User:
    # permission_classes = [IsAdminUser]