// StatCard SENTINEL — sólido, paleta Índigo Profundo.
const PALETTE = {
  blue:  { bg: '#EBF0F8', text: '#1743B8' },
  red:   { bg: '#FBEAEC', text: '#A81825' },
  green: { bg: '#DDF0E6', text: '#155230' },
  amber: { bg: '#FFF4E0', text: '#8A5B00' },
};

export default function StatCard({ icon: Icon, label, value, trend, color = 'blue' }) {
  const c = PALETTE[color] || PALETTE.blue;
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: c.bg }}
        >
          <Icon size={18} style={{ color: c.text }} />
        </div>
        {trend !== undefined && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: trendPositive ? '#DDF0E6' : '#FBEAEC',
              color: trendPositive ? '#155230' : '#A81825',
            }}
          >
            {trendPositive ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="font-display text-3xl" style={{ color: '#0C1A38' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: '#607090' }}>{label}</p>
    </div>
  );
}