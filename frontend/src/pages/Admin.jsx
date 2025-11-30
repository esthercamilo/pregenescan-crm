import React, { useState } from "react";
import { Link } from "react-router-dom";

const AdminPage = () => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // Para sucesso/erro

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_URL = `${API_BASE_URL}/staff/create/`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    // 💡 Obter o token do usuário ADMIN para a requisição
    const token = localStorage.getItem("authToken");

    const finalPayload = {
      person: {
        fullname: formData.fullname,
        user: {
          username: formData.username,
          password: formData.password,
          // O campo 'email' é opcional no seu formulário, adicione se não for vazio
          ...(formData.email && { email: formData.email }),
          role: "Staff", // Valor fixo baseado na sua lógica DRF
        },
      },
      // Se o modelo Staff tiver campos próprios (além de Person), adicione-os aqui
      // Ex: 'department': 'IT',
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Token do Admin logado
        },
        body: JSON.stringify(finalPayload),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "✅ Usuário Staff criado com sucesso!",
        });
        setFormData({ fullname: "", username: "", email: "", password: "" }); // Limpa o form
      } else {
        const errorData = await response.json();
        // Tenta exibir a mensagem de erro detalhada do DRF
        const errorText =
          JSON.stringify(errorData).replace(/[{}"]/g, "").substring(0, 150) +
          "...";
        setMessage({
          type: "error",
          text: `❌ Falha na criação: ${errorText}`,
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "❌ Erro de conexão com o servidor." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
        Criar novo usuário administrador
      </h2>

      {/* Mensagens de Sucesso/Erro */}
      {message && (
        <div
          className={`p-3 mb-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nome Completo */}
        <input
          type="text"
          name="fullname"
          placeholder="Nome Completo"
          required
          value={formData.fullname}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
        />

        {/* Campo Username */}
        <input
          type="text"
          name="username"
          placeholder="Username (login)"
          required
          value={formData.username}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
        />

        {/* Campo E-mail */}
        <input
          type="email"
          name="email"
          placeholder="E-mail (Opcional)"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
        />

        {/* Campo Senha */}
        <input
          type="password"
          name="password"
          placeholder="Senha"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition duration-150 disabled:bg-red-400"
        >
          {isLoading ? "Criando Usuário..." : "Criar Usuário Staff"}
        </button>
      </form>

      <div className="border-t">
        <br />
        <br />

        <Link
          to={"/sandbox/1"}
          className="text-blue-600 hover:text-blue-900 font-medium"
          title="Ver Perfil"
          onClick={(e) => {
            // 1. Previne a navegação interna padrão do Link
            e.preventDefault();

            // 2. Abre a URL em uma nova aba
            window.open("/sandbox/1", "_blank");
          }}
        >
          Sandbox do paciente
        </Link>

        <br />
        <br />
        <Link
          to={"/prontuario/1"}
          className="text-blue-600 hover:text-blue-900 font-medium"
          title="Ver Perfil"
          onClick={(e) => {
            // 1. Previne a navegação interna padrão do Link
            e.preventDefault();

            // 2. Abre a URL em uma nova aba
            window.open("/prontuario/1", "_blank");
          }}
        >
          Área do médico
        </Link>
      </div>
    </div>
  );
};

export default AdminPage;
