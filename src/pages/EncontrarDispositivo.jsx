import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bell, MapPin, Lock, Loader2, Smartphone, Volume2, Battery } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EncontrarDispositivo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selected, setSelected] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['parental-links'],
    queryFn: () => base44.entities.ParentalLink.filter({ status: 'ativo' }),
  });

  const { data: lastPing } = useQuery({
    queryKey: ['last-ping', selected?.child_email],
    queryFn: async () => {
      if (!selected) return null;
      const pings = await base44.entities.LocationPing.filter(
        { user_email: selected.child_email }, '-created_date', 1
      );
      return pings[0] || null;
    },
    enabled: !!selected,
  });

  const triggerAction = async (action) => {
    if (!selected) return;
    setLoadingAction(action);
    try {
      const res = await base44.functions.invoke('findDevice', {
        target_email: selected.child_email,
        action,
        message: action === 'ring' ? 'Toque o alarme para localizar o dispositivo' : '',
      });
      const messages = {
        ring: 'Alarme acionado no dispositivo',
        locate: 'Localização solicitada',
        lock: 'Pedido de bloqueio enviado',
      };
      toast({ title: messages[action], description: 'O dispositivo foi notificado.' });
    } catch (err) {
      toast({ title: 'Erro', description: err.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4 max-w-md mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-4 hover:text-foreground"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Smartphone size={16} className="text-blue-600" />
          </div>
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-widest">Família</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Encontrar dispositivo</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Toque o alarme, localize ou bloqueie o celular de um familiar
        </p>
      </div>

      {/* Lista de dispositivos */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-5xl mb-3">📱</div>
          <p className="text-foreground font-semibold">Nenhum dispositivo vinculado</p>
          <p className="text-muted-foreground text-sm mt-1">Vincule um familiar em "Família"</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-5">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => setSelected(link)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all border-2 ${
                  selected?.id === link.id
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-white border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-black overflow-hidden">
                  {link.child_photo_url
                    ? <img src={link.child_photo_url} alt={link.child_name} className="w-full h-full object-cover" />
                    : link.child_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-foreground font-bold text-sm truncate">{link.child_name}</p>
                  <p className="text-muted-foreground text-xs truncate">{link.child_email}</p>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <>
              {/* Status atual */}
              <div className="glass-card rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-foreground font-bold text-sm">Última atividade</p>
                </div>
                {lastPing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-blue-600" />
                      <span className="text-foreground font-mono text-xs">
                        {lastPing.lat.toFixed(5)}, {lastPing.lng.toFixed(5)}
                      </span>
                    </div>
                    {lastPing.battery_level !== null && lastPing.battery_level !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <Battery size={14} className="text-blue-600" />
                        <span className="text-foreground">{lastPing.battery_level}%</span>
                      </div>
                    )}
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(lastPing.created_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">Sem dados de localização recentes.</p>
                )}
              </div>

              {/* Ações */}
              <div className="space-y-2">
                <ActionButton
                  icon={Volume2}
                  label="Tocar alarme"
                  desc="Faz o celular emitir som mesmo no silencioso"
                  color="blue"
                  loading={loadingAction === 'ring'}
                  onClick={() => triggerAction('ring')}
                />
                <ActionButton
                  icon={MapPin}
                  label="Pedir localização agora"
                  desc="Solicita posição GPS atualizada"
                  color="emerald"
                  loading={loadingAction === 'locate'}
                  onClick={() => triggerAction('locate')}
                />
                <ActionButton
                  icon={Lock}
                  label="Bloquear dispositivo"
                  desc="Em caso de perda ou roubo"
                  color="red"
                  loading={loadingAction === 'lock'}
                  onClick={() => triggerAction('lock')}
                />
              </div>

              <div className="mt-5 p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-blue-700 text-xs font-semibold mb-1">🔔 Como funciona</p>
                <p className="text-blue-600/70 text-xs">
                  Uma notificação push chegará no dispositivo do familiar com a ação solicitada.
                  Funciona mesmo com o celular bloqueado, desde que o app esteja instalado e com permissão de notificações.
                </p>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, label, desc, color, loading, onClick }) {
  const colors = {
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    red: 'bg-red-50 border-red-100 text-red-600',
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full p-4 rounded-2xl bg-white border border-gray-200 flex items-center gap-3 hover:bg-gray-50 active:scale-[0.98] transition-all disabled:opacity-60"
    >
      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${colors[color]}`}>
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
      </div>
      <div className="flex-1 text-left">
        <p className="text-foreground font-bold text-sm">{label}</p>
        <p className="text-muted-foreground text-xs">{desc}</p>
      </div>
    </button>
  );
}