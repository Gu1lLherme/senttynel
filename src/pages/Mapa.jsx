import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Navigation, Shield, Battery, Crosshair, Plus, AlertTriangle, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LiveMap from '@/components/sentinel/LiveMap';
import PageHeader from '@/components/sentinel/PageHeader';
import ZoneDialog from '@/components/sentinel/ZoneDialog';
import ZoneList from '@/components/sentinel/ZoneList';

export default function Mapa() {
  const [position, setPosition] = useState(null);
  const [battery, setBattery] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('safe');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setError(null);
        base44.functions.invoke('checkGeofence', {
          lat: coords[0], lng: coords[1], battery_level: battery,
        }).catch(() => {});
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [battery]);

  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then(b => setBattery(Math.round(b.level * 100)));
    }
  }, []);

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts-all'],
    queryFn: () => base44.entities.Alert.list('-created_date', 10),
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['safezones'],
    queryFn: () => base44.entities.SafeZone.list(),
  });

  const { data: geoEvents = [] } = useQuery({
    queryKey: ['geofence-events'],
    queryFn: () => base44.entities.GeofenceEvent.list('-created_date', 5),
  });

  const safeZones = zones.filter(z => !z.zone_type || z.zone_type === 'safe');
  const dangerZones = zones.filter(z => z.zone_type === 'danger');
  const currentZones = tab === 'safe' ? safeZones : dangerZones;
  const isDanger = tab === 'danger';

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4 max-w-md mx-auto">
      <PageHeader
        icon={Navigation}
        label="Geolocalização"
        title="Mapa"
        subtitle="Localização em tempo real e cercas"
      />

      <section className="glass-card rounded-2xl p-3 mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${position ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-semibold text-gray-700 truncate">
              {position ? 'GPS Ativo · Tempo real' : 'Aguardando GPS…'}
            </span>
          </div>
          {battery !== null && (
            <div className="flex items-center gap-1 text-xs text-gray-600 flex-shrink-0">
              <Battery size={12} />
              {battery}%
            </div>
          )}
        </div>

        <div className="h-64 sm:h-80 rounded-xl overflow-hidden">
          <LiveMap
            userPosition={position}
            zones={zones}
            alerts={alerts}
            center={position || [-23.5505, -46.6333]}
            zoom={position ? 16 : 12}
          />
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
            ⚠️ {error}. Permita acesso à localização nas configurações do navegador.
          </div>
        )}

        {position && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
            <Crosshair size={13} className="text-blue-600 flex-shrink-0" />
            <p className="text-blue-700 text-xs font-mono truncate">
              {position[0].toFixed(5)}, {position[1].toFixed(5)}
            </p>
          </div>
        )}
      </section>

      <section className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Shield size={16} className={isDanger ? 'text-red-600' : 'text-blue-600'} />
            <div className="min-w-0">
              <h2 className="text-foreground font-bold text-sm truncate">Cercas Geográficas</h2>
              <p className="text-muted-foreground text-[11px]">Zonas seguras e de perigo</p>
            </div>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
              isDanger ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
            }`}
            aria-label="Adicionar zona"
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 p-1 bg-gray-100 rounded-xl">
          <TabButton
            active={tab === 'safe'}
            onClick={() => setTab('safe')}
            icon={MapPin}
            label="Seguras"
            count={safeZones.length}
            accent="blue"
          />
          <TabButton
            active={tab === 'danger'}
            onClick={() => setTab('danger')}
            icon={AlertTriangle}
            label="Perigo"
            count={dangerZones.length}
            accent="red"
          />
        </div>

        <ZoneList
          zones={currentZones}
          emptyText={isDanger ? 'Nenhuma zona de perigo cadastrada' : 'Nenhuma zona segura cadastrada'}
          accent={isDanger ? 'red' : 'blue'}
        />
      </section>

      {geoEvents.length > 0 && (
        <section className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-emerald-600" />
            <h2 className="text-foreground font-bold text-sm">Atividade recente</h2>
          </div>
          <div className="space-y-2">
            {geoEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  ev.event_type === 'enter' ? 'bg-emerald-50' : 'bg-amber-50'
                }`}>
                  <span className="text-sm">{ev.event_type === 'enter' ? '🟢' : '🟡'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-sm truncate">
                    {ev.event_type === 'enter' ? 'Chegou em' : 'Saiu de'} {ev.zone_name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {format(new Date(ev.created_date), "dd/MM HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <ZoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        zoneType={tab}
      />
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label, count, accent }) {
  const activeClasses = accent === 'red'
    ? 'bg-white text-red-600 shadow-sm'
    : 'bg-white text-blue-600 shadow-sm';
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
        active ? activeClasses : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon size={13} />
      <span>{label}</span>
      <span className={`px-1.5 rounded-full text-[10px] ${
        active ? (accent === 'red' ? 'bg-red-100' : 'bg-blue-100') : 'bg-gray-200'
      }`}>
        {count}
      </span>
    </button>
  );
}