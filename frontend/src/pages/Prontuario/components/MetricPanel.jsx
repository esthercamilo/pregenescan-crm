import { useState, useEffect } from "react";

// Componente base de métrica
export default function MetricPanel({
  name,
  reference,
  inputsDef,
  patientData,
  calculate,
}) {
  // Estado dos inputs
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  // Inicializa inputs com dados do paciente ou defaults
  useEffect(() => {
    const initial = {};
    inputsDef.forEach((input) => {
      initial[input.id] = patientData?.[input.id] ?? input.default ?? "";
    });
    setInputs(initial);
  }, [inputsDef, patientData]);

  const handleChange = (id, value) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    const r = calculate(inputs);
    setResult(r);
  };

  const handleReset = () => {
    const reset = {};
    inputsDef.forEach((input) => {
      reset[input.id] = patientData?.[input.id] ?? input.default ?? "";
    });
    setInputs(reset);
    setResult(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 p-4 gap-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        {reference && (
          <p className="text-sm text-gray-500">Referência: {reference}</p>
        )}
      </div>

      {/* Painel principal: Inputs e Resultado */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Inputs */}
        <div className="flex-1 bg-white p-4 rounded shadow overflow-auto">
          <h2 className="font-semibold mb-2">Dados do paciente</h2>
          <div className="flex flex-col gap-3">
            {inputsDef.map((input) => (
              <div key={input.id} className="flex flex-col">
                <label className="text-sm font-medium mb-1">
                  {input.label}
                </label>
                {input.type === "select" ? (
                  <select
                    value={inputs[input.id]}
                    onChange={(e) => handleChange(input.id, e.target.value)}
                    className="border rounded p-1"
                  >
                    {input.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={input.type}
                    value={inputs[input.id]}
                    onChange={(e) => handleChange(input.id, e.target.value)}
                    className="border rounded p-1"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resultado */}
        <div className="w-64 bg-white p-4 rounded shadow flex flex-col">
          <h2 className="font-semibold mb-2">Resultado</h2>
          {result ? (
            <>
              <p className="text-xl font-bold">{result.score}</p>
              <p className="text-gray-600">{result.interpretation}</p>
            </>
          ) : (
            <p className="text-gray-400">
              Clique em "Calcular" para ver o resultado
            </p>
          )}
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-2">
        <button
          onClick={handleCalculate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Calcular
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Resetar
        </button>
      </div>
    </div>
  );
}
