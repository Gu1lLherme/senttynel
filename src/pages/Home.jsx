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
  const [sosStep, setSosStep] = useState(0); // 0=idle, 1=first tap, 2=confirmed

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

  // Auto-reset SOS step after 4s
  useEffect(() => {
    if (sosStep === 1) {
      const t = setTimeout(() => setSosStep(0), 4000);
      return () => clearTimeout(t);
    }
  }, [sosStep]);

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
    if (isFalseAlarm && alerts[0]) {
      await base44.entities.Alert.update(alerts[0].id, {
        status: 'falso_positivo',
        user_responded: true
      });
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
    <div className="min-h-screen bg-background px-5 pt-14 pb-24">
      {/* Header */}
      <div className="mb-5 slide-up">
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
        <button
          onClick={handleSOSTap}
          className={`
            w-56 h-56 rounded-3xl flex flex-col items-center justify-center cursor-pointer select-none
            transition-all duration-200 active:scale-95
            ${sosStep === 1
              ? 'bg-gradient-to-br from-orange-500 to-red-600 animate-pulse'
              : 'bg-gradient-to-br from-red-500 to-red-700 hover:brightness-105'
            }
          `}
          style={{
            boxShadow: sosStep === 1
              ? '0 0 0 6px rgba(249,115,22,0.3), 0 12px 40px rgba(220,38,38,0.5)'
              : '0 0 0 4px rgba(220,38,38,0.1), 0 8px 30px rgba(220,38,38,0.3)'
          }}
        >
          <span className="text-white font-black text-4xl tracking-widest">SOS</span>
          <span className="text-white/80 text-sm font-semibold mt-2">
            {sosStep === 0 ? 'EMERGÊNCIA' : 'TOQUE PARA CONFIRMAR'}
          </span>
        </button>
      </div>

      {/* GPS + Running buttons */}
      <div className="grid grid-cols-2 gap-3 slide-up">
        {/* GPS Toggle Button */}
        <button
          onClick={toggleGps}
          className={`glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.97] ${
            gpsActive ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gpsActive ? 'bg-blue-500' : 'bg-gray-100'}`}>
            <MapPin size={22} className={gpsActive ? 'text-white' : 'text-gray-400'} />
          </div>
          <p className="text-foreground font-semibold text-sm">GPS</p>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            gpsActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
          }`}>
            {gpsActive ? 'ON' : 'OFF'}
          </div>
        </button>

        {/* Running Toggle Button */}
        <button
          onClick={() => setRunning(!running)}
          className={`glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.97] ${
            running ? 'ring-2 ring-blue-400' : ''
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${running ? 'bg-blue-500' : 'bg-gray-100'}`}>
            {running
              ? <Square size={20} className="text-white" />
              : <Play size={20} className="text-gray-400 ml-0.5" />
            }
          </div>
          <p className="text-foreground font-semibold text-sm">Corrida</p>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
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