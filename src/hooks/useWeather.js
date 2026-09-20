import { useEffect, useState } from 'react'
import { fetchCurrentWeather, fetchDailyForecast } from '../utils/weatherApi.js'

export function useWeather(profile) {
  const [current, setCurrent] = useState(null)
  const [daily, setDaily] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const profileKey = JSON.stringify({
    lat: profile?.lat,
    lon: profile?.lon,
    district: profile?.district,
    refresh: profile?._refresh,
  })

  useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const [c, d] = await Promise.all([fetchCurrentWeather(profile), fetchDailyForecast(profile)])
        if (!cancelled) {
          setCurrent(c)
          setDaily(d)
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Weather error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [profileKey]) // eslint-disable-line react-hooks/exhaustive-deps -- profileKey encodes fetch inputs.

  return { current, daily, loading, error }
}
