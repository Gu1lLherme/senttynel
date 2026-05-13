import { Check, Loader2 } from 'lucide-react';

// PlanCard SENTINEL — sólido, paleta Índigo Profundo, sem gradientes.
export default function PlanCard({ plan, onSelect, loading }) {
  const { id: planId, name, price, tagline, features, highlight } = plan;

  return (
    <div
      className="relative rounded-2xl p-5 flex flex-col"
      style={{
        background: '#FFFFFF',
        border: highlight ? '2px solid #1743B8' : '1px solid #C4D0E5',
      }}
    >
      {highlight && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
          style={{ background: '#1743B8', color: '#FFFFFF' }}
        >
          Mais escolhido
        </span>
      )}

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{ background: '#EBF0F8' }}
      >
        <span className="text-2xl">{planId === 'basico' ? '🛡️' : planId === 'premium' ? '⭐' : '👨‍👩‍👧'}</span>
      </div>

      <h3 className="font-display text-2xl" style={{ color: '#0C1A38' }}>{name}</h3>
      <p className="text-xs mt-0.5" style={{ color: '#607090' }}>{tagline}</p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-sm font-bold" style={{ color: '#607090' }}>R$</span>
        <span className="font-display text-4xl" style={{ color: '#0C1A38' }}>
          {price.toFixed(2).replace('.', ',')}
        </span>
        <span className="text-xs" style={{ color: '#607090' }}>/mês</span>
      </div>

      <ul className="mt-4 space-y-2 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#0C1A38' }}>
            <Check size={15} style={{ color: '#1743B8' }} className="flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(planId)}
        disabled={loading}
        className="mt-5 w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60"
        style={{ background: '#1743B8', color: '#FFFFFF' }}
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        Assinar {name}
      </button>
    </div>
  );
}