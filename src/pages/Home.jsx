import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Zap, MapPin, Play, Square } from 'lucide-react';
import StatusBadge from '@/components/sentinel/StatusBadge';
import SOSModal from '@/components/sentinel/SOSModal';

export default function Home() {
  const [user, setUser] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [running, setRunning] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);

  // SOS hold state
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    // Check GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsActive(true),
        () => setGpsActive(false)
      );
    }
    return () => clearInterval(timer);
  }, []);

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts-active'],
    queryFn: () => base44.entities.Alert.filter({ status: 'ativo' }, '-created_date', 5)
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
        contacts_notified: contacts.map((c) => c.id),
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

  // SOS press handlers
  const startPress = () => {
    setPressing(true);
    let p = 0;
    const id = setInterval(() => {
      p += 4;
      setProgress(p);
      if (p >= 100) {
        clearInterval(id);
        setPressing(false);
        setProgress(0);
        handleSOSActivate();
      }
    }, 100);
    setIntervalId(id);
  };

  const cancelPress = () => {
    if (intervalId) clearInterval(intervalId);
    setPressing(false);
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-24">
      {/* Header */}
      <div className="mb-6 slide-up">
        <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-1">
          {greeting}
        </p>
        <h1 className="text-foreground text-3xl font-black">
          {user?.full_name?.split(' ')[0] || 'Usuário'}
        </h1>
        <div className="mt-2">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Active Alert Banner */}
      {hasActiveAlert && (
        <div className="mb-5 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 slide-up">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-red-600 font-bold text-sm">Alerta Ativo</p>
            <p className="text-red-400 text-xs truncate">
              {alerts[0]?.type === 'manual' ? 'Pânico acionado' : alerts[0]?.type} — contatos notificados
            </p>
          </div>
        </div>
      )}

      {/* SOS Square Button */}
      <div className="flex justify-center mb-6 slide-up">
        <div className="relative">
          {/* Progress border overlay */}
          {pressing && (
            <div
              className="absolute inset-0 rounded-3xl border-4 border-white/60 z-10 pointer-events-none"
              style={{
                background: `conic-gradient(rgba(255,255,255,0.4) ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`,
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
                padding: '4px',
                borderRadius: '1.5rem',
              }}
            />
          )}
          <button
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            className={`
              w-48 h-48 rounded-3xl bg-gradient-to-br from-red-500 to-red-700
              flex flex-col items-center justify-center cursor-pointer select-none
              transition-all duration-200 active:scale-95
              ${pressing ? 'scale-95 brightness-110' : 'hover:brightness-105'}
            `}
            style={{
              boxShadow: pressing
                ? '0 0 0 6px rgba(220,38,38,0.2), 0 12px 40px rgba(220,38,38,0.5)'
                : '0 0 0 4px rgba(220,38,38,0.1), 0 8px 30px rgba(220,38,38,0.3)'
            }}
          >
            <span className="text-white font-black text-3xl tracking-widest">SOS</span>
            <span className="text-white/70 text-xs font-semibold mt-1">
              {pressing ? `${Math.round(progress)}%` : 'Segure 3s'}
            </span>
          </button>
        </div>
      </div>

      {/* GPS Status + Running Toggle */}
      <div className="space-y-3 slide-up">
        {/* GPS Status */}
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gpsActive ? 'bg-blue-50' : 'bg-gray-100'}`}>
              <MapPin size={20} className={gpsActive ? 'text-blue-600' : 'text-gray-400'} />
            </div>
            <div>
              <p className="text-foreground font-semibold text-sm">GPS</p>
              <p className={`text-xs font-medium ${gpsActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {gpsActive ? 'Ativo' : 'Inativo'}
              </p>
            </div>
          </div>
          <span className={`w-3 h-3 rounded-full ${gpsActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
        </div>

        {/* Running Toggle */}
        <button
          onClick={() => setRunning(!running)}
          className={`w-full glass-card rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 active:scale-[0.98] ${
            running ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${running ? 'bg-blue-500' : 'bg-gray-100'}`}>
              {running
                ? <Square size={18} className="text-white" />
                : <Play size={18} className="text-gray-400 ml-0.5" />
              }
            </div>
            <div className="text-left">
              <p className="text-foreground font-semibold text-sm">Modo Corrida</p>
              <p className={`text-xs font-medium ${running ? 'text-blue-600' : 'text-gray-400'}`}>
                {running ? 'Monitoramento ativo' : 'Toque para iniciar'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
            running ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {running ? 'ON' : 'OFF'}
          </div>
        </button>
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