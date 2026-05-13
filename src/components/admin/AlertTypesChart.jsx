import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// Paleta SENTINEL — cores sólidas e distintas.
const COLORS = ['#1743B8', '#A81825', '#8A5B00', '#155230', '#3A4E72'];

export default function AlertTypesChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
    >
      <h3 className="font-bold text-base" style={{ color: '#0C1A38' }}>Tipos de Alerta</h3>
      <p className="text-xs mb-3" style={{ color: '#607090' }}>Distribuição por categoria</p>

      <div className="flex items-center gap-3">
        <div className="w-32 h-32 flex-shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={56}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #C4D0E5',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#0C1A38',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-xs flex-1 truncate" style={{ color: '#0C1A38' }}>{item.name}</span>
              <span className="text-xs font-bold" style={{ color: '#607090' }}>
                {total > 0 ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}