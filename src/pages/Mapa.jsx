import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, Shield, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Mapa() {
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts-all'],
    queryFn: () => base44.entities.Alert.list('-created_date', 10),
  });

  const { data: zones = [] } = useQuery({
    queryKey: ['safezones'],
    queryFn: () => base44.entities.SafeZone.list(),
  });

  const recentWithLocation = alerts.filter(a => a.location_address);

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Navigation size={16} className="text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Geolocalização</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Mapa</h1>
      </div>

      {/* Live Location Card */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Navigation size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-foreground font-bold">Localização Atual</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-blue-600 text-xs font-medium">GPS Ativo</span>
            </div>
          </div>
        </div>

        {/* Simulated map area */}
        <div
          className="w-full h-48 rounded-xl overflow-hidden relative mb-3 bg-blue-50 border border-blue-100"
        >
          {/* Grid pattern for map feel */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59,130,246,0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59,130,246,0.2) 1px, transparent 1px)
              `,
              backgroundSize: '30px 30px'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping scale-150" />
              <div className="absolute inset-0 rounded-full bg-blue-400/30 scale-125" />
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm">
            <p className="text-blue-700 text-xs font-medium">📍 Localização ativa</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
          <MapPin size={14} className="text-blue-600 flex-shrink-0" />
          <p className="text-blue-700 text-sm">Localização sendo monitorada em tempo real</p>
        </div>
      </div>

      {/* Safe Zones */}
      {zones.length > 0 && (
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-blue-600" />
            <h2 className="text-foreground font-bold text-sm">Zonas Seguras</h2>
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
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${zone.is_active ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`} />
                  <span className={`text-xs font-medium ${zone.is_active ? 'text-blue-600' : 'text-gray-400'}`}>
                    {zone.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alert history with location */}
      {recentWithLocation.length > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-red-600" />
            <h2 className="text-foreground font-bold text-sm">Locais de Alertas</h2>
          </div>
          <div className="space-y-2">
            {recentWithLocation.slice(0, 4).map(alert => (
              <div key={alert.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <MapPin size={14} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground text-xs truncate">{alert.location_address}</p>
                  <p className="text-gray-400 text-xs">
                    {format(new Date(alert.created_date), "dd/MM HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {zones.length === 0 && recentWithLocation.length === 0 && (
        <div className="text-center py-8 glass-card rounded-2xl">
          <div className="text-4xl mb-3">🗺️</div>
          <p className="text-foreground font-semibold">Configure suas zonas seguras</p>
          <p className="text-muted-foreground text-sm mt-1">Vá em Configurações para adicionar casa, trabalho…</p>
        </div>
      )}
    </div>
  );
}