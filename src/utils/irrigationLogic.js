const MS_DAY = 86400000

export function daysBetween(a, b) {
  const da = new Date(a)
  const db = new Date(b)
  return Math.round((db - da) / MS_DAY)
}

export function estimateNextIrrigation({ moisturePct, lastIrrigationDate, crop, stage, irrigation }) {
  const today = new Date()
  const last = lastIrrigationDate ? new Date(lastIrrigationDate) : new Date(today.getTime() - 4 * MS_DAY)
  const daysSince = Math.max(0, daysBetween(last, today))

  const cropFactor =
    {
      Sugarcane: 1.25,
      Rice: 1.2,
      Cotton: 1.05,
      Tomato: 1.0,
      Onion: 0.95,
      Maize: 1.0,
      Soybean: 0.95,
      Wheat: 0.9,
    }[crop] ?? 1

  const stageStress =
    { Sowing: 0.85, Vegetative: 1.0, Flowering: 1.15, Harvest: 0.8 }[stage] ?? 1

  const systemFactor = irrigation === 'Drip' ? 0.85 : irrigation === 'Flood' ? 1.05 : 1.15

  const dailyDrop = 4.5 * cropFactor * stageStress * systemFactor
  const projected = Math.max(0, (moisturePct ?? 55) - dailyDrop * daysSince)
  const threshold = irrigation === 'Rainfed' ? 32 : 38
  const daysToNext = Math.max(0, Math.ceil((projected - threshold) / dailyDrop))

  const nextDate = new Date(today.getTime() + daysToNext * MS_DAY)

  const litresPerAcre = Math.round(4200 * cropFactor * stageStress * (irrigation === 'Drip' ? 0.75 : 1))

  return {
    daysToNext,
    nextDate: nextDate.toISOString().slice(0, 10),
    projectedMoisture: Math.round(projected),
    litresPerAcre,
    bestWindow: irrigation === 'Drip' ? '5:00–8:00 IST (cool, low wind)' : 'Early morning before heat build-up',
  }
}

export function simulateMoistureSeries({ startMoisture, days = 10 }) {
  const out = []
  let m = startMoisture
  for (let i = 0; i < days; i += 1) {
    const day = `D+${i}`
    m = Math.max(18, m - 4 + (i % 4 === 3 ? 22 : 0))
    out.push({ day, moisture: Math.round(m) })
  }
  return out
}
