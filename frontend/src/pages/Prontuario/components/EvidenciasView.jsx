import { useState } from "react";
import graphData from "@/mocks/graph";

export default function EvidenciasView() {
  const [selectedCell, setSelectedCell] = useState(null);

  // Genes e exames
  const genes = graphData.nodes.filter((n) => n.type === "gene");
  const exams = graphData.nodes.filter((n) => n.type === "exam");

  // Função que retorna o nível de evidência entre exame e gene
  const evidenceLevel = (geneId, examId) => {
    const edge = graphData.edges.find(
      (e) => e.source === examId && e.target === geneId
    );
    return edge ? edge.weight : 0;
  };

  // Mapa de cores Tailwind
  const colorMap = {
    1: "bg-red-200",
    2: "bg-red-400",
    3: "bg-red-600",
    4: "bg-red-800",
    5: "bg-red-900",
  };

  return (
    <div className="flex w-full h-full overflow-hidden">
      {/* Heatmap */}
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-max">
          {/* Header de exames */}
          <div className="flex">
            <div className="w-28"></div> {/* Espaço do eixo Y */}
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="w-28 h-16 flex items-center justify-center text-xs font-semibold text-center border-b border-gray-200"
              >
                {exam.label}
              </div>
            ))}
          </div>

          {/* Linhas de genes */}
          {genes.map((gene) => (
            <div key={gene.id} className="flex">
              {/* Label do gene */}
              <div className="w-28 h-16 flex items-center justify-center font-semibold border-b border-gray-200">
                {gene.label}
              </div>

              {/* Células de exames */}
              {exams.map((exam) => {
                const level = evidenceLevel(gene.id, exam.id);
                const bgColor = level ? colorMap[level] : "bg-gray-100";

                return (
                  <div
                    key={exam.id}
                    className={`${bgColor} w-28 h-16 border-b border-r border-gray-200 cursor-pointer flex items-center justify-center text-xs`}
                    onClick={() => setSelectedCell({ gene, exam, level })}
                  >
                    {level > 0 ? level : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Painel lateral */}
      <div className="w-64 border-l p-4 bg-white flex-shrink-0">
        {selectedCell ? (
          <>
            <h2 className="font-bold mb-2">
              {selectedCell.gene.label} ← {selectedCell.exam.label}
            </h2>
            <p>
              Nível de evidência: <strong>{selectedCell.level}/5</strong>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Aqui você pode colocar detalhes do exame, histórico familiar ou
              outros comentários clínicos relevantes.
            </p>
          </>
        ) : (
          <p>Selecione uma célula para ver detalhes</p>
        )}
      </div>
    </div>
  );
}
