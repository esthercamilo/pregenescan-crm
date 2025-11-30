import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ArquivosSection() {
  const [arquivos, setArquivos] = useState([]);

  function handleUpload(e) {
    const file = e.target.files[0];
    if (file) setArquivos([...arquivos, file.name]);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Arquivos</h2>

      <input type="file" onChange={handleUpload} className="mb-4" />

      <ul className="space-y-2">
        {arquivos.map((a, i) => (
          <li key={i} className="p-3 bg-gray-50 rounded-lg border">
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
