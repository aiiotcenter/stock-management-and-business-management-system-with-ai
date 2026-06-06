import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { useEffect, useRef } from 'react'
import { Bot, LogOut, MapPin, Wrench } from 'lucide-react'
import LanguageSwitcher from './components/LanguageSwitcher'
import { supabase } from './lib/supabase'
import CalisanIslerim from './pages/calisan/CalisanIslerim'
import AIAsistan from './pages/AIAsistan'

const NAV = [
  { to: '/', labelKey: 'myJobs', icon: Wrench },
  { to: '/ai', labelKey: 'aiAssistant', icon: Bot },
]

// Konum paylaşımı - 30 saniyede bir
function KonumPaylasici() {
  const { user } = useAuth()
  const intervalRef = useRef(null)

  async function konumGuncelle() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await supabase.from('calisan_konum').upsert({
        calisan_id: user.id,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        dogruluk: pos.coords.accuracy,
        guncelleme_tarihi: new Date().toISOString(),
      }, { onConflict: 'calisan_id' })
    }, (err) => console.warn('Konum alınamadı:', err), {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 25000,
    })
  }

  useEffect(() => {
    konumGuncelle()
    intervalRef.current = setInterval(konumGuncelle, 30000)
    return () => clearInterval(intervalRef.current)
  }, [])

  return null
}

export default function CalisanApp() {
  const { profile, cikisYap } = useAuth()
  const { t } = useLanguage()

  return (
    <BrowserRouter>
      <KonumPaylasici />
      <div className="app-layout">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-text">TechField</div>
            <div className="logo-sub">{t('employeePanel')}</div>
          </div>

          <nav className="nav-list">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <n.icon className="nav-icon" />
                <span>{t(n.labelKey)}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <LanguageSwitcher compact />
            <div className="location-pill">
              <MapPin size={13} />
              <span>{t('locationSharing')}</span>
            </div>
            <div className="sidebar-user">{profile?.ad || t('employees')}</div>
            <button className="btn btn-block btn-compact" onClick={cikisYap}>
              <LogOut size={14} /> {t('logout')}
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<CalisanIslerim />} />
            <Route path="/ai" element={<AIAsistan />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
