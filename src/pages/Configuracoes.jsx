import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Settings, Bell, Shield, LayoutDashboard, ChevronRight, LogOut, CreditCard, Sparkles,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import PushPermissionCard from '@/components/sentinel/PushPermissionCard';
import PageHeader from '@/components/sentinel/PageHeader';

export default function Configuracoes() {
  const navigate = useNavigate();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const isAdmin = me?.role === 'admin' || me?.role === 'owner';

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4 max-w-md mx-auto">
      <PageHeader
        icon={Settings}
        label="Sistema"
        title="Configurações"
        subtitle="Notificações, planos e preferências"
      />

      <NavCard
        onClick={() => navigate('/planos')}
        gradient="from-pink-500 via-purple-600 to-blue-700"
        shadow="shadow-purple-500/20"
        icon={CreditCard}
        title="Planos & Assinatura"
        subtitle="Básico, Premium e Family"
        badge={<Sparkles size={12} className="text-yellow-200" />}
      />

      {isAdmin && (
        <NavCard
          onClick={() => navigate('/administrativo/dashboard')}
          gradient="from-blue-600 to-blue-800"
          shadow="shadow-blue-500/20"
          icon={LayoutDashboard}
          title="Dashboard Administrativo"
          subtitle="Métricas, alertas e relatórios"
        />
      )}

      <Section icon={Shield} iconColor="text-blue-600" title="Status dos Sensores">
        <div className="space-y-2.5">
          {[
            { name: 'Acelerômetro', desc: 'Detecta quedas e impactos', icon: '📡' },
            { name: 'GPS / Localização', desc: 'Rastreamento em tempo real', icon: '📍' },
            { name: 'Botão de Pânico', desc: 'Acionamento manual SOS', icon: '🆘' },
          ].map(sensor => (
            <div key={sensor.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xl flex-shrink-0">{sensor.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm truncate">{sensor.name}</p>
                <p className="text-muted-foreground text-xs truncate">{sensor.desc}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-blue-600 text-xs font-medium">Ativo</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="mb-4">
        <PushPermissionCard />
      </div>

      <Section icon={Bell} iconColor="text-red-600" title="Alertas">
        <div className="space-y-3">
          {[
            { label: 'Perguntar "Está tudo bem?"', desc: 'Quando detectar anomalia média', defaultOn: true },
            { label: 'Alerta silencioso', desc: 'Notificar contatos sem som', defaultOn: false },
            { label: 'Acionar emergência auto', desc: 'Score crítico sem resposta', defaultOn: false },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm truncate">{item.label}</p>
                <p className="text-muted-foreground text-xs truncate">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultOn} />
            </div>
          ))}
        </div>
      </Section>

      {me && (
        <button
          onClick={handleLogout}
          className="w-full p-3 rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-2 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors mb-4"
        >
          <LogOut size={15} />
          Sair da conta
        </button>
      )}

      <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
        <p className="text-blue-700 text-xs font-semibold mb-1">🔐 Privacidade por Design</p>
        <p className="text-blue-600/70 text-xs leading-relaxed">
          Todo processamento primário acontece no dispositivo. Dados brutos não são enviados para a nuvem.
        </p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, iconColor, title, children }) {
  return (
    <div className="glass-card rounded-2xl p-4 mb-4">
      <div className="flex items-center gap-2.5 mb-3.5">
        <Icon size={16} className={iconColor} />
        <h2 className="text-foreground font-bold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function NavCard({ onClick, gradient, shadow, icon: Icon, title, subtitle, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full mb-3 p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center gap-3 shadow-lg ${shadow} active:scale-[0.98] transition-all`}
    >
      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-white" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-bold text-sm truncate">{title}</p>
          {badge}
        </div>
        <p className="text-white/90 text-xs truncate">{subtitle}</p>
      </div>
      <ChevronRight size={18} className="text-white/80 flex-shrink-0" />
    </button>
  );
}