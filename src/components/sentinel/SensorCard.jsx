export default function SensorCard({ icon, label, value, color = 'cyan', active = true }) {
  const colorMap = {
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      text: 'text-cyan-400',
      dot: 'bg-cyan-400',
      glow: 'shadow-[0_0_20px_rgba(0,245,255,0.15)]'
    },
    green: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      text: 'text-green-400',
      dot: 'bg-green-400',
      glow: 'shadow-[0_0_20px_rgba(0,255,135,0.15)]'
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      text: 'text-purple-400',
      dot: 'bg-purple-400',
      glow: 'shadow-[0_0_20px_rgba(191,95,255,0.15)]'
    },
    orange: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      text: 'text-orange-400',
      dot: 'bg-orange-400',
      glow: 'shadow-[0_0_20px_rgba(255,149,0,0.15)]'
    }
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <div className={`relative rounded-2xl p-4 border ${c.bg} ${c.border} ${c.glow} slide-up`}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${c.bg}`}>
          {icon}
        </div>
        <div>
          <p className="text-foreground font-semibold text-sm">{label}</p>
          <p className={`text-xs font-medium mt-0.5 ${c.text}`}>{value}</p>
        </div>
        {active && (
          <span className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
        )}
      </div>
    </div>
  );
}