import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Home, Briefcase, GraduationCap, MapPin, AlertTriangle, Loader2, Search } from 'lucide-react';

const ICONS = {
  home: { Icon: Home, label: 'Casa' },
  work: { Icon: Briefcase, label: 'Trabalho' },
  school: { Icon: GraduationCap, label: 'Escola' },
  other: { Icon: MapPin, label: 'Outro' },
};

const DANGER_ICONS = {
  danger: { Icon: AlertTriangle, label: 'Perigo' },
  other: { Icon: MapPin, label: 'Outro' },
};

export default function ZoneDialog({ open, onOpenChange, zoneType = 'safe' }) {
  const isDanger = zoneType === 'danger';
  const iconOptions = isDanger ? DANGER_ICONS : ICONS;
  const defaultIcon = isDanger ? 'danger' : 'home';

  const initialForm = {
    name: '',
    cep: '',
    address: '',
    icon: defaultIcon,
    radius_meters: isDanger ? 300 : 200,
    notify_on_enter: true,
    notify_on_exit: !isDanger,
  };

  const [form, setForm] = useState(initialForm);
  const [cepLoading, setCepLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resetForm = () => setForm(initialForm);

  const handleCepLookup = async () => {
    const cleanCep = form.cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast({ title: 'CEP inválido', description: 'Digite os 8 dígitos do CEP.' });
      return;
    }
    setCepLoading(true);
    try {
      const res = await base44.functions.invoke('lookupCEP', { cep: cleanCep });
      if (res.data?.found) {
        setForm(f => ({
          ...f,
          address: res.data.address,
          cep: cleanCep,
        }));
        toast({ title: 'Endereço encontrado', description: res.data.address });
      } else {
        toast({ title: 'CEP não encontrado', description: res.data?.error || 'Verifique o número e tente novamente.' });
      }
    } catch (e) {
      toast({ title: 'Erro ao buscar CEP', description: e.message });
    } finally {
      setCepLoading(false);
    }
  };

  const createZone = useMutation({
    mutationFn: async (data) => {
      setGeocoding(true);
      let coords = { lat: null, lng: null };
      try {
        const res = await base44.functions.invoke('geocodeAddress', { address: data.address });
        if (res.data?.found) coords = { lat: res.data.lat, lng: res.data.lng };
      } catch (e) {
        console.warn('Geocoding failed:', e);
      } finally {
        setGeocoding(false);
      }
      return base44.entities.SafeZone.create({
        ...data,
        zone_type: zoneType,
        ...coords,
        is_active: true,
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['safezones'] });
      onOpenChange(false);
      resetForm();
      toast({
        title: isDanger ? 'Zona de perigo adicionada' : 'Zona segura adicionada',
        description: result.lat ? 'Cerca ativa no mapa.' : 'Endereço sem coordenadas precisas.',
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.address) return;
    createZone.mutate(form);
  };

  const accent = isDanger ? 'red' : 'blue';
  const accentClasses = isDanger
    ? { btn: 'bg-red-600 hover:bg-red-700', ring: 'border-red-400 bg-red-50 text-red-600' }
    : { btn: 'bg-blue-600 hover:bg-blue-700', ring: 'border-blue-400 bg-blue-50 text-blue-600' };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="bg-white border-gray-200 max-w-sm mx-auto rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl font-black">
            {isDanger ? 'Nova Zona de Perigo' : 'Nova Zona Segura'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Field label="Nome">
            <Input
              placeholder={isDanger ? 'Ex: Área de risco' : 'Ex: Escola da Maria'}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl"
              required
            />
          </Field>

          <Field label="CEP" hint="Buscar endereço automaticamente">
            <div className="flex gap-2">
              <Input
                placeholder="00000-000"
                value={form.cep}
                onChange={e => setForm({ ...form, cep: e.target.value.replace(/\D/g, '').slice(0, 8) })}
                onBlur={() => form.cep.length === 8 && handleCepLookup()}
                inputMode="numeric"
                maxLength={9}
                className="bg-gray-50 border-gray-200 rounded-xl flex-1"
              />
              <button
                type="button"
                onClick={handleCepLookup}
                disabled={cepLoading || form.cep.length < 8}
                className={`px-3 rounded-xl ${accentClasses.btn} text-white disabled:opacity-50 flex items-center justify-center min-w-[44px]`}
                aria-label="Buscar CEP"
              >
                {cepLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              </button>
            </div>
          </Field>

          <Field label="Endereço" hint="Preenchido pelo CEP ou manualmente">
            <Input
              placeholder="Rua, número, cidade, estado"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="bg-gray-50 border-gray-200 rounded-xl"
              required
            />
          </Field>

          <Field label="Raio (metros)">
            <Input
              type="number"
              min="50"
              max="5000"
              value={form.radius_meters}
              onChange={e => setForm({ ...form, radius_meters: parseInt(e.target.value) || 200 })}
              className="bg-gray-50 border-gray-200 rounded-xl"
            />
          </Field>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Tipo</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(iconOptions).map(([key, { Icon, label }]) => {
                const selected = form.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm({ ...form, icon: key })}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1 border-2 transition-all ${
                      selected ? accentClasses.ring : 'bg-gray-50 border-transparent text-gray-400'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-xs">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <Toggle
              label={isDanger ? 'Alertar ao entrar' : 'Notificar ao chegar'}
              value={form.notify_on_enter}
              onChange={(v) => setForm({ ...form, notify_on_enter: v })}
            />
            <Toggle
              label={isDanger ? 'Alertar ao sair' : 'Notificar ao sair'}
              value={form.notify_on_exit}
              onChange={(v) => setForm({ ...form, notify_on_exit: v })}
            />
          </div>

          <button
            type="submit"
            disabled={createZone.isPending || geocoding}
            className={`w-full py-3 rounded-2xl ${accentClasses.btn} text-white font-bold text-base disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {(createZone.isPending || geocoding) && <Loader2 size={16} className="animate-spin" />}
            {geocoding ? 'Localizando endereço…' : createZone.isPending ? 'Salvando…' : 'Adicionar'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-muted-foreground text-sm">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm text-foreground">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}