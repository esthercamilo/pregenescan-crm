from django.utils.text import slugify
from rest_framework import serializers
from api.models.crm import Person, Patient, Phone, Party, Staff, Doctor, Appointment, ClinicalNote, PatientRecord, \
    PatientSandbox
from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from rest_framework.serializers import ValidationError


class PhoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phone
        fields = ['number']


class PartySerializer(serializers.ModelSerializer):
    phones = PhoneSerializer(many=True, required=False)

    class Meta:
        model = Party
        fields = ['is_company', 'phones']

    def create(self, validated_data):
        phones_data = validated_data.pop('phones', [])
        # Cria a Party apenas com os campos remanescentes (que é só is_company, ou nenhum)
        party = Party.objects.create(**validated_data)

        for phone_data in phones_data:
            Phone.objects.create(party=party, **phone_data)
        return party


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Você pode usar email como username ou adicionar o campo email se for necessário
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}  # O password NUNCA deve ser lido de volta

    def create(self, validated_data):
        # 💡 Esta é a parte crucial: usamos create_user para hashear a senha
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class PersonSerializer(serializers.ModelSerializer):
    party = PartySerializer(required=False)
    user = UserSerializer(required=True)

    class Meta:
        model = Person
        # 💡 ATUALIZAÇÃO: Inclua 'user' na lista de campos
        fields = "__all__"
        read_only_fields = ['id']

    def create(self, validated_data):
        # 1. Extrair dados aninhados
        party_data = validated_data.pop('party', None)
        user_data = validated_data.pop('user')  # Dados do User (username, password)
        try:
            role_name = validated_data.pop('role')
        except KeyError:
            # Se 'role' não foi enviado no payload, lançamos um erro claro.
            raise ValidationError({'role': 'Este campo é obrigatório para criar um novo usuário.'})

        # 2. Criar o User (A senha será hasheada dentro do UserSerializer.create)
        user_serializer = UserSerializer()
        user_instance = user_serializer.create(validated_data=user_data)

        # 3. Criar a Party (e Phones) (lógica existente)
        if party_data:
            party_serializer = PartySerializer()
            party = party_serializer.create(validated_data=party_data)
        else:
            party = Party.objects.create()

        try:
            group = Group.objects.get(name=role_name)
            user_instance.groups.add(group)
        except Group.DoesNotExist:
            print(f"ATENÇÃO: O grupo '{role_name}' não foi encontrado. Usuário criado sem grupo.")

        # 4. Criar o Person
        # O **validated_data contém: fullname, birth_date, gender, etc.
        # Vincula os objetos party e user recém-criados.
        person = Person.objects.create(party=party, user=user_instance, **validated_data)

        return person


class PatientSerializer(serializers.ModelSerializer):
    person = PersonSerializer()

    class Meta:
        model = Patient
        fields = "__all__"

    def create(self, validated_data):
        person_data = validated_data.pop('person', {})

        # 1. Criar o Person (que, por sua vez, cria a Party e os Phones)
        person_data['role'] = 'Paciente'
        person_serializer = PersonSerializer()
        person = person_serializer.create(validated_data=person_data)

        # 2. Criar o Patient
        patient = Patient.objects.create(person=person, **validated_data)

        return patient


class DoctorSerializer(serializers.ModelSerializer):
    person = PersonSerializer()

    class Meta:
        model = Doctor
        fields = "__all__"

    def create(self, validated_data):
        person_data = validated_data.pop('person', {})

        # 1. Criar o Person (que, por sua vez, cria a Party e os Phones)
        person_data['role'] = 'Médico'
        person_serializer = PersonSerializer()
        person = person_serializer.create(validated_data=person_data)

        # 2. Criar o Médico
        doctor = Doctor.objects.create(person=person, **validated_data)

        return doctor


class UserRoleSerializer(serializers.Serializer):
    """Serializer para retornar apenas o papel do usuário."""
    role = serializers.CharField(source='groups.first.name')

    # Embora 'source' possa resolver, a implementação na View é mais direta.
    # Usaremos esta classe apenas para documentação/estrutura,
    # mas a lógica de obtenção do papel será na View.


class StaffUserSerializer(serializers.ModelSerializer):
    person = PersonSerializer()

    class Meta:
        model = Staff
        fields = "__all__"

    def create(self, validated_data):
        person_data = validated_data.pop('person', {})

        # 1. Criar o Person (que, por sua vez, cria a Party e os Phones)
        person_serializer = PersonSerializer()
        person_data['role'] = 'Staff'
        person = person_serializer.create(validated_data=person_data)

        # 2. Criar o staff
        staff = Staff.objects.create(person=person, **validated_data)

        return staff


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"


class ClinicalNoteSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source="doctor.person.fullname", read_only=True)

    class Meta:
        model = ClinicalNote
        fields = [
            "id",
            "patient",
            "doctor",
            "doctor_name",
            "text",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["doctor", "created_at", "updated_at"]


class PatientRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientRecord
        fields = "__all__"
        read_only_fields = ["author", "created_at"]


class PatientSandboxSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientSandbox
        fields = "__all__"
        read_only_fields = ["patient", "updated_at"]


class DoctorPatientSerializer(serializers.ModelSerializer):
    fullname = serializers.CharField(source='person.fullname', read_only=True)
    cpf = serializers.CharField(source='person.cpf', read_only=True)
    medical_record_number = serializers.CharField(read_only=True)
    health_insurance = serializers.CharField(read_only=True)

    class Meta:
        model = Patient
        fields = ['id', 'fullname', 'cpf', 'medical_record_number', 'health_insurance']