import React, { useState } from "react";

const NovoMedicoModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    birth_date: "",
    crm: "",
    specialty: "",
    username: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);

    const payload = {
      crm: formData.crm,
      specialty: formData.specialty,
      person: {
        fullname: formData.fullname,
        birth_date: formData.birth_date,
        user: {
          username: formData.username,
          password: formData.password,
          role: "Médico",
        },
      },
    };

    const error = await onCreate(payload);

    if (error) {
      setErrorMessage(error);
    } else {
      onClose();
      setFormData({
        fullname: "",
        birth_date: "",
        crm: "",
        specialty: "",
        username: "",
        password: "",
      });
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Novo Médico</h2>

        {/* Nome */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            placeholder="Ex: Dra. Luiza Reis"
          />
        </div>

        {/* Data de nascimento */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Data de Nascimento
          </label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* CRM */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            CRM
          </label>
          <input
            type="text"
            name="crm"
            value={formData.crm}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            placeholder="Ex: 123456"
          />
        </div>

        {/* Especialidade */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Especialidade
          </label>
          <input
            type="text"
            name="specialty"
            value={formData.specialty}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            placeholder="Ex: Médico da Família"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Nome de Usuário
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            placeholder="Ex: draluiza"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Senha
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 rounded-lg"
            placeholder="Digite uma senha"
          />
        </div>

        {/* Erros */}
        {errorMessage && (
          <div className="text-red-600 text-sm mt-2">{errorMessage}</div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Salvando..." : "Salvar Médico"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NovoMedicoModal;
