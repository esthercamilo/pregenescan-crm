import { useState } from "react";
import { User, Dna, List } from "lucide-react";
import CorpoInterativo from "./CorpoInterativo";
import GenesGraphView from "./GenesGraphView";
import EvidenciasView from "./EvidenciasView";

export default function GenomicaView() {
  const [view, setView] = useState("corpo");
  const [selectedRegion, setSelectedRegion] = useState("Selecione uma região");

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      {/* Top bar */}
      <div className="flex-none w-full flex justify-end gap-2 p-2 border-b bg-gray-50">
        <button title="Corpo" onClick={() => setView("corpo")}>
          <User
            className={view === "corpo" ? "text-blue-600" : "text-gray-400"}
          />
        </button>
        <button title="Genes" onClick={() => setView("genes")}>
          <Dna
            className={view === "genes" ? "text-blue-600" : "text-gray-400"}
          />
        </button>
        <button title="Evidências" onClick={() => setView("evidencias")}>
          <List
            className={
              view === "evidencias" ? "text-blue-600" : "text-gray-400"
            }
          />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0 min-w-0">
        {view === "corpo" && (
          <>
            {/* Corpo interativo */}
            <div className="flex-1 min-h-0 min-w-0">
              <CorpoInterativo
                onRegionClick={(region) => setSelectedRegion(region)}
              />
            </div>

            {/* Painel lateral */}
            <div className="w-64 border-l p-3 bg-white flex-shrink-0">
              <h2 className="font-bold mb-2">{selectedRegion}</h2>
              <p>Informações dessa região…</p>
            </div>
          </>
        )}

        {view === "genes" && (
          <div className="flex-1 min-h-0 min-w-0">
            <GenesGraphView />
          </div>
        )}

        <div
          className={`flex-1 min-h-0 min-w-0 p-3 ${
            view === "evidencias" ? "block" : "hidden"
          }`}
        >
          <EvidenciasView />
        </div>
      </div>
    </div>
  );
}
