export default function StatCard({ icon: Icon, label, value, trend, color = 'blue' }) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  };
  const c = colors[color] || colors.blue;

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center`}>
          <Icon size={18} className={c.text} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-foreground text-2xl font-black">{value}</p>
      <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
    </div>
  );
}