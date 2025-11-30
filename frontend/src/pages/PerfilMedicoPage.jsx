import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import AgendaTab from "../components/AgendaTab";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/doctors/`;

const PerfilMedicoPage = () => {
  const { id } = useParams();
  const token = localStorage.getItem("authToken");

  const [medico, setMedico] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("geral");
  const [patients, setPatients] = useState([]);

  const fetchMedico = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setMedico(data);
    } catch (err) {
      setError("Não foi possível carregar os dados do médico.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPacientes = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/appointments/doctor-patients/?doctor=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMedico();
      fetchPacientes();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-blue-600 font-medium">
        Carregando perfil do médico...
      </div>
    );
  }

  if (error || !medico) {
    return (
      <div className="p-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {error || "Médico não encontrado."}
        <Link
          to="/medicos"
          className="block mt-4 text-blue-600 hover:underline"
        >
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const person = medico.person || {};

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900">
          Perfil de: {person.fullname}
        </h1>
        <Link
          to="/profissionais"
          className="text-blue-600 hover:underline font-medium"
        >
          ← Voltar
        </Link>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-6 mb-6">
          <span className="text-6xl text-blue-600">🩺</span>
          <div>
            <p className="text-xl font-semibold text-gray-800">
              CRM: <span className="text-blue-600">{medico.crm}</span>
            </p>
            <p className="text-sm text-gray-600">
              Especialidade: {medico.specialty}
            </p>
          </div>
        </div>

        {/* Abas */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            <TabButton
              label="Visão Geral"
              tabKey="geral"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              label="Agenda"
              tabKey="agenda"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabButton
              label="Pacientes"
              tabKey="pacientes"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "geral" && (
            <VisaoGeralMedico medico={medico} person={person} />
          )}
          {activeTab === "agenda" && <AgendaTab doctorId={id} token={token} />}
          {activeTab === "pacientes" && (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Nome
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Nascimento
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Plano de Saúde
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/pacientes/${p.id}`)
                      }
                    >
                      <td className="px-4 py-2 text-gray-800">
                        {p.person.fullname}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {p.person.birth_date}
                      </td>
                      <td className="px-4 py-2 text-gray-800">
                        {p.health_insurance || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ label, tabKey, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(tabKey)}
    className={`py-2 px-4 text-sm font-medium transition border-b-2 ${
      activeTab === tabKey
        ? "border-blue-600 text-blue-600 font-semibold"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    {label}
  </button>
);

const DetailItem = ({ label, value }) => (
  <div className="py-2 flex justify-between border-b border-gray-100">
    <span className="text-sm font-medium text-gray-500">{label}:</span>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

const VisaoGeralMedico = ({ medico, person }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 p-4">
    <div>
      <h3 className="text-lg font-semibold text-blue-600 mb-3 border-b pb-1">
        Informações Profissionais
      </h3>
      <DetailItem label="CRM" value={medico.crm} />
      <DetailItem label="Especialidade" value={medico.specialty} />
      <DetailItem label="ID no Sistema" value={medico.id} />
      <DetailItem label="Usuário" value={person.user?.username || "N/A"} />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-blue-600 mb-3 border-b pb-1">
        Dados Pessoais
      </h3>
      <DetailItem label="Nome Completo" value={person.fullname} />
      <DetailItem label="Nascimento" value={person.birth_date || "N/A"} />
      <DetailItem label="Telefone" value={person.phone || "N/A"} />
    </div>
  </div>
);

export default PerfilMedicoPage;
