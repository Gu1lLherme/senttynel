import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const statusConfig = {
  segura: {
    label: 'Segura',
    icon: ShieldCheck,
    className: 'bg-blue-50 text-blue-600 border border-blue-200',
    dotColor: 'bg-blue-500',
  },
  atencao: {
    label: 'Atenção',
    icon: Shield,
    className: 'bg-amber-50 text-amber-600 border border-amber-200',
    dotColor: 'bg-amber-500',
  },
  perigo: {
    label: 'Perigo',
    icon: ShieldAlert,
    className: 'bg-red-50 text-red-600 border border-red-200',
    dotColor: 'bg-red-500',
  }
};

export default function StatusBadge({ status = 'segura' }) {
  const config = statusConfig[status] || statusConfig.segura;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.className}`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
      <Icon size={13} />
      {config.label}
    </div>
  );
}