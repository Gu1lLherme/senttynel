export default function SensorCard({ icon, label, value, color = 'blue', active = true }) {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      text: 'text-blue-600',
      dot: 'bg-blue-500',
    },
    green: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      dot: 'bg-emerald-500',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-600',
      dot: 'bg-red-500',
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`relative rounded-2xl p-4 border ${c.bg} ${c.border} slide-up`}>
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