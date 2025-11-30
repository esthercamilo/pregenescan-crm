import React, { useState } from "react";
import GenomicaView from "./components/Genomica";

export default function ProntuarioPage() {
  const [activeTab, setActiveTab] = useState("sumario");

  return (
    <div className="w-full h-screen bg-gray-50 flex overflow-hidden">
      {/* Left Column - Patient Info */}
      <aside className="w-64 bg-white border-r p-4 overflow-y-auto sticky top-0 h-screen">
        <div className="text-center mb-6">
          <img
            src="https://avatars.githubusercontent.com/u/583231?v=4"
            className="w-24 h-24 rounded-full mx-auto mb-2"
          />
          <h2 className="text-xl font-bold">Maria Souza</h2>
          <p className="text-sm">42 anos • 12/01/1983</p>
        </div>

        {/* Alerts */}
        <div className="p-3 border-l-4 medical-red shadow mb-4">
          <p className="font-bold">ALERGIAS</p>
          <p className="text-sm mt-1">PENICILINA, LÁTEX</p>
        </div>

        {/* Quick vitals */}
        <div className="space-y-2 text-sm">
          <div>
            <p className="font-semibold">Tipo Sanguíneo</p>
            <p className="text-gray-600">O+</p>
          </div>
          <div>
            <p className="font-semibold">Contato de Emergência</p>
            <p className="text-gray-600">(14) 99999-9999</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 space-y-3 text-sm">
          <div>
            <p className="font-semibold text-gray-700">Última Consulta</p>
            <p className="text-gray-600">10/11/2025 — Dr. João Silva</p>
          </div>
          <div>
            <p className="font-semibold text-gray-700">Próxima Consulta</p>
            <p className="text-gray-600">15/12/2025</p>
          </div>
        </div>
      </aside>

      {/* Center Column - Tabs + Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-4" aria-label="Tabs">
            {[
              { id: "sumario", label: "Sumário" },
              { id: "evolucoes", label: "Evoluções" },
              { id: "prescricoes", label: "Prescrições" },
              { id: "exames", label: "Exames" },
              { id: "genomica", label: "Genômica" },
              { id: "metricas", label: "Métricas" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab pb-3 text-sm font-medium border-b-2 transition-colors duration-150 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        <div>
          {activeTab === "sumario" && <div className="space-y-4"></div>}

          {activeTab === "evolucoes" && <div></div>}
          {activeTab === "genomica" && <GenomicaView />}
        </div>
      </main>

      {/* Right Column - Contextual Panel */}
      <aside className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto hidden lg:block">
        <h2 className="text-lg font-semibold mb-4">Painel de Ações</h2>

        <div className="space-y-3">
          <button className="w-full py-2 px-4 text-white rounded-lg shadow">
            + Nova Prescrição
          </button>
          <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200">
            Imprimir Prontuário
          </button>
          <button className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg shadow hover:bg-gray-200">
            Solicitar Exame
          </button>
        </div>
      </aside>
    </div>
  );
}
