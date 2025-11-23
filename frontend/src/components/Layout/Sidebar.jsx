import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PregeneLogo from "../../assets/PREGENESCAN_BLUE_LOGO.png";

const navItems = [
  { name: "Pacientes", path: "/pacientes", icon: "🧑‍🤝‍🧑" },
  { name: "Profissionais", path: "/profissionais", icon: "👨‍⚕️" },
  // { name: "Mensagens", path: "/inbox", icon: "💬" },
  { name: "Agenda", path: "/agenda", icon: "📅" },
];

const Sidebar = () => {
  const location = useLocation();

  const { userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Limpa o token e o papel do localStorage e do estado global do React
    logout();

    // 2. Redireciona o usuário para a página de login
    navigate("/login", { replace: true });
  };

  return (
    // Fundo branco com sombra sutil e altura total
    <div className="flex flex-col w-64 bg-white shadow-xl h-full border-r border-gray-200 z-50">
      <div className="flex items-center justify-center h-16 border-b border-blue-100">
        {/* Título da Marca em Azul Forte */}
        <span className="flex items-center text-2xl font-extrabold text-blue-600 tracking-wider">
          <img
            src={PregeneLogo}
            alt="PREGENESCAN Logo"
            className="h-10 object-contain"
          />
          <span className="ml-2">CRM</span>
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          // Verifica se a rota atual é a mesma que o item de navegação
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              // Classes dinâmicas para o estado ativo
              className={`flex items-center space-x-3 p-3 rounded-lg transition duration-150 ${
                isActive
                  ? "bg-blue-100 shadow-lg font-semibold" // Aplica text-white no container
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium"
              }`}
            >
              {/* Garante que o span do ícone herde a cor (não deve ter classe de cor própria) */}
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}

        {userRole === "Admin" && (
          <Link
            to="/admin"
            className="flex items-center p-3 text-sm font-semibold text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition"
          >
            🛡️ Administração
          </Link>
        )}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition duration-150 font-medium"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
