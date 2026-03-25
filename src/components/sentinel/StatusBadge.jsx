import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const statusConfig = {
  segura: {
    label: 'Segura',
    icon: ShieldCheck,
    className: 'bg-green-500/20 text-green-400 border border-green-500/40',
    dotColor: 'bg-green-400',
    glow: 'shadow-[0_0_12px_rgba(0,200,150,0.4)]'
  },
  atencao: {
    label: 'Atenção',
    icon: Shield,
    className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
    dotColor: 'bg-yellow-400',
    glow: 'shadow-[0_0_12px_rgba(255,149,0,0.4)]'
  },
  perigo: {
    label: 'Perigo',
    icon: ShieldAlert,
    className: 'bg-red-500/20 text-red-400 border border-red-500/40',
    dotColor: 'bg-red-400',
    glow: 'shadow-[0_0_12px_rgba(255,45,85,0.5)]'
  }
};

export default function StatusBadge({ status = 'segura' }) {
  const config = statusConfig[status] || statusConfig.segura;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.className} ${config.glow}`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
      <Icon size={13} />
      {config.label}
    </div>
  );
}