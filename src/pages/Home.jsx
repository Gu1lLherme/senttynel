import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Zap, MapPin, Play, Square, Check } from 'lucide-react';
import StatusBadge from '@/components/sentinel/StatusBadge';
import SOSModal from '@/components/sentinel/SOSModal';

export default function Home() {
  const [user, setUser] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [running, setRunning] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [sosStep, setSosStep] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsActive(true),
        () => setGpsActive(false)
      );
    }
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sosStep === 1) {
      const t = setTimeout(() => setSosStep(0), 4000);
      return () => clearTimeout(t);
    }
  }, [sosStep]);

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts-active'],
    queryFn: () => base44.entities.Alert.filter({ status: 'ativo' }, '-created_date', 5),
    refetchInterval: 15000,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-priority', 10)
  });

  const hour = currentTime.getHours();
  const greeting =
    hour < 12 ? 'Bom Dia' :
    hour < 18 ? 'Boa Tarde' :
    'Boa Noite';

  const THIRTY_MIN = 30 * 60 * 1000;
  const nowTs = Date.now();
  const liveAlert = alerts.find(a => {
    const age = nowTs - new Date(a.created_date).getTime();
    if (age > THIRTY_MIN) return false;
    if (a.type === 'manual') return true;
    return a.severity === 'critico' || a.severity === 'alto';
  });
  const hasActiveAlert = !!liveAlert;
  const status = hasActiveAlert ? 'perigo' : 'segura';

  const handleSOSTap = () => {
    if (sosStep === 0) {
      setSosStep(1);
    } else if (sosStep === 1) {
      setSosStep(0);
      triggerSOS();
    }
  };

  const triggerSOS = async () => {
    setSosActive(true);
    try {
      await base44.entities.Alert.create({
        type: 'manual',
        severity: 'critico',
        status: 'ativo',
        risk_score: 100,
        contacts_notified: contacts.map((c) => c.id),
        notes: 'Botão de pânico acionado manualmente'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSOSClose = async (isFalseAlarm) => {
    setSosActive(false);
    if (isFalseAlarm && liveAlert) {
      await base44.entities.Alert.update(liveAlert.id, {
        status: 'falso_positivo',
        user_responded: true
      });
    }
  };

  const handleImOk = async () => {
    if (!liveAlert) return;
    setDismissing(true);
    try {
      await base44.entities.Alert.update(liveAlert.id, {
        status: 'falso_positivo',
        user_responded: true,
        notes: (liveAlert.notes || '') + ' · Usuário confirmou que está bem'
      });
      queryClient.invalidateQueries({ queryKey: ['alerts-active'] });
    } finally {
      setDismissing(false);
    }
  };

  const toggleGps = () => {
    if (!gpsActive && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsActive(true),
        () => setGpsActive(false)
      );
    } else {
      setGpsActive(!gpsActive);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-6 pb-24 flex flex-col max-w-md mx-auto">
      {/* Header — tipografia display para saudação */}
      <header className="flex-shrink-0">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-1"
          style={{ color: '#1743B8' }}
        >
          {greeting}
        </p>
        <h1
          className="font-display text-3xl leading-tight"
          style={{ color: '#0C1A38' }}
        >
          {user?.full_name?.split(' ')[0] || 'Usuário'}
        </h1>
        <div className="mt-2">
          <StatusBadge status={status} />
        </div>
      </header>

      {/* Active Alert Banner */}
      {hasActiveAlert && (
        <div
          className="flex-shrink-0 mt-4 p-3 rounded-2xl flex items-center gap-2.5"
          style={{ background: '#FBEAEC', border: '1px solid #F1C5CA' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#FFFFFF' }}
          >
            <Zap size={14} style={{ color: '#A81825' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs" style={{ color: '#A81825' }}>Alerta Ativo</p>
            <p className="text-xs truncate" style={{ color: '#7A1020' }}>
              {liveAlert?.type === 'manual' ? 'Pânico acionado' :
               liveAlert?.type === 'queda' ? 'Queda detectada' :
               liveAlert?.type === 'imobilidade' ? 'Imobilidade prolongada' :
               liveAlert?.type === 'rota_desviada' ? 'Rota desviada' :
               liveAlert?.type}
            </p>
          </div>
          <button
            onClick={handleImOk}
            disabled={dismissing}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold disabled:opacity-60 transition"
            style={{ background: '#155230', color: '#FFFFFF' }}
          >
            <Check size={12} />
            Estou bem
          </button>
        </div>
      )}

      {/* SOS Button — sólido, sem gradiente, com borda inferior #7A1020 */}
      <div className="flex-1 flex items-center justify-center min-h-0 py-6">
        <button
          onClick={handleSOSTap}
          className={`
            aspect-square w-full max-w-[16rem] flex flex-col items-center justify-center cursor-pointer select-none
            transition-transform duration-150 active:scale-[0.97]
            ${sosStep === 1 ? 'animate-pulse' : ''}
          `}
          style={{
            background: '#A81825',
            borderRadius: 18,
            borderBottom: '1px solid #7A1020',
            color: '#FFFFFF',
          }}
        >
          <span className="font-display text-5xl tracking-[0.18em]">SOS</span>
          <span className="text-xs font-semibold tracking-[0.18em] mt-2 text-white/90">
            {sosStep === 0 ? 'EMERGÊNCIA' : 'TOQUE PARA CONFIRMAR'}
          </span>
        </button>
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-3">
        <ControlTile active={gpsActive} onClick={toggleGps} label="GPS" icon={MapPin} />
        <ControlTile
          active={running}
          onClick={() => setRunning(!running)}
          label="Corrida"
          icon={running ? Square : Play}
        />
      </div>

      {sosActive && <SOSModal contacts={contacts} onClose={handleSOSClose} />}
    </div>
  );
}

function ControlTile({ active, onClick, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl p-3 flex items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform"
      style={{
        background: '#FFFFFF',
        border: `1px solid ${active ? '#1743B8' : '#C4D0E5'}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: active ? '#1743B8' : '#EBF0F8' }}
      >
        <Icon size={18} style={{ color: active ? '#FFFFFF' : '#1743B8' }} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="font-semibold text-sm" style={{ color: '#0C1A38' }}>{label}</p>
        <p className="text-xs font-medium" style={{ color: active ? '#1743B8' : '#8A9FC0' }}>
          {active ? 'Ativo' : 'Inativo'}
        </p>
      </div>
    </button>
  );
}