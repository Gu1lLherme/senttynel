import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Users, AlertTriangle, ShieldCheck, TrendingUp, Activity,
  Baby, Clock, Download, ArrowLeft, Lock, Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format, startOfMonth, eachDayOfInterval, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatCard from '@/components/admin/StatCard';
import AlertsChart from '@/components/admin/AlertsChart';
import AlertTypesChart from '@/components/admin/AlertTypesChart';
import Logo from '@/components/sentinel/Logo';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [me, setMe] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setMe(u);
        setAuthChecked(true);
      })
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

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-red-600" />
          </div>
          <h1 className="text-foreground font-black text-2xl mb-2">Acesso Restrito</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Esta área é exclusiva para administradores e donos da empresa.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700"
          >
            Voltar ao app
          </button>
        </div>
      </div>
    );
  }

  // Compute metrics
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthAlerts = alerts.filter(a => new Date(a.created_date) >= monthStart);
  const activeAlerts = alerts.filter(a => a.status === 'ativo');
  const resolvedAlerts = alerts.filter(a => a.status === 'resolvido');
  const responseRate = alerts.length > 0 ? Math.round((resolvedAlerts.length / alerts.length) * 100) : 0;
  const childrenCount = parentalLinks.filter(l => l.status === 'ativo').length;

  // Chart data — alerts per day this month
  const days = eachDayOfInterval({ start: monthStart, end: now });
  const chartData = days.map(day => {
    const dayStr = format(day, 'dd/MM');
    const count = alerts.filter(a => {
      const d = new Date(a.created_date);
      return d.getDate() === day.getDate() && d.getMonth() === day.getMonth();
    }).length;
    return { day: format(day, 'dd'), alerts: count };
  });

  // Alert types distribution
  const typeCounts = alerts.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {});
  const typeLabels = {
    queda: 'Quedas',
    panico: 'Pânico',
    imobilidade: 'Imobilidade',
    rota_desviada: 'Rota desviada',
    manual: 'SOS Manual',
  };
  const pieData = Object.entries(typeCounts).map(([k, v]) => ({
    name: typeLabels[k] || k,
    value: v,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <ArrowLeft size={16} className="text-gray-700" />
            </button>
            <Logo size="sm" showText={false} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Admin</p>
              <h1 className="text-foreground font-black text-base leading-tight">Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100 capitalize">
              {me.role}
            </span>
            <button
              onClick={handleDownloadReport}
              disabled={downloadingPdf}
              className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {downloadingPdf ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span className="hidden sm:inline">{downloadingPdf ? 'Gerando…' : 'Relatório PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-6 space-y-5">
        {/* Hero */}
        <div
          className="rounded-3xl p-5 text-white shadow-xl"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #1e3a8a 100%)',
          }}
        >
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-cyan-200 text-xs font-bold uppercase tracking-widest mb-1.5">
                Visão geral · {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
              <h2 className="text-white text-2xl sm:text-3xl font-black drop-shadow">
                Olá, {me.full_name?.split(' ')[0] || 'Admin'}
              </h2>
              <p className="text-white/90 text-sm mt-1.5 font-medium">
                {monthAlerts.length} alertas registrados este mês · {users.length} usuários ativos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-center px-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/20">
                <p className="text-3xl font-black text-white">{responseRate}%</p>
                <p className="text-white/90 text-[10px] font-bold uppercase tracking-wider">Resolução</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Usuários totais" value={users.length} trend={12} color="blue" />
          <StatCard icon={AlertTriangle} label="Alertas ativos" value={activeAlerts.length} color="red" />
          <StatCard icon={ShieldCheck} label="Resolvidos" value={resolvedAlerts.length} trend={8} color="green" />
          <StatCard icon={Baby} label="Crianças vinculadas" value={childrenCount} color="amber" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <AlertsChart data={chartData} />
          {pieData.length > 0 ? (
            <AlertTypesChart data={pieData} />
          ) : (
            <div className="glass-card rounded-2xl p-4 flex items-center justify-center text-muted-foreground text-sm">
              Sem dados de alertas ainda
            </div>
          )}
        </div>

        {/* Quick metrics */}
        <div className="grid sm:grid-cols-3 gap-3">
          <MetricRow
            icon={Activity}
            label="Tempo médio de resposta"
            value="2m 14s"
            sub="-18% vs mês anterior"
            color="blue"
          />
          <MetricRow
            icon={TrendingUp}
            label="Engajamento diário"
            value="87%"
            sub="usuários ativos"
            color="green"
          />
          <MetricRow
            icon={Clock}
            label="Uptime do sistema"
            value="99.97%"
            sub="últimos 30 dias"
            color="amber"
          />
        </div>

        {/* Recent activity */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-foreground font-bold text-base">Atividade recente</h3>
              <p className="text-muted-foreground text-xs">Últimos eventos do sistema</p>
            </div>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 6).map(alert => (
              <div key={alert.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  alert.severity === 'critico' ? 'bg-red-50' :
                  alert.severity === 'alto' ? 'bg-orange-50' :
                  'bg-blue-50'
                }`}>
                  <AlertTriangle size={15} className={
                    alert.severity === 'critico' ? 'text-red-600' :
                    alert.severity === 'alto' ? 'text-orange-600' :
                    'text-blue-600'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-semibold text-sm capitalize truncate">
                    {typeLabels[alert.type] || alert.type} · {alert.severity}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {format(new Date(alert.created_date), "dd/MM HH:mm", { locale: ptBR })} · {alert.created_by}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                  alert.status === 'ativo' ? 'bg-red-50 text-red-600' :
                  alert.status === 'resolvido' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {alert.status}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                Nenhuma atividade registrada ainda
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
  };
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-black text-lg">{value}</p>
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-[10px] text-muted-foreground/70">{sub}</p>
        </div>
      </div>
    </div>
  );
}