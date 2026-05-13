import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Smartphone, ChevronRight, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

export default function CadastrarDispositivos() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['parental-links'],
    queryFn: () => base44.entities.ParentalLink.list('-created_date'),
  });

  const updateLink = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ParentalLink.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parental-links'] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.ParentalLink.update(id, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['parental-links'] });
      toast({ title: vars.status === 'ativo' ? 'Dispositivo ativado' : 'Dispositivo pausado' });
    },
  });

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-24 max-w-md mx-auto">
      <button
        onClick={() => navigate('/familia')}
        className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium mb-4 hover:text-foreground"
      >
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
            <Smartphone size={16} className="text-red-600" />
          </div>
          <p className="text-red-600 text-sm font-semibold uppercase tracking-widest">Família · Dispositivos</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Dispositivos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie celulares vinculados, status e permissões
        </p>
      </div>

      {/* Encontrar dispositivo CTA */}
      <button
        onClick={() => navigate('/encontrar-dispositivo')}
        className="w-full mb-5 p-4 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition"
        style={{ background: '#1743B8', color: '#FFFFFF' }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)' }}
        >
          <Search size={20} className="text-white" />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-bold text-sm">Encontrar dispositivo</p>
          <p className="text-xs" style={{ color: '#DDE6FA' }}>Tocar alarme, localizar ou bloquear</p>
        </div>
        <ChevronRight size={18} style={{ color: '#DDE6FA' }} className="flex-shrink-0" />
      </button>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📱</div>
          <p className="text-foreground font-semibold">Nenhum dispositivo cadastrado</p>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Cadastre pessoas primeiro em "Cadastrar família"
          </p>
          <button
            onClick={() => navigate('/familia/cadastrar')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"
          >
            Cadastrar família
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map(link => (
            <div key={link.id} className="glass-card rounded-2xl p-4 slide-up">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl overflow-hidden flex-shrink-0"
                  style={{ background: '#1743B8', color: '#FFFFFF' }}
                >
                  {link.child_photo_url
                    ? <img src={link.child_photo_url} alt={link.child_name} className="w-full h-full object-cover" />
                    : link.child_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-bold text-sm truncate">{link.child_name}</p>
                  <p className="text-muted-foreground text-[11px] truncate">{link.child_email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {link.status === 'ativo' ? (
                      <CheckCircle2 size={11} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={11} className="text-amber-600" />
                    )}
                    <span className={`text-[10px] font-semibold ${
                      link.status === 'ativo' ? 'text-emerald-600' :
                      link.status === 'pendente' ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {link.status === 'ativo' ? 'Conectado' :
                       link.status === 'pendente' ? 'Aguardando ativação' : 'Pausado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggle status */}
              {link.status !== 'pendente' && (
                <div className="flex items-center justify-between mb-3 p-2.5 rounded-xl bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-semibold text-xs">Monitoramento ativo</p>
                    <p className="text-muted-foreground text-[10px]">Pause para parar de receber dados</p>
                  </div>
                  <Switch
                    checked={link.status === 'ativo'}
                    onCheckedChange={(v) => updateStatus.mutate({
                      id: link.id, status: v ? 'ativo' : 'pausado',
                    })}
                  />
                </div>
              )}

              {/* Permissões */}
              <div className="space-y-1.5 pt-3 border-t border-gray-100">
                <PermRow
                  label="📍 Localização em tempo real"
                  checked={link.share_location}
                  onChange={(v) => updateLink.mutate({ id: link.id, data: { share_location: v } })}
                />
                <PermRow
                  label="🔋 Nível de bateria"
                  checked={link.share_battery}
                  onChange={(v) => updateLink.mutate({ id: link.id, data: { share_battery: v } })}
                />
                <PermRow
                  label="🚨 Alertas (queda, pânico)"
                  checked={link.share_alerts}
                  onChange={(v) => updateLink.mutate({ id: link.id, data: { share_alerts: v } })}
                />
                <PermRow
                  label="📧 Notificações por email"
                  checked={link.email_notifications}
                  onChange={(v) => updateLink.mutate({ id: link.id, data: { email_notifications: v } })}
                />
                <PermRow
                  label="🔔 Notificações push"
                  checked={link.push_notifications}
                  onChange={(v) => updateLink.mutate({ id: link.id, data: { push_notifications: v } })}
                />
              </div>

              <button
                onClick={() => navigate(`/familia/${link.id}`)}
                className="w-full mt-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100 transition flex items-center justify-center gap-1"
              >
                Ver perfil completo <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 p-3 rounded-2xl bg-blue-50 border border-blue-100">
        <p className="text-blue-700 text-xs font-semibold mb-1">🔐 Permissões</p>
        <p className="text-blue-600/70 text-xs">
          Você só recebe dados que a pessoa autorizou compartilhar. Mudanças refletem em tempo real.
        </p>
      </div>
    </div>
  );
}

function PermRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}