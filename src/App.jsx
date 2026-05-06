import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Mapa from '@/pages/Mapa';
import Contatos from '@/pages/Contatos';
import Configuracoes from '@/pages/Configuracoes';
import Historico from '@/pages/Historico';
import BemVindo from '@/pages/BemVindo';
import Acesso from '@/pages/Acesso';
import ControleParental from '@/pages/ControleParental';
import AdminDashboard from '@/pages/AdminDashboard';
import EncontrarDispositivo from '@/pages/EncontrarDispositivo';
import CriancaDetalhe from '@/pages/CriancaDetalhe';
import CadastrarFamilia from '@/pages/CadastrarFamilia';
import CadastrarDispositivos from '@/pages/CadastrarDispositivos';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-3xl">🛡️</span>
          </div>
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Carregando SENTINEL…</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Standalone (no layout) */}
      <Route path="/bem-vindo" element={<BemVindo />} />
      <Route path="/acesso" element={<Acesso />} />
      <Route path="/administrativo/dashboard" element={<AdminDashboard />} />

      {/* Default landing → BemVindo */}
      <Route path="/" element={<BemVindo />} />

      {/* App with bottom nav */}
      <Route element={<Layout />}>
        <Route path="/app" element={<Home />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/contatos" element={<Contatos />} />
        <Route path="/familia" element={<ControleParental />} />
        <Route path="/familia/cadastrar" element={<CadastrarFamilia />} />
        <Route path="/familia/dispositivos" element={<CadastrarDispositivos />} />
        <Route path="/familia/:id" element={<CriancaDetalhe />} />
        <Route path="/encontrar-dispositivo" element={<EncontrarDispositivo />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/historico" element={<Historico />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;