import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function EvolucaoSection() {
  const [texto, setTexto] = useState("");

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Evolução Clínica</h2>

      <Textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={6}
        placeholder="Escreva a evolução clínica..."
      />

      <Button className="mt-4">Salvar Evolução</Button>
    </div>
  );
}
