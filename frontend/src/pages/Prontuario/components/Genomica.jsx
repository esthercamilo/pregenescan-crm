import { useState } from "react";
import { User, Dna, List } from "lucide-react";
import CorpoInterativo from "./CorpoInterativo";

export default function GenomicaView() {
  const [view, setView] = useState("corpo");
  const [selectedRegion, setSelectedRegion] = useState(
    "Selecione uma região do corpo"
  );

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top bar */}
      <div className="w-full flex justify-end gap-2 p-2">
        <button onClick={() => setView("corpo")}>
          <User
            className={view === "corpo" ? "text-blue-600" : "text-gray-400"}
          />
        </button>

        <button onClick={() => setView("genes")}>
          <Dna
            className={view === "genes" ? "text-blue-600" : "text-gray-400"}
          />
        </button>

        <button onClick={() => setView("evidencias")}>
          <List
            className={
              view === "evidencias" ? "text-blue-600" : "text-gray-400"
            }
          />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {view === "corpo" && (
          <div className="flex h-full">
            {/* Corpo SVG */}
            <div className="flex-1">
              <CorpoInterativo
                onRegionClick={(region) => setSelectedRegion(region)}
              />
            </div>

            {/* Painel lateral */}

            <div className="w-64 border-l p-3 bg-white">
              <h2 className="font-bold mb-2">{selectedRegion}</h2>
              <p>Informações dessa região…</p>
            </div>
          </div>
        )}

        {view === "genes" && (
          <div id="view-genes">{/* lista priorizada de genes */}</div>
        )}

        {view === "evidencias" && (
          <div id="view-evidencias">
            {/* relação exames/questionário → inferência */}
          </div>
        )}
      </div>
    </div>
  );
}
