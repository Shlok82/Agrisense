export function sumCosts(inputs) {
  const keys = [
    'seed',
    'fertilizer',
    'pesticide',
    'labour',
    'irrigation',
    'misc',
  ]
  return keys.reduce((acc, k) => acc + (Number(inputs[k]) || 0), 0)
}

export function computeFarmEconomics({ landAcres, costs, yieldQuintals, pricePerQuintal }) {
  const acres = Math.max(0, Number(landAcres) || 0)
  const totalInvestment = sumCosts(costs)
  const y = Math.max(0, Number(yieldQuintals) || 0)
  const p = Math.max(0, Number(pricePerQuintal) || 0)
  const expectedRevenue = y * p
  const profit = expectedRevenue - totalInvestment
  const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0

  return {
    acres,
    totalInvestment,
    expectedRevenue,
    profit,
    roi,
  }
}

export function pieDataFromCosts(costs, labels) {
  const keys = ['seed', 'fertilizer', 'pesticide', 'labour', 'irrigation', 'misc']
  return keys
    .map((k) => ({
      name: labels[k] || k,
      value: Math.max(0, Number(costs[k]) || 0),
    }))
    .filter((d) => d.value > 0)
}
