// StatusBadge — usa StatusPill para status positivo (paleta SENTINEL).
// Mantém compat de API com os 3 estados existentes.
import { Shield, ShieldAlert } from 'lucide-react';
import StatusPill from './StatusPill';

export default function StatusBadge({ status = 'segura' }) {
  if (status === 'segura') {
    return <StatusPill label="Segura" />;
  }

  const config = status === 'perigo'
    ? {
        label: 'Perigo',
        Icon: ShieldAlert,
        bg: '#FBEAEC',
        color: '#A81825',
      }
    : {
        label: 'Atenção',
        Icon: Shield,
        bg: '#FFF4E0',
        color: '#8A5B00',
      };

  const { Icon } = config;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-semibold"
      style={{
        background: config.bg,
        color: config.color,
        borderRadius: 20,
        padding: '6px 12px',
      }}
    >
      <Icon size={13} />
      {config.label}
    </span>
  );
}