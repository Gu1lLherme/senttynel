import { Check, Loader2 } from 'lucide-react';

export default function PlanCard({ plan, onSelect, loading }) {
  const { id: planId, name, price, tagline, features, highlight, color } = plan;
  const colors = {
    blue:   { bg: 'from-blue-500 to-blue-700',     ring: 'ring-blue-500',     text: 'text-blue-600',     bgSoft: 'bg-blue-50' },
    purple: { bg: 'from-purple-500 to-purple-700', ring: 'ring-purple-500',   text: 'text-purple-600',   bgSoft: 'bg-purple-50' },
    pink:   { bg: 'from-pink-500 to-rose-600',     ring: 'ring-pink-500',     text: 'text-pink-600',     bgSoft: 'bg-pink-50' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className={`relative rounded-3xl bg-white border border-gray-200 p-5 flex flex-col ${highlight ? `ring-2 ${c.ring} shadow-xl shadow-blue-500/10` : 'shadow-sm'}`}>
      {highlight && (
        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${c.bg}`}>
          Mais escolhido
        </span>
      )}

      <div className={`w-12 h-12 rounded-2xl ${c.bgSoft} flex items-center justify-center mb-3`}>
        <span className="text-2xl">{planId === 'basico' ? '🛡️' : planId === 'premium' ? '⭐' : '👨‍👩‍👧'}</span>
      </div>

      <h3 className="text-foreground font-black text-xl">{name}</h3>
      <p className="text-muted-foreground text-xs mt-0.5">{tagline}</p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-muted-foreground text-sm font-bold">R$</span>
        <span className="text-foreground text-4xl font-black">{price.toFixed(2).replace('.', ',')}</span>
        <span className="text-muted-foreground text-xs">/mês</span>
      </div>

      <ul className="mt-4 space-y-2 flex-1">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
            <Check size={15} className={`${c.text} flex-shrink-0 mt-0.5`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(planId)}
        disabled={loading}
        className={`mt-5 w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r ${c.bg} hover:opacity-95 active:scale-[0.98] transition disabled:opacity-60`}
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        Assinar {name}
      </button>
    </div>
  );
}