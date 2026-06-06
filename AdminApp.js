import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { Bot, Boxes, LayoutDashboard, LogOut, MapPinned, Users, UserRoundCog, Wrench } from 'lucide-react'
import LanguageSwitcher from './components/LanguageSwitcher'
import Dashboard from './pages/Dashboard'
import IsEmirleri from './pages/IsEmirleri'
import Musteriler from './pages/Musteriler'
import Stok from './pages/Stok'
import AIAsistan from './pages/AIAsistan'
import CalisanYonetim from './pages/admin/CalisanYonetim'
import CalisanHarita from './pages/admin/CalisanHarita'

const NAV = [
  { to: '/', labelKey: 'dashboard', icon: LayoutDashboard },
  { to: '/is-emirleri', labelKey: 'workOrders', icon: Wrench },
  { to: '/musteriler', labelKey: 'customers', icon: Users },
  { to: '/stok', labelKey: 'stock', icon: Boxes },
  { to: '/ai', labelKey: 'aiAssistant', icon: Bot },
  { to: '/harita', labelKey: 'liveMap', icon: MapPinned, badgeKey: 'new' },
  { to: '/calisanlar', labelKey: 'employees', icon: UserRoundCog },
]

export default function AdminApp() {
  const { profile, cikisYap } = useAuth()
  const { t } = useLanguage()

  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-text">TechField</div>
            <div className="logo-sub logo-sub-admin">{t('adminPanel')}</div>
          </div>

          <nav className="nav-list">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
                <n.icon className="nav-icon" />
                <span>{t(n.labelKey)}</span>
                {n.badgeKey && <span className="nav-badge">{t(n.badgeKey)}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <LanguageSwitcher compact />
            <div className="sidebar-user">{profile?.ad || 'Admin'}</div>
            <div className="sidebar-role">{profile?.rol || 'admin'}</div>
            <button className="btn btn-block btn-compact" onClick={cikisYap}>
              <LogOut size={14} /> {t('logout')}
            </button>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/is-emirleri" element={<IsEmirleri />} />
            <Route path="/musteriler" element={<Musteriler />} />
            <Route path="/stok" element={<Stok />} />
            <Route path="/ai" element={<AIAsistan />} />
            <Route path="/harita" element={<CalisanHarita />} />
            <Route path="/calisanlar" element={<CalisanYonetim />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
