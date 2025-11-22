// src/pages/Dashboard.jsx

// Componente simples para os KPIs
const KpiCard = ({ title, value, icon, bgColor, textColor }) => (
  <div
    className={`p-6 rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02] ${bgColor}`}
  >
    <div className={`text-3xl mb-3 ${textColor}`}>{icon}</div>
    <p className="text-sm font-medium uppercase text-gray-500">{title}</p>
    <h2 className={`text-4xl font-bold mt-1 ${textColor}`}>{value}</h2>
  </div>
);

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Visão Geral da Clínica
      </h1>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Agendamentos Hoje"
          value="45"
          icon="📅"
          bgColor="bg-white"
          textColor="text-blue-600"
        />
        <KpiCard
          title="Novas Mensagens"
          value="8"
          icon="💬"
          bgColor="bg-white"
          textColor="text-red-500" // Usando vermelho para Urgência/Novidade
        />
        <KpiCard
          title="Pacientes Cadastrados"
          value="1.250"
          icon="🧑‍🤝‍🧑"
          bgColor="bg-white"
          textColor="text-gray-800"
        />
        <KpiCard
          title="Profissionais Ativos"
          value="12"
          icon="👨‍⚕️"
          bgColor="bg-white"
          textColor="text-green-600" // Usando verde para Status Positivo/Ativo
        />
      </div>

      {/* Seção de Conversas Pendentes */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Conversas Pendentes (Inbox)
        </h2>
        <p className="text-gray-500">
          Nenhum atendimento em espera no momento. Ótimo trabalho!
        </p>
        {/* Aqui entraria a lista de conversas */}
      </div>
    </div>
  );
};

export default DashboardPage;
