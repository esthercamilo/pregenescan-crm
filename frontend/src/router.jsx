import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/Login";
import InboxPage from "./pages/Inbox";
import PacientesPage from "./pages/Pacientes";
import PerfilPacientesPage from "./pages/PerfilPacientePage";
import ProfissionaisPage from "./pages/Profissionais";
import AgendaPage from "./pages/Agenda";
import AdminPage from "./pages/Admin";
import PerfilMedicoPage from "./pages/PerfilMedicoPage";
import PreConsultaPage from "./pages/Preconsulta";

import ProntuarioPage from "./pages/Prontuario/ProntuarioPage";
import SandboxPage from "./pages/Sandbox/SandboxPage";

import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";

import { useAuth } from "./context/AuthContext";

/* ----------------------------
   PrivateLayout (com sidebar)
----------------------------- */
const PrivateLayout = ({
  allowedRoles = ["Admin", "Médico", "Staff", "Paciente"],
}) => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-blue-600">
        Verificando autenticação...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/pacientes" replace />;
  }

  return (
    <div className="flex-1 flex h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

/* ------------------------------------
   BareLayout (SEM sidebar e header)
------------------------------------- */
const BareLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-blue-600">
        Verificando autenticação...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="p-6">
      <Outlet />
    </div>
  );
};

/* ----------------------------
   ROTAS
----------------------------- */
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  /*  ADMIN COM SIDEBAR */
  {
    path: "/admin",
    element: <PrivateLayout allowedRoles={["Admin"]} />,
    children: [{ index: true, element: <AdminPage /> }],
  },

  /* ROTAS NORMAIS COM SIDEBAR */
  {
    path: "/",
    element: <PrivateLayout />,
    children: [
      { index: true, element: <Navigate to="/pacientes" replace /> },
      { path: "inbox", element: <InboxPage /> },
      { path: "pacientes", element: <PacientesPage /> },
      { path: "pacientes/:id", element: <PerfilPacientesPage /> },
      { path: "profissionais", element: <ProfissionaisPage /> },
      { path: "profissionais/:id", element: <PerfilMedicoPage /> },
      { path: "preconsulta/:id", element: <PreConsultaPage /> },
      { path: "agenda", element: <AgendaPage /> },
    ],
  },

  /* PÁGINAS SEM SIDEBAR (layout simples) */
  {
    path: "/",
    element: <BareLayout />,
    children: [
      { path: "prontuario/:id", element: <ProntuarioPage /> },
      { path: "sandbox/:id", element: <SandboxPage /> },
    ],
  },

  /* 404 */
  {
    path: "*",
    element: (
      <div className="p-10 text-center">404 - Página Não Encontrada</div>
    ),
  },
]);

const AppRouter = () => <RouterProvider router={router} />;
export default AppRouter;
