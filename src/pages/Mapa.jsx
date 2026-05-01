import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, Shield, Clock, Battery, Crosshair } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LiveMap from '@/components/sentinel/LiveMap';

export default function Mapa() {
  const [position, setPosition] = useState(null);
  const [battery, setBattery] = useState(null);
  const [error, setError] = useState(null);

  // Get current location
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
        // Save ping & check geofence
        base44.functions.invoke('checkGeofence', {
          lat: coords[0], lng: coords[1], battery_level: battery,
        }).catch(() => {});
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [battery]);

  // Battery level (when supported)
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

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Navigation size={16} className="text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Geolocalização</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Mapa</h1>
      </div>

      {/* Live Map */}
      <div className="glass-card rounded-2xl p-3 mb-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${position ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-semibold text-gray-700">
              {position ? 'GPS Ativo · Tempo real' : 'Aguardando GPS…'}
            </span>
          </div>
          {battery !== null && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Battery size={12} />
              {battery}%
            </div>
          )}
        </div>

        <div className="h-72 sm:h-96 rounded-xl overflow-hidden">
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
            <p className="text-blue-700 text-xs font-mono">
              {position[0].toFixed(5)}, {position[1].toFixed(5)}
            </p>
          </div>
        )}
      </div>

      {/* Geofence events */}
      {geoEvents.length > 0 && (
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-emerald-600" />
            <h2 className="text-foreground font-bold text-sm">Cercas Geográficas — Recentes</h2>
          </div>
          <div className="space-y-2">
            {geoEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
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
        </div>
      )}

      {/* Zones list */}
      {zones.length > 0 && (
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-blue-600" />
            <h2 className="text-foreground font-bold text-sm">Zonas Seguras Configuradas</h2>
          </div>
          <div className="space-y-2">
            {zones.map(zone => (
              <div key={zone.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Shield size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-sm">{zone.name}</p>
                  <p className="text-muted-foreground text-xs truncate">{zone.address}</p>
                </div>
                <span className={`text-xs font-medium ${zone.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {zone.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {zones.length === 0 && (
        <div className="text-center py-6 glass-card rounded-2xl">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-foreground font-semibold">Configure suas zonas seguras</p>
          <p className="text-muted-foreground text-sm mt-1 px-4">
            Vá em Configurações para adicionar casa, escola, trabalho…
          </p>
        </div>
      )}
    </div>
  );
}