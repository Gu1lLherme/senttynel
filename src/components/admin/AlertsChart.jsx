import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// AlertsChart — paleta SENTINEL, sólido. Mantemos fill suave do recharts (não é gradiente decorativo).
export default function AlertsChart({ data }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#FFFFFF', border: '1px solid #C4D0E5' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base" style={{ color: '#0C1A38' }}>Alertas no mês</h3>
          <p className="text-xs" style={{ color: '#607090' }}>Volume diário de incidentes</p>
        </div>
      </div>
      <div className="h-48 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#C4D0E5" vertical={false} />
            <XAxis dataKey="day" stroke="#8A9FC0" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#8A9FC0" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #C4D0E5',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#0C1A38',
              }}
            />
            <Area
              type="monotone"
              dataKey="alerts"
              stroke="#1743B8"
              strokeWidth={2.5}
              fill="#1743B8"
              fillOpacity={0.12}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}