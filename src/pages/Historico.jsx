import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, MapPin, Clock, CheckCircle, AlertTriangle, Zap, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';

const typeConfig = {
  queda: { label: 'Queda Detectada', icon: '💥', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  panico: { label: 'Botão de Pânico', icon: '🆘', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  imobilidade: { label: 'Imobilidade', icon: '⏱️', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  rota_desviada: { label: 'Rota Desviada', icon: '🗺️', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  manual: { label: 'Pânico Manual', icon: '🆘', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

const severityBadge = {
  baixo: 'bg-green-500/20 text-green-400',
  medio: 'bg-yellow-500/20 text-yellow-400',
  alto: 'bg-orange-500/20 text-orange-400',
  critico: 'bg-red-500/20 text-red-400',
};

const statusBadge = {
  ativo: 'bg-red-500/20 text-red-400',
  resolvido: 'bg-green-500/20 text-green-400',
  falso_positivo: 'bg-gray-500/20 text-gray-400',
};

const statusLabel = {
  ativo: 'Ativo',
  resolvido: 'Resolvido',
  falso_positivo: 'Falso Alarme',
};

export default function Historico() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts-all'],
    queryFn: () => base44.entities.Alert.list('-created_date', 30),
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => base44.entities.Alert.update(id, { status: 'resolvido', user_responded: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts-all'] });
      queryClient.invalidateQueries({ queryKey: ['alerts-active'] });
      toast({ title: 'Alerta marcado como resolvido' });
    }
  });

  const activeCount = alerts.filter(a => a.status === 'ativo').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolvido').length;

  return (
    <div className="min-h-screen bg-background px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Clock size={16} className="text-orange-400" />
          </div>
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Registro</p>
        </div>
        <h1 className="text-foreground text-3xl font-black">Histórico</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-foreground">{alerts.length}</p>
          <p className="text-muted-foreground text-xs mt-0.5">Total</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-red-400">{activeCount}</p>
          <p className="text-muted-foreground text-xs mt-0.5">Ativos</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-2xl font-black text-green-400">{resolvedCount}</p>
          <p className="text-muted-foreground text-xs mt-0.5">Resolvidos</p>
        </div>
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-secondary/40 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🛡️</div>
          <p className="text-foreground font-bold text-lg">Nenhum alerta registrado</p>
          <p className="text-muted-foreground text-sm mt-1">Você está seguro(a)!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const tc = typeConfig[alert.type] || typeConfig.manual;
            return (
              <div key={alert.id} className={`glass-card rounded-2xl p-4 border slide-up`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 ${tc.bg} border`}>
                    {tc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-sm ${tc.color}`}>{tc.label}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${severityBadge[alert.severity] || 'bg-gray-500/20 text-gray-400'}`}>
                        {alert.severity}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[alert.status] || ''}`}>
                        {statusLabel[alert.status] || alert.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <Clock size={11} />
                        {format(new Date(alert.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </div>
                      {alert.location_address && (
                        <div className="flex items-center gap-1 text-muted-foreground text-xs truncate">
                          <MapPin size={11} />
                          <span className="truncate">{alert.location_address}</span>
                        </div>
                      )}
                    </div>

                    {alert.risk_score && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all"
                            style={{ width: `${alert.risk_score}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs flex-shrink-0">
                          Risco {alert.risk_score}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Resolve button */}
                  {alert.status === 'ativo' && (
                    <button
                      onClick={() => resolveMutation.mutate(alert.id)}
                      aria-label="Marcar como resolvido"
                      className="w-8 h-8 rounded-xl bg-green-500/10 hover:bg-green-500/20 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                    >
                      <CheckCircle size={15} className="text-green-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}