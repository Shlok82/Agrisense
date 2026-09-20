import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export function WeatherChart({ daily }) {
  const data =
    daily?.time?.map((t, i) => ({
      day: t.slice(5),
      max: daily.temperature_2m_max?.[i] ?? 0,
      min: daily.temperature_2m_min?.[i] ?? 0,
    })) ?? []

  if (!data.length) return null

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="mx" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1a4731" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1a4731" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} unit="°C" />
          <Tooltip />
          <Area type="monotone" dataKey="max" stroke="#f59e0b" fill="url(#mx)" strokeWidth={2} name="Max" />
          <Area type="monotone" dataKey="min" stroke="#1a4731" fill="url(#mn)" strokeWidth={2} name="Min" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
