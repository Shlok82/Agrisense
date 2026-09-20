import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AppProviders } from './context/AppProviders.jsx'
import { ConsentModal } from './components/ConsentModal.jsx'
import { DemoBanner } from './components/DemoBanner.jsx'
import { AppShell } from './components/layout/AppShell.jsx'
import { Landing } from './pages/Landing.jsx'
import { Onboarding } from './pages/Onboarding.jsx'
import { Privacy } from './pages/Privacy.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { PestDetection } from './pages/PestDetection.jsx'
import { Weather } from './pages/Weather.jsx'
import { Irrigation } from './pages/Irrigation.jsx'
import { Cost } from './pages/Cost.jsx'
import { Reports } from './pages/Reports.jsx'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pest-detection" element={<PestDetection />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/irrigation" element={<Irrigation />} />
          <Route path="/cost" element={<Cost />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  useEffect(() => {
    const mobile = /Mobi|Android/i.test(navigator.userAgent)
    if (!mobile) return
    if (sessionStorage.getItem('agrisense_install_hint')) return
    toast('Add AgriSense to your home screen from your browser menu (Share / Add to Home Screen).', {
      duration: 6000,
    })
    sessionStorage.setItem('agrisense_install_hint', '1')
  }, [])

  return (
    <AppProviders>
      <ConsentModal />
      <DemoBanner />
      <AnimatedRoutes />
    </AppProviders>
  )
}
