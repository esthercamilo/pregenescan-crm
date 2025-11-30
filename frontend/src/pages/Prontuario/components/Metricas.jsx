import { useState } from "react";
import metricsList from "@/mocks/metrics";
import patientData from "@/mocks/patientData";

function MetricPanel({ metric }) {
  const [inputs, setInputs] = useState(() => {
    const initial = {};
    metric.inputsDef.forEach((i) => {
      initial[i.id] = patientData[i.id] ?? i.default ?? "";
    });
    return initial;
  });

  const handleChange = (id, value) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const result = metric.calculate(inputs);

  return (
    <div className="border rounded p-4 shadow-sm bg-white flex flex-col gap-3">
      <h2 className="text-xl font-bold">{metric.name}</h2>
      <p className="text-sm text-gray-500">{metric.reference}</p>

      <div className="grid grid-cols-2 gap-3">
        {metric.inputsDef.map((i) => (
          <div key={i.id} className="flex flex-col">
            <label className="text-sm font-medium">{i.label}</label>
            {i.type === "select" ? (
              <select
                value={inputs[i.id]}
                onChange={(e) => handleChange(i.id, e.target.value)}
                className="border rounded p-1"
              >
                {i.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : i.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={inputs[i.id]}
                onChange={(e) => handleChange(i.id, e.target.checked)}
                className="mt-1"
              />
            ) : (
              <input
                type={i.type}
                value={inputs[i.id]}
                onChange={(e) => handleChange(i.id, e.target.value)}
                className="border rounded p-1"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3">
        <p className="font-semibold">Resultado: {result.score}</p>
        <p className="text-gray-600">{result.interpretation}</p>
      </div>
    </div>
  );
}

export default function Metricas() {
  const [selectedMetric, setSelectedMetric] = useState(metricsList[0].name);

  const metric = metricsList.find((m) => m.name === selectedMetric);

  return (
    <div className="w-full h-full p-6 overflow-auto flex flex-col gap-6">
      <h1 className="text-3xl font-bold mb-4">Índices clínicos</h1>

      <div className="mb-4">
        <label className="font-medium mr-2">Selecionar avaliação:</label>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="border rounded p-1"
        >
          {metricsList.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <MetricPanel metric={metric} />
    </div>
  );
}
