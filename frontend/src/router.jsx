import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";

// Importe suas páginas
import LoginPage from "./pages/Login";
import InboxPage from "./pages/Inbox";
import PacientesPage from "./pages/Pacientes";
import PerfilPacientesPage from "./pages/PerfilPacientePage";
import ProfissionaisPage from "./pages/Profissionais";
import AgendaPage from "./pages/Agenda";
import AdminPage from "./pages/Admin";
import PerfilMedicoPage from "./pages/PerfilMedicoPage";
import PreConsultaPage from "./pages/Preconsulta";

// Componentes de Layout
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";

import { useAuth } from "./context/AuthContext";

// Componente de Layout Autenticado (Container para rotas privadas)
// trecho de src/router.jsx
const PrivateLayout = ({
  allowedRoles = ["Admin", "Médico", "Staff", "Paciente"],
}) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  if (isLoading) {
    // 1. Carregando: Mostra um placeholder enquanto o status é verificado
    return (
      <div className="p-8 text-center text-blue-600">
        Verificando autenticação...
      </div>
    );
  }

  if (!isAuthenticated) {
    // 2. Não Autenticado: Redireciona para a página de Login
    return <Navigate to="/login" replace />;
  }

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      // 💡 Rota Mãe: Proteção de Autenticação Geral
      path: "/",
      element: <PrivateLayout />, // Sem allowedRoles = todos logados acessam
      children: [
        // ... Rotas existentes (Acessíveis a todos os papéis logados) ...
        {
          index: true,
          element: <Navigate to="/pacientes" replace />,
        },
        // ... (outras rotas como /inbox, /pacientes, /agenda) ...
      ],
    },
    {
      // 💡 Rota Específica para Admin (Contém a restrição de Role)
      // Usa o PrivateLayout e passa a permissão.
      path: "/admin",
      element: <PrivateLayout allowedRoles={["Admin"]} />, // APENAS ADMIN PODE ACESSAR ESTA ROTA
      children: [
        {
          index: true,
          element: <AdminPage />,
        },
      ],
    },
    // Rota para páginas não encontradas
    // ...
  ]);

  // 3. Verificação de Permissão (Role)
  // O usuário está logado, mas o papel dele está na lista de papéis permitidos para esta rota?
  if (!allowedRoles.includes(userRole)) {
    // Redireciona para o dashboard ou para uma página de "acesso negado"
    // Usamos /pacientes como dashboard padrão por enquanto
    console.warn(
      `Acesso negado: Usuário '${userRole}' não tem permissão para esta rota.`
    );
    return <Navigate to="/pacientes" replace />;
  }

  return (
    <div className="flex-1 flex h-screen bg-gray-50 font-sans">
      <Sidebar />

      {/* ESTE div deve ter flex-1 para ocupar TODO o espaço restante ao lado do Sidebar */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
// ...
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/admin",
    element: <PrivateLayout allowedRoles={["Admin"]} />,
    children: [
      {
        // 💡 ESTE INDEX: TRUE É CRUCIAL
        index: true,
        element: <AdminPage />,
      },
    ],
  },

  {
    path: "/",
    element: <PrivateLayout />,
    children: [
      {
        index: true, // Rota padrão ( / )
        element: <Navigate to="/pacientes" replace />,
      },
      {
        path: "inbox",
        element: <InboxPage />,
      },
      {
        path: "pacientes",
        element: <PacientesPage />,
      },

      ,
      {
        path: "pacientes/:id",
        element: <PerfilPacientesPage />,
      },

      {
        path: "profissionais",
        element: <ProfissionaisPage />,
      },

      {
        path: "preconsulta/:id",
        element: <PreConsultaPage />,
      },

      {
        path: "profissionais/:id",
        element: <PerfilMedicoPage />,
      },
      {
        path: "agenda",
        element: <AgendaPage />,
      },
    ],
  },
  // Rota para páginas não encontradas
  {
    path: "*",
    element: (
      <div className="p-10 text-center">404 - Página Não Encontrada</div>
    ),
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
