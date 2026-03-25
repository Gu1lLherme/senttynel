import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Home, Briefcase, GraduationCap, MapPin, Settings, Bell, Shield } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const zoneIcons = {
  home: { icon: Home, color: 'text-cyan-400', bg: 'bg-cyan-500/15', label: 'Casa' },
  work: { icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-500/15', label: 'Trabalho' },
  school: { icon: GraduationCap, color: 'text-yellow-400', bg: 'bg-yellow-500/15', label: 'Escola' },
  gym: { icon: '💪', color: 'text-green-400', bg: 'bg-green-500/15', label: 'Academia' },
  other: { icon: MapPin, color: 'text-orange-400', bg: 'bg-orange-500/15', label: 'Outro' },
};

export default function Configuracoes() {
  const [openZone, setOpenZone] = useState(false);
  const [zoneForm, setZoneForm] = useState({ name: '', address: '', icon: 'home', radius_meters: 200 });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['safezones'],
    queryFn: () => base44.entities.SafeZone.list(),
  });

  const createZone = useMutation({
    mutationFn: (data) => base44.entities.SafeZone.create({ ...data, is_active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['safezones'] });
      setOpenZone(false);
      setZoneForm({ name: '', address: '', icon: 'home', radius_meters: 200 });
      toast({ title: 'Zona segura adicionada' });
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

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Settings size={16} className="text-cyan-400" />
          </div>
          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Sistema</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Configurações</h1>
      </div>

      {/* Sensor Status */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={18} className="text-primary" />
          <h2 className="text-foreground font-bold text-base">Status dos Sensores</h2>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Acelerômetro', desc: 'Detecta quedas e impactos', active: true, icon: '📡' },
            { name: 'GPS / Localização', desc: 'Rastreamento em tempo real', active: true, icon: '📍' },
            { name: 'Botão de Pânico', desc: 'Acionamento manual SOS', active: true, icon: '🆘' },
          ].map(sensor => (
            <div key={sensor.name} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
              <span className="text-xl">{sensor.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-semibold text-sm">{sensor.name}</p>
                <p className="text-muted-foreground text-xs">{sensor.desc}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium">Ativo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell size={18} className="text-primary" />
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

      {/* Safe Zones */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-primary" />
            <h2 className="text-foreground font-bold text-base">Zonas Seguras</h2>
          </div>
          <button
            onClick={() => setOpenZone(true)}
            className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors cursor-pointer"
          >
            <Plus size={16} className="text-primary" />
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <div key={i} className="h-16 rounded-xl bg-secondary/40 animate-pulse" />)}
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm">Nenhuma zona segura configurada</p>
            <button
              onClick={() => setOpenZone(true)}
              className="mt-2 text-primary text-sm font-semibold cursor-pointer hover:opacity-80"
            >
              Adicionar casa, trabalho…
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {zones.map(zone => {
              const zc = zoneIcons[zone.icon] || zoneIcons.other;
              const IconComp = typeof zc.icon === 'string' ? null : zc.icon;
              return (
                <div key={zone.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${zc.bg}`}>
                    {IconComp ? <IconComp size={16} className={zc.color} /> : <span>{zc.icon}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-semibold text-sm truncate">{zone.name}</p>
                    <p className="text-muted-foreground text-xs truncate">{zone.address}</p>
                  </div>
                  <Switch
                    checked={zone.is_active}
                    onCheckedChange={(v) => toggleZone.mutate({ id: zone.id, is_active: v })}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        aria-label={`Remover ${zone.name}`}
                        className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border max-w-sm mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover zona?</AlertDialogTitle>
                        <AlertDialogDescription>
                          A zona "{zone.name}" será removida.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteZone.mutate(zone.id)}
                          className="bg-destructive text-destructive-foreground"
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

      {/* Privacy note */}
      <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
        <p className="text-green-400 text-xs font-semibold mb-1">🔐 Privacidade por Design</p>
        <p className="text-green-300/70 text-xs">
          Todo processamento primário acontece no dispositivo. Dados brutos não são enviados para a nuvem.
        </p>
      </div>

      {/* Zone Dialog */}
      <Dialog open={openZone} onOpenChange={setOpenZone}>
        <DialogContent className="bg-card border-border max-w-sm mx-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl font-black">Nova Zona Segura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitZone} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="zone-name" className="text-muted-foreground text-sm">Nome</Label>
              <Input
                id="zone-name"
                placeholder="Ex: Minha Casa"
                value={zoneForm.name}
                onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })}
                className="bg-secondary/50 border-border rounded-xl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="zone-address" className="text-muted-foreground text-sm">Endereço</Label>
              <Input
                id="zone-address"
                placeholder="Rua, número, cidade"
                value={zoneForm.address}
                onChange={e => setZoneForm({ ...zoneForm, address: e.target.value })}
                className="bg-secondary/50 border-border rounded-xl"
                required
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
                        zoneForm.icon === key ? `${val.bg} border-2 border-current ${val.color}` : 'bg-secondary/50 border-2 border-transparent'
                      }`}
                    >
                      {Ic ? <Ic size={18} className={zoneForm.icon === key ? val.color : 'text-muted-foreground'} />
                           : <span className="text-lg">{val.icon}</span>}
                      <span className={`text-xs ${zoneForm.icon === key ? val.color : 'text-muted-foreground'}`}>{val.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="submit"
              disabled={createZone.isPending}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {createZone.isPending ? 'Salvando…' : 'Adicionar Zona'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}