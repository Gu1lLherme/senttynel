import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Lock, Loader2, Smartphone, Volume2, Battery, Clock, X, CheckCircle2, History, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const ACTION_META = {
  ring: { icon: Volume2, label: 'Tocar alarme', color: 'blue' },
  locate: { icon: MapPin, label: 'Localizar', color: 'emerald' },
  lock: { icon: Lock, label: 'Bloquear', color: 'red' },
};

export default function EncontrarDispositivo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['parental-links-active'],
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

  // Histórico de pedidos para o alvo selecionado (CRUD: READ)
  const { data: requests = [] } = useQuery({
    queryKey: ['find-requests', selected?.child_email],
    queryFn: () => base44.entities.FindDeviceRequest.filter(
      { target_email: selected.child_email }, '-created_date', 20
    ),
    enabled: !!selected,
    refetchInterval: 5000,
  });

  // CRUD: CREATE (via função backend) + invalidação
  const createRequest = useMutation({
    mutationFn: async (action) => {
      const res = await base44.functions.invoke('findDevice', {
        target_email: selected.child_email,
        action,
        message: action === 'ring' ? 'Toque o alarme para localizar o dispositivo' : '',
      });
      return res.data;
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ['find-requests', selected.child_email] });
      const messages = { ring: 'Alarme acionado', locate: 'Localização solicitada', lock: 'Bloqueio enviado' };
      toast({ title: messages[action], description: 'O dispositivo foi notificado.' });
    },
    onError: (err) => {
      toast({ title: 'Erro', description: err.response?.data?.error || err.message, variant: 'destructive' });
    },
    onSettled: () => setLoadingAction(null),
  });

  // CRUD: UPDATE (cancelar pedido pendente)
  const cancelRequest = useMutation({
    mutationFn: (id) => base44.entities.FindDeviceRequest.update(id, { status: 'ignorada' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['find-requests', selected.child_email] });
      toast({ title: 'Pedido cancelado' });
    },
  });

  // CRUD: DELETE (remover do histórico)
  const deleteRequest = useMutation({
    mutationFn: (id) => base44.entities.FindDeviceRequest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['find-requests', selected.child_email] });
      toast({ title: 'Removido do histórico' });
    },
  });

  const triggerAction = (action) => {
    if (!selected) return;
    setLoadingAction(action);
    createRequest.mutate(action);
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

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-5xl mb-3">📱</div>
          <p className="text-foreground font-semibold">Nenhum dispositivo vinculado</p>
          <p className="text-muted-foreground text-sm mt-1">Vincule um familiar em "Família"</p>
          <button
            onClick={() => navigate('/familia')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
          >
            Ir para Família
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-5">
            {links.map(link => (
              <button
                key={link.id}
                onClick={() => setSelected(link)}
                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition border-2 ${
                  selected?.id === link.id
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-white border-gray-200 hover:border-blue-200'
                }`}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-black overflow-hidden"
                  style={{ background: '#1743B8', color: '#FFFFFF' }}
                >
                  {link.child_photo_url
                    ? <img src={link.child_photo_url} alt={link.child_name} className="w-full h-full object-cover" />
                    : link.child_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-foreground font-bold text-sm truncate">{link.child_name}</p>
                  <p className="text-muted-foreground text-xs truncate">
                    {link.relationship_label || link.child_email}
                  </p>
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
              <div className="space-y-2 mb-5">
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

              {/* Histórico de pedidos (CRUD completo) */}
              {requests.length > 0 && (
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <History size={14} className="text-blue-600" />
                    <h3 className="text-foreground font-bold text-sm">Histórico de pedidos</h3>
                  </div>
                  <div className="space-y-2">
                    {requests.map(r => (
                      <RequestRow
                        key={r.id}
                        request={r}
                        onCancel={() => cancelRequest.mutate(r.id)}
                        onDelete={() => deleteRequest.mutate(r.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-blue-700 text-xs font-semibold mb-1">🔔 Como funciona</p>
                <p className="text-blue-600/70 text-xs">
                  Uma notificação push chegará no dispositivo do familiar com a ação solicitada.
                  Pedidos pendentes podem ser cancelados antes de serem executados.
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
      className="w-full p-4 rounded-2xl bg-white border border-gray-200 flex items-center gap-3 hover:bg-gray-50 active:scale-[0.98] transition disabled:opacity-60"
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

function RequestRow({ request, onCancel, onDelete }) {
  const meta = ACTION_META[request.action] || { icon: Smartphone, label: request.action, color: 'blue' };
  const Icon = meta.icon;
  const statusConfig = {
    pendente: { label: 'Pendente', color: 'text-amber-600 bg-amber-50', icon: Clock },
    executada: { label: 'Executada', color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2 },
    ignorada: { label: 'Cancelada', color: 'text-gray-500 bg-gray-100', icon: X },
  };
  const sc = statusConfig[request.status] || statusConfig.pendente;
  const StatusIcon = sc.icon;

  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
        <Icon size={13} className="text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-semibold text-xs">{meta.label}</p>
        <p className="text-muted-foreground text-[10px]">
          {format(new Date(request.created_date), "dd/MM HH:mm", { locale: ptBR })}
        </p>
      </div>
      <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${sc.color}`}>
        <StatusIcon size={9} />
        {sc.label}
      </div>
      {request.status === 'pendente' && (
        <button
          onClick={onCancel}
          className="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 flex items-center justify-center"
          aria-label="Cancelar"
        >
          <X size={12} className="text-amber-600" />
        </button>
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center">
            <Trash2 size={12} className="text-red-500" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white max-w-sm mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover do histórico?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-red-600 text-white hover:bg-red-700">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}