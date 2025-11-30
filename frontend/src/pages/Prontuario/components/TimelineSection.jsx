export default function TimelineSection() {
  const eventos = [
    { tipo: "Consulta", data: "01/01/2025", desc: "Retorno clínico" },
    { tipo: "Exame", data: "12/12/2024", desc: "Hemograma completo" },
    { tipo: "Evolução", data: "03/12/2024", desc: "Avaliação geral" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Linha do Tempo</h2>

      <div className="space-y-4">
        {eventos.map((ev, i) => (
          <div
            key={i}
            className="border-l-4 border-blue-600 pl-4 bg-gray-50 p-4 rounded-xl"
          >
            <p className="text-sm text-gray-500">{ev.data}</p>
            <p className="font-semibold">{ev.tipo}</p>
            <p>{ev.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
