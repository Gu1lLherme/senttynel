import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Zap, Clock, Home as HomeIcon } from 'lucide-react';
import StatusBadge from '@/components/sentinel/StatusBadge';
import SensorCard from '@/components/sentinel/SensorCard';
import SOSButton from '@/components/sentinel/SOSButton';
import SOSModal from '@/components/sentinel/SOSModal';
import { Link } from 'react-router-dom';

export default function Home() {
  const [user, setUser] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts-active'],
    queryFn: () => base44.entities.Alert.filter({ status: 'ativo' }, '-created_date', 5),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-priority', 10),
  });

  const hour = currentTime.getHours();
  const greeting =
    hour < 12 ? 'Bom Dia' :
    hour < 18 ? 'Boa Tarde' :
    'Boa Noite';

  const hasActiveAlert = alerts.length > 0;
  const status = hasActiveAlert ? 'perigo' : 'segura';

  const handleSOSActivate = async () => {
    setSosActive(true);
    try {
      await base44.entities.Alert.create({
        type: 'manual',
        severity: 'critico',
        status: 'ativo',
        risk_score: 100,
        contacts_notified: contacts.map(c => c.id),
        notes: 'Botão de pânico acionado manualmente'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSOSClose = async (isFalseAlarm) => {
    setSosActive(false);
    if (isFalseAlarm && alerts[0]) {
      await base44.entities.Alert.update(alerts[0].id, {
        status: 'falso_positivo',
        user_responded: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-6 slide-up">
        <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-1">
          {greeting}
        </p>
        <h1 className="text-foreground text-3xl font-black">
          {user?.full_name?.split(' ')[0] || 'Usuário'}
        </h1>

        {/* Status row */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          <StatusBadge status={status} />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-white/10 text-sm font-semibold text-muted-foreground">
            <HomeIcon size={13} />
            Casa
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-white/10 text-sm text-muted-foreground">
            <Clock size={13} />
            {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Active Alert Banner */}
      {hasActiveAlert && (
        <div className="mb-4 p-3 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center gap-3 slide-up">
          <div className="w-8 h-8 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-red-400 font-bold text-sm">Alerta Ativo</p>
            <p className="text-red-300/70 text-xs truncate">
              {alerts[0]?.type === 'manual' ? 'Pânico acionado' : alerts[0]?.type} — contatos notificados
            </p>
          </div>
        </div>
      )}

      {/* Sensor Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <SensorCard
          icon="📍"
          label="Localização"
          value="GPS ativo"
          color="cyan"
          active={true}
        />
        <SensorCard
          icon="⚡"
          label="Movimento"
          value="Estável"
          color="green"
          active={true}
        />
      </div>

      {/* SOS Button */}
      <div className="flex justify-center mb-6">
        <SOSButton onActivate={handleSOSActivate} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link to="/contatos">
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/10 transition-all duration-200 active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-xl">👥</div>
            <p className="text-foreground text-xs font-semibold text-center">Contatos</p>
            <p className="text-muted-foreground text-xs text-center">{contacts.length} ativos</p>
          </div>
        </Link>
        <Link to="/configuracoes">
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/10 transition-all duration-200 active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-xl">⚙️</div>
            <p className="text-foreground text-xs font-semibold text-center">Config</p>
            <p className="text-muted-foreground text-xs text-center">Zonas seguras</p>
          </div>
        </Link>
        <Link to="/historico">
          <div className="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-white/10 transition-all duration-200 active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-xl">📋</div>
            <p className="text-foreground text-xs font-semibold text-center">Histórico</p>
            <p className="text-muted-foreground text-xs text-center">Ver registros</p>
          </div>
        </Link>
      </div>

      {/* SOS Modal */}
      {sosActive && (
        <SOSModal
          contacts={contacts}
          onClose={handleSOSClose}
        />
      )}
    </div>
  );
}