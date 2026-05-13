import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Settings, Bell, Shield, LayoutDashboard, ChevronRight, LogOut, CreditCard,
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
  const handleLogout = () => base44.auth.logout('/');

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-24 max-w-md mx-auto">
      <PageHeader
        icon={Settings}
        label="Sistema"
        title="Configurações"
        subtitle="Notificações, planos e preferências"
      />

      <NavCard
        onClick={() => navigate('/planos')}
        icon={CreditCard}
        title="Planos & Assinatura"
        subtitle="Básico, Premium e Family"
      />

      {isAdmin && (
        <NavCard
          onClick={() => navigate('/administrativo/dashboard')}
          icon={LayoutDashboard}
          title="Dashboard Administrativo"
          subtitle="Métricas, alertas e relatórios"
        />
      )}

      <Section icon={Shield} title="Status dos Sensores">
        <div className="space-y-2">
          {[
            { name: 'Acelerômetro', desc: 'Detecta quedas e impactos' },
            { name: 'GPS / Localização', desc: 'Rastreamento em tempo real' },
            { name: 'Botão de Pânico', desc: 'Acionamento manual SOS' },
          ].map(sensor => (
            <div
              key={sensor.name}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#EBF0F8', border: '1px solid #C4D0E5' }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#0C1A38' }}>{sensor.name}</p>
                <p className="text-xs truncate" style={{ color: '#607090' }}>{sensor.desc}</p>
              </div>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                style={{ background: '#DDF0E6', color: '#155230' }}
              >
                Ativo
              </span>
            </div>
          ))}
        </div>
      </Section>

      <div className="mb-4">
        <PushPermissionCard />
      </div>

      <Section icon={Bell} title="Alertas">
        <div className="space-y-3">
          {[
            { label: 'Perguntar "Está tudo bem?"', desc: 'Quando detectar anomalia média', defaultOn: true },
            { label: 'Alerta silencioso', desc: 'Notificar contatos sem som', defaultOn: false },
            { label: 'Acionar emergência auto', desc: 'Score crítico sem resposta', defaultOn: false },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#0C1A38' }}>{item.label}</p>
                <p className="text-xs truncate" style={{ color: '#607090' }}>{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultOn} />
            </div>
          ))}
        </div>
      </Section>

      {me && (
        <button
          onClick={handleLogout}
          className="w-full p-3 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm transition-colors mb-4"
          style={{ background: '#FFFFFF', border: '1px solid #C4D0E5', color: '#A81825' }}
        >
          <LogOut size={15} />
          Sair da conta
        </button>
      )}

      <div
        className="p-3 rounded-2xl"
        style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
      >
        <p className="text-xs font-semibold mb-1" style={{ color: '#0C1A38' }}>🔐 Privacidade por Design</p>
        <p className="text-xs leading-relaxed" style={{ color: '#607090' }}>
          Todo processamento primário acontece no dispositivo. Dados brutos não são enviados para a nuvem.
        </p>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <Icon size={16} style={{ color: '#1743B8' }} />
        <h2 className="font-bold text-sm" style={{ color: '#0C1A38' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function NavCard({ onClick, icon: Icon, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      className="w-full mb-3 p-4 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-all"
      style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#EBF0F8' }}
      >
        <Icon size={18} style={{ color: '#1743B8' }} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="font-bold text-sm truncate" style={{ color: '#0C1A38' }}>{title}</p>
        <p className="text-xs truncate" style={{ color: '#607090' }}>{subtitle}</p>
      </div>
      <ChevronRight size={18} style={{ color: '#8A9FC0' }} className="flex-shrink-0" />
    </button>
  );
}