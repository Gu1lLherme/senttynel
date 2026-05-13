// Pill reutilizável para status positivo (verde) — padrão "Segura" / "Localizado".
// Reutilizado em StatusBadge, ZoneList inline badge e qualquer status positivo.
import { ShieldCheck, Check } from 'lucide-react';

export default function StatusPill({
  label,
  icon: Icon = ShieldCheck,
  size = 'md', // 'md' (pill grande) | 'sm' (inline)
}) {
  if (size === 'sm') {
    return (
      <span
        className="inline-flex items-center gap-1 font-semibold"
        style={{
          background: '#DDF0E6',
          color: '#155230',
          borderRadius: 6,
          padding: '2px 6px',
          fontSize: 10,
          lineHeight: 1.2,
        }}
      >
        <Check size={10} strokeWidth={3} />
        {label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-semibold"
      style={{
        background: '#DDF0E6',
        color: '#155230',
        borderRadius: 20,
        padding: '6px 12px',
      }}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}