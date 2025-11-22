import React, { useState, memo } from "react";

// O componente é envolvido em memo para evitar re-renderizações desnecessárias do pai
const NovoPacienteModal = memo(({ isOpen, onClose, onCreate }) => {
  // ESTADOS PARA OS CAMPOS DA PERSON
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");

  // ESTADOS PARA OS CAMPOS DO PATIENT
  const [medicalRecordNumber, setMedicalRecordNumber] = useState("");
  const [healthInsurance, setHealthInsurance] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    const patientData = {
      medical_record_number: medicalRecordNumber,
      health_insurance: healthInsurance || null,

      // 1. Objeto Person (Onde estão os campos diretos da Pessoa)
      person: {
        fullname: fullName, // OK
        cpf: cpf, // OK (Assumindo que está no PersonSerializer)

        // 2. Objeto Party (Onde está o link para os telefones)
        party: {
          // O PartySerializer espera uma lista chamada 'phones'
          phones: [
            {
              // 3. Objeto Phone (Onde está o número)
              number: telefone,
            },
          ],
        },
        user: {
          username: cpf,
          password: cpf,
        },
      },
    };

    const error = await onCreate(patientData);

    if (error) {
      setFormError(error);
    } else {
      // Limpa o formulário em caso de sucesso
      setFullName("");
      setCpf("");
      setTelefone("");
      setMedicalRecordNumber("");
      setHealthInsurance("");
    }
    setLoading(false);
  };

  return (
    // Overlay (z-50)
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      {/* Corpo do Modal: Adicionamos z-10 para garantir que esteja acima do overlay */}
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 relative z-10">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Novo Paciente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              Erro: {formError}. Por favor, verifique os dados de entrada.
            </div>
          )}

          <h4 className="text-md font-semibold text-blue-700 mt-4 border-b pb-1">
            Dados Pessoais (Person)
          </h4>

          {/* Campo Nome Completo (FULLNAME) */}
          <div>
            <label
              htmlFor="nome"
              className="block text-sm font-medium text-gray-700"
            >
              Nome Completo
            </label>
            <input
              type="text"
              id="nome"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              // 🎨 CORREÇÃO: bg-white e text-gray-900 garantem fundo branco e texto escuro
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 bg-white text-gray-900"
            />
          </div>

          {/* Campo CPF */}
          <div>
            <label
              htmlFor="cpf"
              className="block text-sm font-medium text-gray-700"
            >
              CPF
            </label>
            <input
              type="text"
              id="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              // 🎨 CORREÇÃO: bg-white e text-gray-900
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 bg-white text-gray-900"
            />
          </div>

          {/* Campo Telefone */}
          <div>
            <label
              htmlFor="telefone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefone
            </label>
            <input
              type="text"
              id="telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              // 🎨 CORREÇÃO: bg-white e text-gray-900
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 bg-white text-gray-900"
            />
          </div>

          <h4 className="text-md font-semibold text-blue-700 mt-6 border-b pb-1">
            Detalhes do Paciente
          </h4>

          {/* Campo Registro Médico */}
          <div>
            <label
              htmlFor="medicalRecordNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Nº de Registro Médico
            </label>
            <input
              type="text"
              id="medicalRecordNumber"
              value={medicalRecordNumber}
              onChange={(e) => setMedicalRecordNumber(e.target.value)}
              required
              // 🎨 CORREÇÃO: bg-white e text-gray-900
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 bg-white text-gray-900"
            />
          </div>

          {/* Campo Plano de Saúde */}
          <div>
            <label
              htmlFor="healthInsurance"
              className="block text-sm font-medium text-gray-700"
            >
              Plano de Saúde (Opcional)
            </label>
            <input
              type="text"
              id="healthInsurance"
              value={healthInsurance}
              onChange={(e) => setHealthInsurance(e.target.value)}
              // 🎨 CORREÇÃO: bg-white e text-gray-900
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-2 bg-white text-gray-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Adicionar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default NovoPacienteModal;
