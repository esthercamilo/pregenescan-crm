import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

// URL base para buscar um paciente individual
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_URL = `${API_BASE_URL}/patients/`;

// --- Componente de Perfil ---
const PerfilPacientePage = () => {
  // 1. Obter o ID da URL
  const { id } = useParams();

  const token = localStorage.getItem("authToken");

  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("geral"); // Estado para controlar as abas

  // Função para buscar os dados do paciente
  const fetchPaciente = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Paciente ID ${id} não encontrado.`);
      }
      const data = await response.json();
      setPaciente(data);
    } catch (err) {
      console.error("Erro ao buscar paciente:", err);
      setError("Não foi possível carregar os dados do paciente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPaciente();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-blue-600 font-medium">
        Carregando perfil do paciente...
      </div>
    );
  }

  if (error || !paciente) {
    return (
      <div className="p-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {error || "Paciente não encontrado."}
        <Link
          to="/pacientes"
          className="block mt-4 text-blue-600 hover:underline"
        >
          Voltar para a lista
        </Link>
      </div>
    );
  }

  // Extrai os dados aninhados para facilitar a leitura
  const person = paciente.person || {};

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Perfil */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900">
          Perfil de: {person.fullname}
        </h1>
        <Link
          to="/pacientes"
          className="text-blue-600 hover:underline font-medium"
        >
          ← Voltar para a Lista
        </Link>
      </div>

      {/* Informações Resumidas e Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-6 mb-6">
          <span className="text-6xl text-blue-600">🧑‍🤝‍🧑</span>
          <div>
            <p className="text-xl font-semibold text-gray-800">
              Registro Médico:{" "}
              <span className="text-blue-600">
                {paciente.medical_record_number}
              </span>
            </p>
            <p className="text-sm text-gray-500">CPF: {person.cpf}</p>
          </div>
        </div>

        {/* --- Abas de Navegação --- */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            <TabButton
              label="Visão Geral & Dados"
              tabKey="geral"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              label="Histórico de Agendamentos"
              tabKey="agendamentos"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              label="Prontuário Simplificado"
              tabKey="prontuario"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </nav>
        </div>

        {/* Conteúdo da Aba */}
        <div className="mt-6">
          {activeTab === "geral" && (
            <VisaoGeralTab paciente={paciente} person={person} />
          )}
          {activeTab === "agendamentos" && (
            <div className="p-4 text-gray-600">
              Conteúdo dos Agendamentos (A ser implementado)
            </div>
          )}
          {activeTab === "prontuario" && (
            <div className="p-4 text-gray-600">
              Conteúdo do Prontuário (A ser implementado)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Componente de Botão de Aba ---
const TabButton = ({ label, tabKey, activeTab, setActiveTab }) => {
  const isActive = activeTab === tabKey;
  return (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={`py-2 px-4 text-sm font-medium transition duration-150 border-b-2 ${
        isActive
          ? "border-blue-600 text-blue-600 font-semibold"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );
};

// --- Componente da Primeira Aba (Visão Geral) ---
const VisaoGeralTab = ({ paciente, person }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 p-4">
    {/* Detalhes do Paciente */}
    <div>
      <h3 className="text-lg font-semibold text-blue-600 mb-3 border-b pb-1">
        Detalhes do Cadastro
      </h3>
      <DetailItem
        label="Registro Médico (RM)"
        value={paciente.medical_record_number}
      />
      <DetailItem
        label="Plano de Saúde"
        value={paciente.health_insurance || "N/A"}
      />
      <DetailItem label="ID no Sistema" value={paciente.id} />
    </div>

    {/* Detalhes da Pessoa (do relacionamento) */}
    <div>
      <h3 className="text-lg font-semibold text-blue-600 mb-3 border-b pb-1">
        Dados Pessoais (Person)
      </h3>
      <DetailItem label="Nome Completo" value={person.fullname || "N/A"} />
      <DetailItem label="CPF" value={person.cpf || "N/A"} />
      <DetailItem label="Telefone" value={person.telefone || "N/A"} />
      {/* Supondo que você tenha data de nascimento no modelo Person */}
      {/* <DetailItem label="Nascimento" value={person.dataNascimento || 'N/A'} /> */}
    </div>
  </div>
);

// Componente utilitário para itens de detalhe
const DetailItem = ({ label, value }) => (
  <div className="py-2 flex justify-between border-b border-gray-100">
    <span className="text-sm font-medium text-gray-500">{label}:</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

export default PerfilPacientePage;
