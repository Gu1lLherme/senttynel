import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Trash2, Home, Briefcase, GraduationCap, MapPin, Settings,
  Bell, Shield, LayoutDashboard, ChevronRight, LogOut, Loader2, CreditCard, Sparkles,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import PushPermissionCard from '@/components/sentinel/PushPermissionCard';

const zoneIcons = {
  home: { icon: Home, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Casa' },
  work: { icon: Briefcase, color: 'text-blue-700', bg: 'bg-blue-50', label: 'Trabalho' },
  school: { icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Escola' },
  gym: { icon: '💪', color: 'text-red-600', bg: 'bg-red-50', label: 'Academia' },
  other: { icon: MapPin, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Outro' },
};

export default function Configuracoes() {
  const navigate = useNavigate();
  const [openZone, setOpenZone] = useState(false);
  const [zoneForm, setZoneForm] = useState({
    name: '', address: '', icon: 'home', radius_meters: 200,
    notify_on_enter: true, notify_on_exit: true,
  });
  const [geocoding, setGeocoding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['safezones'],
    queryFn: () => base44.entities.SafeZone.list(),
  });

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const isAdmin = me?.role === 'admin' || me?.role === 'owner';

  const createZone = useMutation({
    mutationFn: async (data) => {
      // Geocode address using Nominatim
      setGeocoding(true);
      let coords = { lat: null, lng: null };
      try {
        const res = await base44.functions.invoke('geocodeAddress', { address: data.address });
        if (res.data?.found) {
          coords = { lat: res.data.lat, lng: res.data.lng };
        }
      } catch (e) {
        console.warn('Geocoding failed:', e);
      } finally {
        setGeocoding(false);
      }
      return base44.entities.SafeZone.create({
        ...data, ...coords, is_active: true,
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['safezones'] });
      setOpenZone(false);
      setZoneForm({
        name: '', address: '', icon: 'home', radius_meters: 200,
        notify_on_enter: true, notify_on_exit: true,
      });
      toast({
        title: result.lat ? 'Zona segura adicionada' : 'Zona adicionada (sem coordenadas)',
        description: result.lat ? 'Cerca geográfica ativa no mapa.' : 'Endereço não foi geolocalizado.',
      });
    }
  });

  const deleteZone = useMutation({
    mutationFn: (id) => base44.entities.SafeZone.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safezones'] });
      toast({ title: 'Zona removida' });
    }
  });

  const toggleZone = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.SafeZone.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['safezones'] }),
  });

  const handleSubmitZone = (e) => {
    e.preventDefault();
    if (!zoneForm.name || !zoneForm.address) return;
    createZone.mutate(zoneForm);
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Settings size={16} className="text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Sistema</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Configurações</h1>
      </div>

      {/* Plans / Billing */}
      <button
        onClick={() => navigate('/planos')}
        className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-blue-700 text-white flex items-center gap-3 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <CreditCard size={18} className="text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-sm">Planos & Assinatura</p>
            <Sparkles size={12} className="text-yellow-200" />
          </div>
          <p className="text-white/90 text-xs">Básico, Premium e Family</p>
        </div>
        <ChevronRight size={18} className="text-white/80" />
      </button>

      {/* Admin Dashboard Access */}
      {isAdmin && (
        <button
          onClick={() => navigate('/administrativo/dashboard')}
          className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center gap-3 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm">Dashboard Administrativo</p>
            <p className="text-blue-100 text-xs">Métricas, alertas e relatórios</p>
          </div>
          <ChevronRight size={18} className="text-white/80" />
        </button>
      )}

      {/* Sensor Status */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={18} className="text-blue-600" />
          <h2 className="text-foreground font-bold text-base">Status dos Sensores</h2>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Acelerômetro', desc: 'Detecta quedas e impactos', icon: '📡' },
            { name: 'GPS / Localização', desc: 'Rastreamento em tempo real', icon: '📍' },
            { name: 'Botão de Pânico', desc: 'Acionamento manual SOS', icon: '🆘' },
          ].map(sensor => (
            <div key={sensor.name} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xl">{sensor.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm">{sensor.name}</p>
                <p className="text-muted-foreground text-xs">{sensor.desc}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-blue-600 text-xs font-medium">Ativo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Push notifications */}
      <div className="mb-4">
        <PushPermissionCard />
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={18} className="text-red-600" />
          <h2 className="text-foreground font-bold text-base">Alertas</h2>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Perguntar "Está tudo bem?"', desc: 'Quando detectar anomalia média', defaultOn: true },
            { label: 'Alerta silencioso', desc: 'Notificar contatos sem som', defaultOn: false },
            { label: 'Acionar emergência auto', desc: 'Score crítico sem resposta', defaultOn: false },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm">{item.label}</p>
                <p className="text-muted-foreground text-xs">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultOn} />
            </div>
          ))}
        </div>
      </div>

      {/* Safe Zones / Geofencing */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-blue-600" />
            <div>
              <h2 className="text-foreground font-bold text-base">Cercas Geográficas</h2>
              <p className="text-muted-foreground text-xs">Zonas seguras com notificação</p>
            </div>
          </div>
          <button
            onClick={() => setOpenZone(true)}
            className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <Plus size={16} className="text-blue-600" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">Nenhuma cerca configurada</p>
            <button
              onClick={() => setOpenZone(true)}
              className="mt-2 text-blue-600 text-sm font-semibold cursor-pointer hover:opacity-80"
            >
              Adicionar casa, escola, trabalho…
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {zones.map(zone => {
              const zc = zoneIcons[zone.icon] || zoneIcons.other;
              const IconComp = typeof zc.icon === 'string' ? null : zc.icon;
              return (
                <div key={zone.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${zc.bg}`}>
                    {IconComp ? <IconComp size={16} className={zc.color} /> : <span>{zc.icon}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-semibold text-sm truncate">{zone.name}</p>
                    <p className="text-muted-foreground text-xs truncate">{zone.address}</p>
                    {zone.lat && (
                      <p className="text-emerald-600 text-[10px] font-semibold">
                        ✓ Geolocalizado · raio {zone.radius_meters}m
                      </p>
                    )}
                  </div>
                  <Switch
                    checked={zone.is_active}
                    onCheckedChange={(v) => toggleZone.mutate({ id: zone.id, is_active: v })}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        aria-label={`Remover ${zone.name}`}
                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} className="text-red-500" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-gray-200 max-w-sm mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover cerca?</AlertDialogTitle>
                        <AlertDialogDescription>
                          A cerca "{zone.name}" será removida.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteZone.mutate(zone.id)}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Logout */}
      {me && (
        <button
          onClick={handleLogout}
          className="w-full p-3 rounded-2xl bg-white border border-gray-200 flex items-center justify-center gap-2 text-red-600 font-semibold text-sm hover:bg-red-50 transition-colors mb-4"
        >
          <LogOut size={15} />
          Sair da conta
        </button>
      )}

      {/* Privacy note */}
      <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
        <p className="text-blue-700 text-xs font-semibold mb-1">🔐 Privacidade por Design</p>
        <p className="text-blue-600/70 text-xs">
          Todo processamento primário acontece no dispositivo. Dados brutos não são enviados para a nuvem.
        </p>
      </div>

      {/* Zone Dialog */}
      <Dialog open={openZone} onOpenChange={setOpenZone}>
        <DialogContent className="bg-white border-gray-200 max-w-sm mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">Nova Cerca Geográfica</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitZone} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="zone-name" className="text-muted-foreground text-sm">Nome</Label>
              <Input
                id="zone-name"
                placeholder="Ex: Escola da Maria"
                value={zoneForm.name}
                onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })}
                className="bg-gray-50 border-gray-200 rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zone-address" className="text-muted-foreground text-sm">Endereço completo</Label>
              <Input
                id="zone-address"
                placeholder="Rua, número, cidade, estado"
                value={zoneForm.address}
                onChange={e => setZoneForm({ ...zoneForm, address: e.target.value })}
                className="bg-gray-50 border-gray-200 rounded-xl"
                required
              />
              <p className="text-xs text-muted-foreground">Será geolocalizado automaticamente</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zone-radius" className="text-muted-foreground text-sm">Raio (metros)</Label>
              <Input
                id="zone-radius"
                type="number"
                min="50"
                max="5000"
                value={zoneForm.radius_meters}
                onChange={e => setZoneForm({ ...zoneForm, radius_meters: parseInt(e.target.value) || 200 })}
                className="bg-gray-50 border-gray-200 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">Tipo de Local</Label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(zoneIcons).slice(0, 4).map(([key, val]) => {
                  const Ic = typeof val.icon === 'string' ? null : val.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setZoneForm({ ...zoneForm, icon: key })}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        zoneForm.icon === key ? `${val.bg} border-2 border-blue-400 ${val.color}` : 'bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      {Ic ? <Ic size={18} className={zoneForm.icon === key ? val.color : 'text-gray-400'} />
                           : <span className="text-lg">{val.icon}</span>}
                      <span className={`text-xs ${zoneForm.icon === key ? val.color : 'text-gray-400'}`}>{val.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Notificar ao chegar</Label>
                <Switch
                  checked={zoneForm.notify_on_enter}
                  onCheckedChange={(v) => setZoneForm({ ...zoneForm, notify_on_enter: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-foreground">Notificar ao sair</Label>
                <Switch
                  checked={zoneForm.notify_on_exit}
                  onCheckedChange={(v) => setZoneForm({ ...zoneForm, notify_on_exit: v })}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={createZone.isPending || geocoding}
              className="w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {(createZone.isPending || geocoding) && <Loader2 size={16} className="animate-spin" />}
              {geocoding ? 'Localizando endereço…' : createZone.isPending ? 'Salvando…' : 'Adicionar Cerca'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}