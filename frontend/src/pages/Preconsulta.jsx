import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PRECONSULTA = `${API_BASE_URL}/preconsulta/`;

const PreConsultaPage = () => {
  const { id } = useParams(); // ID do paciente
  const token = localStorage.getItem("authToken");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch principal
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_PRECONSULTA}${id}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao carregar dados.");

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 text-center text-blue-600 font-medium">
        Carregando painel de pré-consulta...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-red-100 border border-red-400 text-red-700 rounded-lg">
        Não foi possível carregar os dados da pré-consulta.
        <div className="mt-4">
          <Link to="/pacientes" className="text-blue-600 hover:underline">
            ← Voltar para a lista
          </Link>
        </div>
      </div>
    );
  }

  const {
    patient,
    next_appointment,
    last_clinical_notes,
    sandbox_data,
    insights,
  } = data;
  const person = patient.person || {};

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900">
          Pré-Consulta: {person.fullname}
        </h1>

        <Link
          to={`/profissionais/${person.id}`}
          className="text-blue-600 hover:underline font-medium"
        >
          ← Voltar ao Perfil
        </Link>
      </div>

      {/* 1 - Card de Informações Básicas */}
      <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4">
          Dados do Paciente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
          <Detail label="Nome" value={person.fullname} />
          <Detail label="Registro (RM)" value={patient.medical_record_number} />
          <Detail
            label="Plano de Saúde"
            value={patient.health_insurance || "N/A"}
          />
          <Detail label="CPF" value={person.cpf || "N/A"} />
        </div>
      </div>

      {/* 2 - Próximo Agendamento */}
      <Card title="Próximo Agendamento">
        {next_appointment ? (
          <div className="space-y-2">
            <Detail label="Início" value={next_appointment.start_time} />
            <Detail label="Término" value={next_appointment.end_time} />
            <Detail label="Status" value={next_appointment.status} />
            <Detail
              label="Médico(a)"
              value={next_appointment.doctor.person.fullname}
            />
          </div>
        ) : (
          <p className="text-gray-500">Nenhum agendamento futuro encontrado.</p>
        )}
      </Card>

      {/* 3 - Últimas Anotações Clínicas */}
      <Card title="Últimas Anotações Clínicas (5 mais recentes)">
        {last_clinical_notes && last_clinical_notes.length > 0 ? (
          <ul className="space-y-4">
            {last_clinical_notes.map((note) => (
              <li key={note.id} className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm text-gray-600">{note.created_at}</p>
                <p className="font-medium text-gray-800">{note.note_text}</p>
                {note.tags && note.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {note.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma anotação registrada.</p>
        )}
      </Card>

      {/* 4 - Sandbox do Paciente */}
      <Card title="Dados Inseridos pelo Paciente (Sandbox)">
        {sandbox_data ? (
          <div className="space-y-2">
            <Detail label="Sintomas" value={sandbox_data.symptoms || "N/A"} />
            <Detail
              label="Medicações"
              value={sandbox_data.medications || "N/A"}
            />
            <Detail
              label="Histórico Familiar"
              value={sandbox_data.family_history || "N/A"}
            />
            <Detail
              label="Última atualização"
              value={sandbox_data.created_at}
            />
          </div>
        ) : (
          <p className="text-gray-500">
            Nenhuma informação enviada pelo paciente ainda.
          </p>
        )}
      </Card>

      {/* 5 - Insights Automáticos */}
      <Card title="Insights Automáticos">
        {insights && insights.length > 0 ? (
          <ul className="list-disc ml-6 space-y-1 text-red-700">
            {insights.map((i, idx) => (
              <li key={idx}>{i}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhum alerta registrado.</p>
        )}
      </Card>
    </div>
  );
};

/* Componentes utilitários */

const Card = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

const Detail = ({ label, value }) => (
  <div className="flex justify-between py-1">
    <span className="text-gray-500 text-sm">{label}:</span>
    <span className="text-gray-800 font-medium text-sm">{value}</span>
  </div>
);

export default PreConsultaPage;
