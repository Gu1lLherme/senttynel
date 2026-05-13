import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Users, AlertTriangle, ShieldCheck, TrendingUp, Activity,
  Baby, Clock, Download, ArrowLeft, Lock, Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatCard from '@/components/admin/StatCard';
import AlertsChart from '@/components/admin/AlertsChart';
import AlertTypesChart from '@/components/admin/AlertTypesChart';
import Logo from '@/components/sentinel/Logo';

const TYPE_LABELS = {
  queda: 'Quedas',
  panico: 'Pânico',
  imobilidade: 'Imobilidade',
  rota_desviada: 'Rota desviada',
  manual: 'SOS Manual',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setMe(u); setAuthChecked(true); })
      .catch(() => setAuthChecked(true));
  }, []);

  const isAuthorized = !!(me && (me.role === 'admin' || me.role === 'owner'));

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
    enabled: isAuthorized,
  });
  const { data: alerts = [] } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 500),
    enabled: isAuthorized,
  });
  const { data: parentalLinks = [] } = useQuery({
    queryKey: ['admin-parental'],
    queryFn: () => base44.entities.ParentalLink.list('-created_date', 500),
    enabled: isAuthorized,
  });

  const handleDownloadReport = async () => {
    setDownloadingPdf(true);
    try {
      const now = new Date();
      const res = await base44.functions.invoke('generateMonthlyReport', {
        year: now.getFullYear(),
        month: now.getMonth(),
      }, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentinel-relatorio-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Relatório gerado com sucesso' });
    } catch (err) {
      toast({ title: 'Erro ao gerar relatório', description: err.message, variant: 'destructive' });
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="w-8 h-8 rounded-full animate-spin"
          style={{ border: '2px solid #C4D0E5', borderTopColor: '#1743B8' }}
        />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: '#FBEAEC', border: '1px solid #F1C5CA' }}
          >
            <Lock size={32} style={{ color: '#A81825' }} />
          </div>
          <h1 className="font-display text-3xl mb-2" style={{ color: '#0C1A38' }}>Acesso Restrito</h1>
          <p className="text-sm mb-6" style={{ color: '#607090' }}>
            Esta área é exclusiva para administradores e donos da empresa.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl font-bold text-sm transition-colors"
            style={{ background: '#1743B8', color: '#FFFFFF' }}
          >
            Voltar ao app
          </button>
        </div>
      </div>
    );
  }

  // ===== métricas =====
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthAlerts = alerts.filter(a => new Date(a.created_date) >= monthStart);
  const activeAlerts = alerts.filter(a => a.status === 'ativo');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolvido');
  const responseRate = alerts.length > 0
    ? Math.round((resolvedAlerts.length / alerts.length) * 100)
    : 0;
  const childrenCount = parentalLinks.filter(l => l.status === 'ativo').length;

  const days = eachDayOfInterval({ start: monthStart, end: now });
  const chartData = days.map(day => ({
    day: format(day, 'dd'),
    alerts: alerts.filter(a => {
      const d = new Date(a.created_date);
      return d.getDate() === day.getDate() && d.getMonth() === day.getMonth();
    }).length,
  }));

  const typeCounts = alerts.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(typeCounts).map(([k, v]) => ({
    name: TYPE_LABELS[k] || k,
    value: v,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header
        className="sticky top-0 z-10"
        style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #C4D0E5' }}
      >
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/configuracoes')}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: '#EBF0F8' }}
              aria-label="Voltar"
            >
              <ArrowLeft size={16} style={{ color: '#1743B8' }} />
            </button>
            <Logo size="sm" showText={false} />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#1743B8' }}>Admin</p>
              <h1 className="font-display text-lg leading-tight truncate" style={{ color: '#0C1A38' }}>Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className="hidden sm:inline-flex text-xs px-3 py-1.5 rounded-full font-semibold capitalize"
              style={{ background: '#EBF0F8', color: '#1743B8', border: '1px solid #C4D0E5' }}
            >
              {me.role}
            </span>
            <button
              onClick={handleDownloadReport}
              disabled={downloadingPdf}
              className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-60 hover:brightness-110 transition"
              style={{ background: '#1743B8', color: '#FFFFFF' }}
            >
              {downloadingPdf ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span className="hidden sm:inline">{downloadingPdf ? 'Gerando…' : 'Relatório PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-6 space-y-5">
        {/* Hero — agora sólido na cor primária */}
        <section
          className="rounded-2xl p-5 sm:p-6"
          style={{ background: '#1743B8', color: '#FFFFFF' }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: '#C8D6F4' }}>
                Visão geral · {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-white leading-tight">
                Olá, {me.full_name?.split(' ')[0] || 'Admin'}
              </h2>
              <p className="text-sm mt-2 font-medium" style={{ color: '#DDE6FA' }}>
                {monthAlerts.length} alertas registrados este mês · {users.length} usuários ativos
              </p>
            </div>
            <div
              className="text-center px-4 py-2.5 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <p className="font-display text-3xl text-white">{responseRate}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#DDE6FA' }}>Resolução</p>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Usuários totais" value={users.length} color="blue" />
          <StatCard icon={AlertTriangle} label="Alertas ativos" value={activeAlerts.length} color="red" />
          <StatCard icon={ShieldCheck} label="Resolvidos" value={resolvedAlerts.length} color="green" />
          <StatCard icon={Baby} label="Famílias vinculadas" value={childrenCount} color="amber" />
        </section>

        {/* Charts */}
        <section className="grid lg:grid-cols-2 gap-4">
          <AlertsChart data={chartData} />
          {pieData.length > 0 ? (
            <AlertTypesChart data={pieData} />
          ) : (
            <div
              className="rounded-2xl p-4 flex items-center justify-center text-sm"
              style={{ background: '#FFFFFF', border: '1px solid #C4D0E5', color: '#607090', minHeight: 200 }}
            >
              Sem dados de alertas ainda
            </div>
          )}
        </section>

        {/* Quick metrics */}
        <section className="grid sm:grid-cols-3 gap-3">
          <MetricRow icon={Activity} label="Tempo médio de resposta" value="2m 14s" sub="-18% vs mês anterior" />
          <MetricRow icon={TrendingUp} label="Engajamento diário"     value="87%"    sub="usuários ativos" />
          <MetricRow icon={Clock}      label="Uptime do sistema"      value="99.97%" sub="últimos 30 dias" />
        </section>

        {/* Recent activity */}
        <section
          className="rounded-2xl p-4"
          style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base" style={{ color: '#0C1A38' }}>Atividade recente</h3>
              <p className="text-xs" style={{ color: '#607090' }}>Últimos eventos do sistema</p>
            </div>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 8).map(alert => (
              <ActivityRow key={alert.id} alert={alert} />
            ))}
            {alerts.length === 0 && (
              <p className="text-center text-sm py-8" style={{ color: '#8A9FC0' }}>
                Nenhuma atividade registrada ainda
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricRow({ icon: Icon, label, value, sub }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#EBF0F8' }}
        >
          <Icon size={18} style={{ color: '#1743B8' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-xl" style={{ color: '#0C1A38' }}>{value}</p>
          <p className="text-xs" style={{ color: '#607090' }}>{label}</p>
          <p className="text-[10px]" style={{ color: '#8A9FC0' }}>{sub}</p>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ alert }) {
  const sev = alert.severity;
  const statusMap = {
    ativo:           { bg: '#FBEAEC', color: '#A81825', label: 'Ativo' },
    resolvido:       { bg: '#DDF0E6', color: '#155230', label: 'Resolvido' },
    falso_positivo:  { bg: '#EBF0F8', color: '#3A4E72', label: 'Falso alarme' },
  };
  const s = statusMap[alert.status] || statusMap.ativo;
  const iconBg =
    sev === 'critico' ? '#FBEAEC' :
    sev === 'alto'    ? '#FFF4E0' :
                        '#EBF0F8';
  const iconColor =
    sev === 'critico' ? '#A81825' :
    sev === 'alto'    ? '#8A5B00' :
                        '#1743B8';

  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-[#EBF0F8]/60"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <AlertTriangle size={15} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm capitalize truncate" style={{ color: '#0C1A38' }}>
          {TYPE_LABELS[alert.type] || alert.type} · {alert.severity}
        </p>
        <p className="text-xs truncate font-mono" style={{ color: '#8A9FC0' }}>
          {format(new Date(alert.created_date), "dd/MM HH:mm", { locale: ptBR })} · {alert.created_by}
        </p>
      </div>
      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
        style={{ background: s.bg, color: s.color }}
      >
        {s.label}
      </span>
    </div>
  );
}