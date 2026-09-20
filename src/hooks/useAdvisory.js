import { useCallback, useState } from 'react'
import { STORAGE_KEYS } from '../utils/constants.js'

function loadCached() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.advisories)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

/** Persisted advisory feed only — generation runs in Dashboard. */
export function useAdvisory() {
  const [items, setItemsState] = useState(loadCached)

  const setItems = useCallback((updater) => {
    setItemsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try {
        localStorage.setItem(STORAGE_KEYS.advisories, JSON.stringify(next))
      } catch {
        /* ignore quota errors */
      }
      return next
    })
  }, [])

  return { items, setItems }
}
