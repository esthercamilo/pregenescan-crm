import React, { createContext, useContext, useState, useEffect } from "react";

// O contexto React que armazenará o estado de autenticação
const AuthContext = createContext();

// Função para simplificar o uso do contexto em outros componentes
export const useAuth = () => {
  return useContext(AuthContext);
};

// Componente Provedor (Provider) que envolve toda a aplicação
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'Admin', 'Médico', 'Staff', 'Paciente'
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState(null);

  // 💡 Efeito para verificar o token no localStorage na montagem
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");
    const name = localStorage.getItem("userName");

    if (token) {
      // Em uma aplicação real, você validaria o token aqui.
      // Por enquanto, apenas assume que se há token, está logado.
      setIsAuthenticated(true);
      setUserRole(role);
      setUserName(name);
    }
    setIsLoading(false);
  }, []);

  // Função que será chamada após o login bem-sucedido
  const login = (token, role, name) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userName", name);
    setIsAuthenticated(true);
    setUserRole(role);
    setUserName(name);
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem("authToken"); // Limpa o token
    localStorage.removeItem("userRole"); // Limpa o papel
    localStorage.removeItem("userName"); // Limpa o nome (se adicionado)
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
  };

  const value = {
    isAuthenticated,
    userRole,
    isLoading,
    userName,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
