import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import NovoPacienteModal from "../components/NovoPacienteModal";
import { FaUser, FaWhatsapp, FaTrashAlt } from "react-icons/fa";

// URL base do seu endpoint de pacientes
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/patients/`;

// Ícones simples (mantidos)
const SearchIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.39L19.39 18l-1.414 1.414-4.544-4.544A7 7 0 012 9z"
      clipRule="evenodd"
    />
  </svg>
);

// --- Componente Principal ---
const PacientesPage = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("authToken");

  const headers = [
    "Nome Completo",
    "CPF",
    "Registro Médico",
    "Telefone", // Agora exibirá o telefone aninhado
    "Plano de Saúde",
  ];

  // Função para buscar os dados dos pacientes (useCallback)
  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Falha ao buscar pacientes: " + response.statusText);
      }
      const data = await response.json();
      setPacientes(data);
    } catch (error) {
      console.error("Erro ao buscar pacientes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para criar um novo paciente (useCallback)
  const handleCreate = useCallback(
    async (pacienteData) => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Token do Admin logado
          },
          body: JSON.stringify(pacienteData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao criar paciente:", errorData);
          return errorData.person
            ? `Erro no relacionamento Pessoa: ${JSON.stringify(
                errorData.person
              )}`
            : "Falha na criação. Verifique os dados no console.";
        }

        await fetchPacientes();
        setIsModalOpen(false);
        return null;
      } catch (error) {
        console.error("Erro na requisição de criação:", error.message);
        return `Erro de rede/servidor: ${error.message}`;
      }
    },
    [fetchPacientes]
  );

  // Função para deletar um paciente (mantida simples, sem useCallback)
  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este paciente?")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        setPacientes(pacientes.filter((p) => p.id !== id));
      } else {
        throw new Error("Falha ao deletar paciente: " + response.statusText);
      }
    } catch (error) {
      console.error("Erro ao deletar paciente:", error);
    }
  };

  // FUNÇÃO PARA GERAR O LINK DO WHATSAPP (CORRIGIDA)
  const handleWhatsApp = (partyObject, nome) => {
    // Tenta acessar o número do primeiro telefone.
    const numeroCompleto = partyObject?.phones?.[0]?.number;

    // Verifica a existência do número de forma robusta
    if (!numeroCompleto || numeroCompleto.length === 0) {
      alert(`Telefone não encontrado para ${nome}.`);
      return;
    }

    const numero = numeroCompleto;

    // Remove caracteres não numéricos do telefone
    const telefoneLimpo = numero.replace(/\D/g, "");

    const mensagem = `Olá ${nome}, sou da clínica e gostaria de confirmar seu agendamento.`;
    const mensagemEncoded = encodeURIComponent(mensagem);

    // Formato do link com DDI 55 (Brasil)
    const url = `https://wa.me/55${telefoneLimpo}?text=${mensagemEncoded}`;

    window.open(url, "_blank");
  };
  // ----------------------------------------

  // Carrega os dados quando o componente monta
  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  // Filtro de pesquisa (mantido)
  const filteredPacientes = pacientes.filter((paciente) => {
    const personName =
      paciente.person?.fullname?.toLowerCase() ||
      paciente.person?.nome?.toLowerCase() ||
      "";
    const cpf = paciente.person?.cpf || "";
    const rm = paciente.medical_record_number?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();

    return personName.includes(term) || cpf.includes(term) || rm.includes(term);
  });

  // --- Renderização ---
  if (loading) {
    return (
      <div className="p-8 text-center text-blue-600 font-medium">
        Carregando dados dos pacientes...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-8 min-h-full">
      <h1 className="text-3xl font-bold text-gray-900">Gestão de Pacientes</h1>

      {/* Barra de Pesquisa e Botão Novo Paciente (mantidos) */}
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou RM..."
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-150 flex items-center space-x-2"
        >
          <span>+ Novo Paciente</span>
        </button>
      </div>

      {/* Tabela de Pacientes */}

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Headers de Dados (mantidos text-left) */}
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
              {/* 💡 CORREÇÃO 1: Centraliza o Header 'Ações' */}
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider text-left">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPacientes.length > 0 ? (
              filteredPacientes.map((paciente) => {
                // 📞 LÓGICA DE TELEFONE
                const numeroTelefone =
                  paciente.person?.party?.phones?.[0]?.number;
                const telefoneExiste =
                  !!numeroTelefone && numeroTelefone.length > 0;
                // -----------------------------------------------------

                return (
                  <tr
                    key={paciente.id}
                    className="hover:bg-blue-50 transition duration-100"
                  >
                    {/* Dados da Tabela (mantidos text-left) */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                      {paciente.person?.fullname ||
                        paciente.person?.nome ||
                        "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {paciente.person?.cpf || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {paciente.medical_record_number}
                    </td>
                    {/* 💡 EXIBE O TELEFONE ANINHADO */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {numeroTelefone || "N/A"}
                    </td>
                    {/* ----------------------------- */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                      {paciente.health_insurance || "Sem plano"}
                    </td>

                    {/* 🚀 CÉLULA DE AÇÕES CORRIGIDA E CENTRALIZADA */}
                    <td
                      // 💡 CORREÇÃO 2: Centraliza o conteúdo da Célula de Ações
                      className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-left"
                    >
                      {/* 💡 MELHORIA: Usa DIV para agrupar e garantir o espaçamento correto dos ícones */}
                      <div className="inline-flex space-x-3">
                        {/* 1. Ver Perfil */}
                        <Link
                          to={`/pacientes/${paciente.id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                          title="Ver Perfil"
                        >
                          <FaUser className="w-5 h-5" />
                        </Link>

                        {/* 2. Botão WhatsApp (com verificação correta) */}
                        <button
                          onClick={() =>
                            handleWhatsApp(
                              paciente.person?.party, // Passa o objeto Party
                              paciente.person?.fullname || "Paciente"
                            )
                          }
                          disabled={!telefoneExiste}
                          className={`font-medium transition duration-150 ${
                            telefoneExiste
                              ? "text-green-600 hover:text-green-800"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          title="Enviar mensagem via WhatsApp"
                        >
                          <FaWhatsapp className="w-5 h-5" />
                        </button>

                        {/* 3. Deletar */}
                        <button
                          onClick={() => handleDelete(paciente.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                          title="Deletar Paciente"
                        >
                          <FaTrashAlt className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                    {/* ------------------------------------- */}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum paciente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL DE CRIAÇÃO --- */}
      {isModalOpen && (
        <NovoPacienteModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default PacientesPage;
