import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function MedicacoesSection() {
  const [lista, setLista] = useState([]);
  const [med, setMed] = useState("");

  function adicionar() {
    setLista([...lista, med]);
    setMed("");
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Medicações</h2>

      <div className="flex gap-2 mb-4">
        <Input
          value={med}
          onChange={(e) => setMed(e.target.value)}
          placeholder="Nome da medicação"
        />
        <Button onClick={adicionar}>Adicionar</Button>
      </div>

      <ul className="space-y-2">
        {lista.map((m, i) => (
          <li key={i} className="p-3 bg-gray-50 rounded-lg border">
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}
