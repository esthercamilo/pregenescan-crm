import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import PregeneLogo from "../assets/PREGENESCAN_BLUE_LOGO.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN_API_URL = `${API_BASE_URL}/token/`;

const LoginPage = () => {
  // 1. Estados para capturar o email/username e a senha
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // URL do novo endpoint
  const USER_ROLE_API_URL = `${API_BASE_URL}/me/role/`;

  /**
   * Busca o papel (role/grupo) do usuário no backend após o login.
   * @param {string} token - O JWT de acesso (access token).
   * @returns {string} O nome do papel (ex: 'Admin', 'Médico').
   */
  const fetchUserRole = async (token) => {
    try {
      const response = await fetch(USER_ROLE_API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.error || "Falha ao obter o papel do usuário.");
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar o papel do usuário:", error);
      return "Paciente";
    }
  };

  // Manipulador de submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpa erros anteriores

    setIsLoading(true);

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // O DRF JWT/Token geralmente espera 'username' ou 'email' e 'password'
        body: JSON.stringify({
          username: email, // Usando email como username para login
          password: password,
        }),
      });

      if (!response.ok) {
        // Se a API retornar erro 400, lê a mensagem de erro
        const errorData = await response.json();
        const errorMessage =
          errorData.detail || "Credenciais inválidas. Tente novamente.";
        setError(errorMessage);
        return;
      }

      // 1. Sucesso: Lê o token da resposta
      const data = await response.json();
      const authToken = data.access; // Ajuste para 'token' se você usa Simple Token Auth

      const userDetails = await fetchUserRole(authToken);

      console.log("userDetails");
      console.log(userDetails);

      // 💡 DESESTRUTURAÇÃO: Extrai as chaves 'role' e 'fullname'
      const userRole = userDetails.role;
      const fullName = userDetails.fullname;
      console.log(userRole);

      // 3. Salva o token e o papel no contexto e localStorage
      console.log(authToken);
      login(authToken, userRole, fullName);

      // 4. Redireciona para a página principal (Dashboard ou Pacientes)
      navigate("/pacientes", { replace: true });
    } catch (error) {
      console.error("Erro de rede ou servidor:", error);
      setError("Falha na comunicação com o servidor. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 💡 CONTAINER PRINCIPAL CORRIGIDO
    <div className="min-h-screen flex">
      {/* Coluna da imagem */}
      <div className="hidden md:block w-1/2 login-background"></div>

      {/* Coluna do box de login */}
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm border border-gray-200">
          <div className="flex justify-center mb-6">
            <img
              src={PregeneLogo}
              alt="PREGENESCAN Logo"
              className="h-16 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Acesso
          </h2>
          <p className="text-center text-gray-500 mb-8 text-sm">
            Acesse sua conta para continuar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campos de login */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mail ou Usuário
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              />
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 rounded-lg text-white font-semibold transition duration-200 ${
                isLoading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
