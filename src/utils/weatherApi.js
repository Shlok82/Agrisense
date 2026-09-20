import { DEMO_COORDS } from './constants.js'

function pickCoords(profile) {
  const lat = profile?.lat ?? DEMO_COORDS.lat
  const lon = profile?.lon ?? DEMO_COORDS.lon
  return { lat, lon }
}

export async function fetchCurrentWeather(profile) {
  const { lat, lon } = pickCoords(profile)
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('current', [
    'temperature_2m',
    'relative_humidity_2m',
    'precipitation',
    'weather_code',
    'wind_speed_10m',
    'uv_index',
  ].join(','))
  url.searchParams.set('timezone', 'Asia/Kolkata')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Weather request failed')
  const data = await res.json()
  return data
}

export async function fetchDailyForecast(profile, days = 7) {
  const { lat, lon } = pickCoords(profile)
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('daily', [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'uv_index_max',
    'relative_humidity_2m_mean',
  ].join(','))
  url.searchParams.set('forecast_days', String(days))
  url.searchParams.set('timezone', 'Asia/Kolkata')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error('Forecast request failed')
  return res.json()
}

export function weatherCodeLabel(code) {
  const map = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Violent showers',
    95: 'Thunderstorm',
  }
  return map[code] ?? 'Weather'
}

export function summarizeForecastForAi(daily) {
  if (!daily?.time?.length) return ''
  const lines = daily.time.slice(0, 7).map((date, i) => {
    const tmax = daily.temperature_2m_max?.[i]
    const tmin = daily.temperature_2m_min?.[i]
    const rain = daily.precipitation_sum?.[i]
    const code = daily.weather_code?.[i]
    return `${date}: ${weatherCodeLabel(code)}, max ${tmax}°C, min ${tmin}°C, rain ${rain ?? 0} mm`
  })
  return lines.join('\n')
}
