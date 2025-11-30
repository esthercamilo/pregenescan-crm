import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ExamesSection() {
  const [exames, setExames] = useState([]);
  const [nome, setNome] = useState("");

  function adicionar() {
    setExames([...exames, { nome, data: new Date().toLocaleDateString() }]);
    setNome("");
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Exames</h2>

      <div className="flex gap-2 mb-4">
        <Input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do exame"
        />
        <Button onClick={adicionar}>Adicionar</Button>
      </div>

      <ul className="space-y-2">
        {exames.map((e, i) => (
          <li key={i} className="p-3 bg-gray-50 rounded-lg border">
            <strong>{e.nome}</strong> — {e.data}
          </li>
        ))}
      </ul>
    </div>
  );
}
