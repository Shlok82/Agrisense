import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#1a4731', '#f59e0b', '#0f766e', '#7c3aed', '#ea580c', '#0369a1']

export function CostPieChart({ data }) {
  if (!data?.length) return <p className="text-sm text-black/60 dark:text-white/60">Add costs to see the chart.</p>
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie dataKey="value" data={data} innerRadius={60} outerRadius={90} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
