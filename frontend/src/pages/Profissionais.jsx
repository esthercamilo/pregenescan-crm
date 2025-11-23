import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaUserMd, FaWhatsapp, FaTrashAlt } from "react-icons/fa";
import NovoMedicoModal from "../components/NovoMedicoModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/doctors/`;

const SearchIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.39L19.39 18l-1.414 1.414-4.544-4.544A7 7 0 012 9z"
      clipRule="evenodd"
    />
  </svg>
);

const MedicosPage = () => {
  const [medicos, setMedicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token = localStorage.getItem("authToken");

  const headers = [
    "Nome Completo",
    "CRM",
    "Especialidade",
    "Telefone",
    "Usuário",
  ];

  // Buscar médicos
  const fetchMedicos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Falha ao buscar médicos");
      }
      const data = await response.json();
      setMedicos(data);
    } catch (error) {
      console.error("Erro ao buscar médicos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar médico
  const handleCreate = useCallback(
    async (medicoData) => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(medicoData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro ao criar médico:", errorData);
          return errorData.person
            ? `Erro na pessoa: ${JSON.stringify(errorData.person)}`
            : "Falha na criação. Verifique os dados.";
        }

        await fetchMedicos();
        setIsModalOpen(false);
        return null;
      } catch (err) {
        console.error("Erro na requisição:", err);
        return `Erro de rede/servidor: ${err.message}`;
      }
    },
    [fetchMedicos]
  );

  // Deletar médico
  const handleDelete = async (id) => {
    if (!window.confirm("Deseja realmente deletar este médico?")) return;

    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 204) {
        setMedicos(medicos.filter((m) => m.id !== id));
      } else {
        throw new Error(`Erro ao deletar: ${response.statusText}`);
      }
    } catch (err) {
      console.error("Erro ao deletar médico:", err);
    }
  };

  // WhatsApp
  const handleWhatsApp = (partyObject, nome) => {
    const numero = partyObject?.phones?.[0]?.number;
    if (!numero) {
      alert(`Telefone não encontrado para ${nome}.`);
      return;
    }
    const apenasDigitos = numero.replace(/\D/g, "");
    const msg = encodeURIComponent(`Olá Dr(a). ${nome}, tudo bem?`);
    window.open(`https://wa.me/55${apenasDigitos}?text=${msg}`, "_blank");
  };

  useEffect(() => {
    fetchMedicos();
  }, [fetchMedicos]);

  // Filtro de pesquisa
  const filteredMedicos = medicos.filter((m) => {
    const nome = m.person?.fullname?.toLowerCase() || "";
    const crm = m.crm?.toLowerCase() || "";
    const esp = m.specialty?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return nome.includes(term) || crm.includes(term) || esp.includes(term);
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-blue-600 font-medium">
        Carregando médicos...
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 p-8 min-h-full">
      <h1 className="text-3xl font-bold text-gray-900">Gestão de Médicos</h1>

      {/* Barra de busca + botão */}
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar por nome, CRM ou especialidade..."
            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <span>+ Novo Médico</span>
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  {h}
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMedicos.length > 0 ? (
              filteredMedicos.map((m) => {
                const telefone = m.person?.party?.phones?.[0]?.number;
                const telefoneExiste = !!telefone;

                return (
                  <tr
                    key={m.id}
                    className="hover:bg-blue-50 transition duration-100"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {m.person?.fullname}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.crm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.specialty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {telefone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.person?.user?.username || "N/A"}
                    </td>

                    {/* AÇÕES */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="inline-flex space-x-3">
                        <Link
                          to={`/profissionais/${m.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver Perfil"
                        >
                          <FaUserMd className="w-5 h-5" />
                        </Link>

                        <button
                          onClick={() =>
                            handleWhatsApp(
                              m.person?.party,
                              m.person?.fullname || ""
                            )
                          }
                          disabled={!telefoneExiste}
                          className={
                            telefoneExiste
                              ? "text-green-600 hover:text-green-800"
                              : "text-gray-400 cursor-not-allowed"
                          }
                        >
                          <FaWhatsapp className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrashAlt className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Nenhum médico encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <NovoMedicoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default MedicosPage;
