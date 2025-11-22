import React from "react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { userName, userRole } = useAuth();

  const displayTitle = userRole === "Médico" ? "Dr(a). " : "";
  const displayName = userName || "Usuário"; // Usa 'Usuário' como fallback

  // Função para obter as iniciais (ex: D.O. para Dr. Oliveira)
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    // Fundo branco, sem borda para dar sensação mais leve
    <header className="flex items-center justify-between h-16 px-6 bg-white shadow-sm">
      <div className="text-xl font-medium text-gray-800">
        Área Administrativa
      </div>

      <div className="flex items-center space-x-4">
        {/* Notificações (em Azul, se houver) */}
        <button className="p-2 rounded-full text-blue-600 hover:bg-gray-100 transition duration-150">
          {/* Ícone de sino simplificado */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>

        {/* Avatar do Usuário */}
        <div className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
          <span className="text-sm font-medium text-gray-700 hidden sm:inline">
            {displayTitle} {displayName}
          </span>
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {getInitials(displayName)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
