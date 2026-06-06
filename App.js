import { useEffect, useState } from 'react'
import { Bot, Boxes, Globe2, LayoutDashboard, LogOut, MapPin, MapPinned, PackagePlus, Search, ShoppingCart, Trash2, UserRoundCog, Users, Wrench } from 'lucide-react'
import { supabase } from './lib/supabase'
import './App.css'

const tr = {
  dashboard: 'Dashboard', employees: 'Calisanlar', employeeStock: 'Calisan Stoku', inventory: 'Stok', customers: 'Musteriler', jobs: 'Isler', liveMap: 'Canli Harita', ai: 'AI Chatbot',
  loginSub: 'Supabase baglantili yonetim paneli', email: 'E-posta', password: 'Sifre', signIn: 'Giris Yap', logout: 'Cikis Yap', loading: 'Yukleniyor...',
  admin: 'Admin', employee: 'Calisan', active: 'Aktif', passive: 'Pasif', edit: 'Duzenle', delete: 'Sil', add: 'Ekle', update: 'Guncelle', cancel: 'Vazgec',
  fullName: 'Ad Soyad', phone: 'Telefon', role: 'Rol', status: 'Durum', searchEmployees: 'Calisan ara...', selectEmployee: 'Soldan bir calisan sec.',
  employeeManagement: 'Calisan Yonetimi', employeeDetails: 'Calisan Bilgilerini Duzenle', product: 'Urun', category: 'Kategori', warehouse: 'Depo', quantity: 'Adet',
  minStock: 'Minimum Stok', unit: 'Birim', note: 'Aciklama', assignStock: 'Calisana Stok Ekle', addStock: 'Stok Ekle', currentStocks: 'Calisanin Uzerindeki Stoklar',
  movements: 'Stok Hareketleri', latestSales: 'Satis Hareketleri', sale: 'Satis Yap', customer: 'Musteri', customerName: 'Musteri / Firma', address: 'Adres',
  district: 'Ilce', unitPrice: 'Birim Fiyat', total: 'Toplam', date: 'Tarih', type: 'Tip', inventoryTitle: 'Ana Stok', addProduct: 'Urun Gir',
  criticalStock: 'Kritik stok', activeJobs: 'Aktif isler', salesToday: 'Satis toplam', addCustomer: 'Musteri Ekle', searchCustomers: 'Musteri ara...',
  workOrders: 'Is Emirleri', addJob: 'Is Ekle', jobTitle: 'Is Basligi', assignedTo: 'Atanan', unassigned: 'Atanmamis', transfer: 'Devret',
  unassign: 'Ustunden Al', noData: 'Kayit yok.', askAi: 'Saha operasyonu hakkinda sor...', send: 'Gonder', lastSeen: 'Son konum', accuracy: 'Dogruluk',
  simulateMove: 'Konumlari Yenile', mapHint: 'Google Maps canli konum izleme', myJobs: 'Islerim', myStock: 'Stokum', completedJobs: 'Tamamlanan Isler',
  closeJob: 'Isi Kapat', usedStock: 'Kullanilan Stok', complete: 'Tamamla', closeJobTitle: 'Isi kapat ve stok dus', noAssignedJobs: 'Uzerine atanmis aktif is yok.',
  addRow: 'Satir Ekle', addStocks: 'Stoklari Ekle', removeRow: 'Satiri Sil', error: 'Hata', locationSharing: 'Konum paylasiliyor', locationOff: 'Konum kapali',
  authEmailNote: 'Not: Supabase Auth e-postasi panelden degismez; burada calisan profil e-postasi guncellenir.', customerStock: 'Musteri Stogu',
  jobPhoto: 'Is / Musteri Fotograf', uploadPhoto: 'Fotograf Yukle', approve: 'Onayla', reject: 'Vazgec', aiActionReady: 'Aksiyon hazir', clearHistory: 'Gecmisi Temizle',
}

const en = {
  ...tr,
  employees: 'Employees', employeeStock: 'Employee Stock', inventory: 'Inventory', customers: 'Customers', jobs: 'Jobs', liveMap: 'Live Map',
  loginSub: 'Supabase connected management panel', email: 'Email', password: 'Password', signIn: 'Sign In', logout: 'Log Out', loading: 'Loading...',
  employee: 'Employee', active: 'Active', passive: 'Passive', edit: 'Edit', delete: 'Delete', add: 'Add', update: 'Update', cancel: 'Cancel',
  fullName: 'Full Name', phone: 'Phone', role: 'Role', status: 'Status', searchEmployees: 'Search employees...', selectEmployee: 'Select an employee from the left.',
  employeeManagement: 'Employee Management', employeeDetails: 'Edit Employee Details', product: 'Product', category: 'Category', warehouse: 'Warehouse', quantity: 'Qty',
  minStock: 'Minimum Stock', unit: 'Unit', note: 'Note', assignStock: 'Assign Stock to Employee', addStock: 'Add Stock', currentStocks: 'Employee Current Stock',
  movements: 'Stock Movements', latestSales: 'Sales Movements', sale: 'Sell', customer: 'Customer', customerName: 'Customer / Company', address: 'Address',
  district: 'District', unitPrice: 'Unit Price', total: 'Total', date: 'Date', type: 'Type', inventoryTitle: 'Main Inventory', addProduct: 'Add Product',
  criticalStock: 'Critical stock', activeJobs: 'Active jobs', salesToday: 'Sales total', addCustomer: 'Add Customer', searchCustomers: 'Search customers...',
  workOrders: 'Work Orders', addJob: 'Add Job', jobTitle: 'Job Title', assignedTo: 'Assigned To', unassigned: 'Unassigned', transfer: 'Transfer',
  unassign: 'Unassign', noData: 'No records.', askAi: 'Ask about field operations...', send: 'Send', lastSeen: 'Last seen', accuracy: 'Accuracy',
  simulateMove: 'Refresh Locations', mapHint: 'Google Maps live location tracking', myJobs: 'My Jobs', myStock: 'My Stock', completedJobs: 'Completed Jobs',
  closeJob: 'Close Job', usedStock: 'Used Stock', complete: 'Complete', closeJobTitle: 'Close job and deduct stock', noAssignedJobs: 'No active jobs assigned to you.',
  addRow: 'Add Row', addStocks: 'Add Stocks', removeRow: 'Remove Row', error: 'Error', locationSharing: 'Location sharing on', locationOff: 'Location off',
  authEmailNote: 'Note: Supabase Auth email cannot be changed here; this updates the employee profile email.', customerStock: 'Customer Stock',
  jobPhoto: 'Job / Customer Photo', uploadPhoto: 'Upload Photo', approve: 'Approve', reject: 'Cancel', aiActionReady: 'Action ready', clearHistory: 'Clear History',
}

const emptyData = {
  employees: [], customers: [], inventory: [], employeeStocks: [], customerStocks: [], movements: [], jobs: [], jobPhotos: [], locations: [], chat: [],
}

const uid = p => `${p}_${Date.now()}_${Math.random().toString(16).slice(2)}`
const money = v => `${Number(v || 0).toLocaleString('tr-TR')} TL`
const errorMessage = err => {
  if (!err) return 'Bilinmeyen hata'
  if (typeof err === 'string') return err
  if (err.message) return err.message
  if (err.details || err.hint || err.code) return [err.message, err.details, err.hint, err.code].filter(Boolean).join(' | ')
  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}
const QUERY_TIMEOUT_MS = 12000

function withTimeout(promise, label) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} zaman asimina ugradi. Supabase/RLS ayarlarini kontrol et.`)), QUERY_TIMEOUT_MS)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

async function safeQuery(label, query) {
  try {
    const res = await withTimeout(query, label)
    return res.error ? { data: [], error: res.error, label } : { data: res.data || [], error: null, label }
  } catch (error) {
    return { data: [], error, label }
  }
}

function toProfile(row) {
  const rawRole = String(row.role || row.rol || 'employee').trim().toLowerCase()
  const role = ['admin', 'yonetici', 'yönetici'].includes(rawRole) ? 'admin' : 'employee'
  return {
    id: row.id,
    name: row.full_name || row.ad || row.name || row.email || 'Kullanici',
    email: row.email || '',
    phone: row.phone || row.telefon || '',
    role,
    active: row.active ?? row.aktif ?? true,
  }
}
function toCustomer(row) {
  return { id: row.id, name: row.name, phone: row.phone || '', district: row.district || '', address: row.address || '' }
}
function toInventory(row) {
  return { id: row.id, name: row.name, category: row.category || '', warehouse: row.warehouse || '', quantity: row.quantity || 0, min: row.min_quantity || 0, unit: row.unit || 'adet' }
}
function toEmployeeStock(row) {
  return { id: row.id, employeeId: row.employee_id, productId: row.item_id, quantity: row.quantity || 0, updatedAt: row.updated_at }
}
function toMovement(row) {
  return { id: row.id, employeeId: row.employee_id, productId: row.item_id, jobId: row.job_id, type: row.movement_type, quantity: row.quantity, customerId: row.customer_id || '', customer: '', price: row.unit_price || 0, note: row.note || '', date: row.created_at }
}
function toJob(row) {
  return { id: row.id, title: row.title, customerId: row.customer_id || '', district: row.district || '', employeeId: row.assigned_employee_id || '', status: row.status, description: row.description || '', category: row.category || 'other', priority: row.priority || 'normal' }
}
function toCustomerStock(row) {
  return { id: row.id, customerId: row.customer_id, productId: row.item_id, quantity: row.quantity || 0, updatedAt: row.updated_at }
}
function toJobPhoto(row) {
  return { id: row.id, jobId: row.job_id, url: row.image_url, note: row.note || '', createdAt: row.created_at }
}
function toLocation(row) {
  return { employeeId: row.employee_id, lat: row.lat, lng: row.lng, accuracy: row.accuracy || 0, updatedAt: row.updated_at, online: true }
}

async function uploadJobPhoto(jobId, file, note) {
  if (!jobId || !file) return
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `jobs/${jobId}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage.from('fault-photos').upload(path, file, { upsert: true })
  if (uploadError) throw uploadError
  const { data: publicData } = supabase.storage.from('fault-photos').getPublicUrl(path)
  const { error: insertError } = await supabase.from('fault_photos').insert({ job_id: jobId, image_url: publicData.publicUrl, note })
  if (insertError) throw insertError
}

export default function App() {
  const [lang, setLang] = useState(localStorage.getItem('techfield_lang') || 'tr')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [screen, setScreen] = useState('dashboard')
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const t = lang === 'tr' ? tr : en

  function changeLang(v) {
    setLang(v)
    localStorage.setItem('techfield_lang', v)
  }

  async function loadProfile(authUser, shouldNavigate = false) {
    const { data: row, error: profileError } = await withTimeout(
      supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
      'Profil sorgusu'
    )
    if (profileError) throw profileError
    if (!row) {
      throw new Error(`Bu Auth kullanicisi icin profiles kaydi yok. profiles.id degeri Auth user id ile ayni olmali: ${authUser.id}`)
    }
    const nextProfile = toProfile(row)
    setProfile(nextProfile)
    if (shouldNavigate) setScreen(nextProfile.role === 'admin' ? 'dashboard' : 'myJobs')
    return nextProfile
  }

  async function loadData(activeProfile = profile) {
    if (!activeProfile) return
    setError('')
    const [profilesRes, customersRes, inventoryRes, employeeStockRes, customerStockRes, movementsRes, jobsRes, photosRes, locationsRes, aiRes] = await Promise.all([
      safeQuery('Calisanlar', supabase.from('profiles').select('*')),
      safeQuery('Musteriler', supabase.from('customers').select('*').order('name')),
      safeQuery('Stok', supabase.from('inventory_items').select('*').order('name')),
      safeQuery('Calisan stoku', supabase.from('employee_stock').select('*').order('updated_at', { ascending: false })),
      safeQuery('Musteri stogu', supabase.from('customer_stock').select('*').order('updated_at', { ascending: false })),
      safeQuery('Stok hareketleri', supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(80)),
      safeQuery('Isler', supabase.from('jobs').select('*').order('created_at', { ascending: false })),
      safeQuery('Is fotograflari', supabase.from('fault_photos').select('*').order('created_at', { ascending: false })),
      safeQuery('Konumlar', supabase.from('employee_locations').select('*')),
      safeQuery('AI mesajlari', supabase.from('ai_messages').select('*').eq('user_id', activeProfile.id).order('created_at', { ascending: true }).limit(80)),
    ])
    const queryErrors = [profilesRes, customersRes, inventoryRes, employeeStockRes, customerStockRes, movementsRes, jobsRes, photosRes, locationsRes, aiRes]
      .filter(r => r.error)
      .filter(r => !(r.label === 'Musteri stogu' && /schema cache|Could not find the table/i.test(errorMessage(r.error))))
    if (queryErrors.length) setError(queryErrors.map(r => `${r.label}: ${errorMessage(r.error)}`).join(' | '))
    setData({
      employees: (profilesRes.data || []).map(toProfile).sort((a, b) => a.name.localeCompare(b.name, 'tr')),
      customers: (customersRes.data || []).map(toCustomer),
      inventory: (inventoryRes.data || []).map(toInventory),
      employeeStocks: (employeeStockRes.data || []).map(toEmployeeStock),
      customerStocks: (customerStockRes.data || []).map(toCustomerStock),
      movements: (movementsRes.data || []).map(toMovement),
      jobs: (jobsRes.data || []).map(toJob),
      jobPhotos: (photosRes.data || []).map(toJobPhoto),
      locations: (locationsRes.data || []).map(toLocation),
      chat: (aiRes.data || []).map(row => ({ id: row.id, role: row.role, text: row.content, imageUrl: row.image_url || '' })),
    })
  }

  async function refreshLocations() {
    setError('')
    const { data: rows, error: locationsError } = await withTimeout(
      supabase.from('employee_locations').select('*'),
      'Konumlar'
    )
    if (locationsError) {
      setError(`Konumlar: ${errorMessage(locationsError)}`)
      return false
    }
    setData(prev => ({ ...prev, locations: (rows || []).map(toLocation) }))
    return true
  }

  useEffect(() => {
    let mounted = true
    async function openSession(session, shouldNavigate = false) {
      try {
        const authUser = session?.user || null
        if (!authUser) {
          setUser(null)
          setProfile(null)
          setData(emptyData)
          return
        }
        const nextProfile = await loadProfile(authUser, shouldNavigate)
        if (!mounted) return
        setUser(authUser)
        setLoading(false)
        await loadData(nextProfile)
      } catch (err) {
        if (mounted) setError(errorMessage(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    async function boot() {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        await openSession(sessionData.session, true)
      } catch (err) {
        if (mounted) setError(errorMessage(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }
    boot()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => openSession(session, false), 0)
    })
    return () => {
      mounted = false
      listener?.subscription?.unsubscribe()
    }
  }, [])

  async function login(email, password) {
    setError('')
    const { data: authData, error: loginError } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
      'Giris'
    )
    if (loginError) throw loginError
    setUser(authData.user)
    const nextProfile = await loadProfile(authData.user, true)
    await loadData(nextProfile)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setData(emptyData)
  }

  const adminNav = [
    ['dashboard', t.dashboard, LayoutDashboard], ['employees', t.employees, UserRoundCog], ['employeeStock', t.employeeStock, PackagePlus],
    ['inventory', t.inventory, Boxes], ['customers', t.customers, Users], ['jobs', t.jobs, Wrench], ['map', t.liveMap, MapPinned], ['ai', t.ai, Bot],
  ]
  const employeeNav = [['myJobs', t.myJobs, Wrench], ['myStock', t.myStock, Boxes], ['ai', t.ai, Bot]]
  const nav = profile?.role === 'admin' ? adminNav : employeeNav

  if (loading) return <div className="login-shell"><div className="login-card">{t.loading}</div></div>
  if (!user || !profile) return <Login t={t} lang={lang} setLang={changeLang} onLogin={login} error={error} />

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo"><div className="logo-text">TechField</div><div className="logo-sub">{profile.role === 'admin' ? t.admin : t.employee}</div></div>
        <nav className="nav-list">{nav.map(([id, label, Icon]) => <button key={id} className={`nav-item nav-button ${screen === id ? 'active' : ''}`} onClick={() => setScreen(id)}><Icon className="nav-icon" /><span>{label}</span></button>)}</nav>
        <div className="sidebar-footer">
          <label className="language-switcher compact"><Globe2 size={15} /><select value={lang} onChange={e => changeLang(e.target.value)}><option value="tr">TR</option><option value="en">EN</option></select></label>
          {profile.role === 'employee' && <LocationPublisher t={t} profile={profile} />}
          <div className="sidebar-user">{profile.name}</div><div className="sidebar-role">{profile.email}</div>
          <button className="btn btn-block btn-compact" onClick={logout}><LogOut size={14} /> {t.logout}</button>
        </div>
      </aside>
      <main className="main-content">
        {error && <div className="alert alert-danger" style={{ margin: 16 }}>{error}</div>}
        {screen === 'dashboard' && <Dashboard t={t} data={data} />}
        {screen === 'employees' && <Employees t={t} data={data} reload={() => loadData(profile)} currentProfile={profile} />}
        {screen === 'employeeStock' && <EmployeeStock t={t} data={data} reload={() => loadData(profile)} />}
        {screen === 'inventory' && <Inventory t={t} data={data} reload={() => loadData(profile)} />}
        {screen === 'customers' && <Customers t={t} data={data} reload={() => loadData(profile)} />}
        {screen === 'jobs' && <Jobs t={t} data={data} reload={() => loadData(profile)} />}
        {screen === 'map' && <LiveMap t={t} data={data} refreshLocations={refreshLocations} />}
        {screen === 'myJobs' && <EmployeeJobs t={t} data={data} reload={() => loadData(profile)} profile={profile} />}
        {screen === 'myStock' && <EmployeeMyStock t={t} data={data} profile={profile} />}
        {screen === 'ai' && <AiChat t={t} data={data} reload={() => loadData(profile)} profile={profile} onShowEmployeeStock={() => setScreen('employeeStock')} />}
      </main>
    </div>
  )
}

function LocationPublisher({ t, profile }) {
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    if (!profile?.id || profile.role !== 'employee') return undefined
    let cancelled = false
    let intervalId

    async function savePosition(pos) {
      const payload = {
        employee_id: profile.id,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        updated_at: new Date().toISOString(),
      }
      const { error: locationError } = await supabase.from('employee_locations').upsert(payload, { onConflict: 'employee_id' })
      if (!cancelled) setStatus(locationError ? 'error' : 'active')
      if (locationError) console.warn('Konum kaydedilemedi:', locationError.message)
    }

    function publishLocation() {
      if (!navigator.geolocation) {
        setStatus('error')
        return
      }
      setStatus('pending')
      navigator.geolocation.getCurrentPosition(
        position => savePosition(position),
        error => {
          if (!cancelled) setStatus('error')
          console.warn('Konum alinamadi:', error.message)
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 20000 }
      )
    }

    publishLocation()
    intervalId = window.setInterval(publishLocation, 30000)
    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [profile?.id, profile?.role])

  return (
    <div className={`location-pill ${status === 'error' ? 'is-off' : ''}`}>
      <MapPin size={13} />
      <span>{status === 'error' ? t.locationOff : t.locationSharing}</span>
    </div>
  )
}

function Login({ t, lang, setLang, onLogin, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState('')
  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setLocalError('')
    try {
      await onLogin(email.trim(), password)
    } catch (err) {
      setLocalError(err.message)
    } finally {
      setBusy(false)
    }
  }
  return <div className="login-shell"><form className="login-card" onSubmit={submit}><div className="login-head"><div><div className="logo-text login-logo">TechField</div><div className="logo-sub">{t.loginSub}</div></div><label className="language-switcher"><Globe2 size={15} /><select value={lang} onChange={e => setLang(e.target.value)}><option value="tr">TR</option><option value="en">EN</option></select></label></div><Field label={t.email} value={email} onChange={setEmail} /><Field label={t.password} type="password" value={password} onChange={setPassword} />{(error || localError) && <div className="alert alert-danger">{error || localError}</div>}<button className="btn btn-primary btn-block" disabled={busy} type="submit">{busy ? t.loading : t.signIn}</button></form></div>
}

function Dashboard({ t, data }) {
  const assigned = data.employeeStocks.reduce((sum, x) => sum + Number(x.quantity), 0)
  const critical = data.inventory.filter(x => x.quantity <= x.min).length
  const sales = data.movements.filter(x => x.type === 'sale').reduce((sum, x) => sum + Number(x.price || 0) * Number(x.quantity || 0), 0)
  return <><Header title={t.dashboard} /><div className="page-body"><div className="metrics-grid"><Metric icon={Wrench} label={t.activeJobs} value={data.jobs.filter(x => x.status !== 'completed').length} sub={t.workOrders} /><Metric icon={Boxes} label={t.criticalStock} value={critical} sub={t.inventoryTitle} warn={critical > 0} /><Metric icon={PackagePlus} label={t.employeeStock} value={assigned} sub={t.employees} /><Metric icon={ShoppingCart} label={t.salesToday} value={money(sales)} sub={t.latestSales} /></div></div></>
}

function Employees({ t, data, reload, currentProfile }) {
  const [selectedId, setSelectedId] = useState(data.employees[0]?.id || '')
  const [query, setQuery] = useState('')
  const selected = data.employees.find(x => x.id === selectedId)
  const employees = data.employees.filter(x => [x.name, x.email, x.role].join(' ').toLowerCase().includes(query.toLowerCase()))
  async function updateEmployee(patch) {
    if (!selected) return
    await supabase.from('profiles').update({ full_name: patch.name ?? selected.name, email: patch.email ?? selected.email, phone: patch.phone ?? selected.phone, role: patch.role ?? selected.role, active: patch.active ?? selected.active }).eq('id', selected.id)
    await reload()
  }
  async function deleteEmployee(emp) {
    if (emp.id === currentProfile.id || !window.confirm(`${emp.name} silinsin mi?`)) return
    await supabase.from('profiles').delete().eq('id', emp.id)
    await reload()
  }
  return <><Header title={t.employeeManagement} /><div className="page-body employee-grid"><section className="card"><div className="toolbar mb-1"><div className="card-title">{t.employees}</div><label className="search-field"><Search size={16} /><input placeholder={t.searchEmployees} value={query} onChange={e => setQuery(e.target.value)} /></label></div><Table headers={[t.fullName, t.email, t.role, t.status, t.edit]}>{employees.map(emp => <tr key={emp.id} className={emp.id === selectedId ? 'selected-row' : ''}><td>{emp.name}</td><td>{emp.email}</td><td>{emp.role === 'admin' ? t.admin : t.employee}</td><td><span className={`badge ${emp.active ? 'badge-green' : 'badge-gray'}`}>{emp.active ? t.active : t.passive}</span></td><td><div className="gap-8"><button className="btn btn-compact" onClick={() => setSelectedId(emp.id)}>{t.edit}</button><button className="btn btn-danger btn-compact" disabled={emp.id === currentProfile.id} onClick={() => deleteEmployee(emp)}><Trash2 size={13} /> {t.delete}</button></div></td></tr>)}</Table></section><section className="card">{!selected ? <p className="empty-text">{t.selectEmployee}</p> : <EmployeeEditor t={t} employee={selected} onSave={updateEmployee} />}</section></div></>
}

function EmployeeEditor({ t, employee, onSave }) {
  const [form, setForm] = useState(employee)
  useEffect(() => setForm(employee), [employee])
  return <><div className="card-title">{t.employeeDetails}</div><div className="form-grid"><Field label={t.fullName} value={form.name || ''} onChange={v => setForm({ ...form, name: v })} /><Field label={t.email} value={form.email || ''} onChange={v => setForm({ ...form, email: v })} /><Field label={t.phone} value={form.phone || ''} onChange={v => setForm({ ...form, phone: v })} /><Select label={t.role} value={form.role} onChange={v => setForm({ ...form, role: v })} options={[['admin', t.admin], ['employee', t.employee]]} /><Select label={t.status} value={form.active ? 'active' : 'passive'} onChange={v => setForm({ ...form, active: v === 'active' })} options={[['active', t.active], ['passive', t.passive]]} /></div><p className="empty-text mb-1">{t.authEmailNote}</p><button className="btn btn-primary" onClick={() => onSave(form)}>{t.update}</button></>
}

function EmployeeStock({ t, data, reload }) {
  const defaultEmployeeId = () => data.employees.find(x => x.role === 'employee')?.id || data.employees[0]?.id || ''
  const [employeeId, setEmployeeId] = useState(() => localStorage.getItem('techfield_employee_stock_selected_id') || localStorage.getItem('techfield_focus_employee_stock_id') || defaultEmployeeId())
  const blankLine = () => ({ id: uid('line'), productId: '', quantity: 1, note: '' })
  const [stockLines, setStockLines] = useState([blankLine()])
  const [saleForm, setSaleForm] = useState({ stockRowId: null, customerId: '', quantity: 1, price: 0 })
  const employeeStocks = data.employeeStocks.filter(x => x.employeeId === employeeId)
  const product = id => data.inventory.find(x => x.id === id) || {}
  const customerName = id => data.customers.find(x => x.id === id)?.name || '-'
  const movements = data.movements.filter(x => x.employeeId === employeeId).map(x => ({ ...x, customer: customerName(x.customerId) }))
  const sales = movements.filter(x => x.type === 'sale')
  const customerStocks = data.customerStocks.map(x => ({ ...x, customer: customerName(x.customerId) }))
  function selectEmployeeStock(id) {
    setEmployeeId(id)
    if (id) localStorage.setItem('techfield_employee_stock_selected_id', id)
  }
  useEffect(() => {
    const focusEmployeeId = localStorage.getItem('techfield_focus_employee_stock_id')
    if (focusEmployeeId && data.employees.some(x => x.id === focusEmployeeId)) {
      selectEmployeeStock(focusEmployeeId)
      localStorage.removeItem('techfield_focus_employee_stock_id')
      return
    }
    const savedEmployeeId = localStorage.getItem('techfield_employee_stock_selected_id')
    if (savedEmployeeId && data.employees.some(x => x.id === savedEmployeeId) && savedEmployeeId !== employeeId) {
      setEmployeeId(savedEmployeeId)
      return
    }
    if ((!employeeId || !data.employees.some(x => x.id === employeeId)) && data.employees.length) {
      selectEmployeeStock(defaultEmployeeId())
    }
  }, [data.employees, employeeId])
  function updateLine(id, patch) { setStockLines(prev => prev.map(line => line.id === id ? { ...line, ...patch } : line)) }
  async function saveStocks() {
    const valid = stockLines.map(x => ({ ...x, quantity: Number(x.quantity || 0) })).filter(x => x.productId && x.quantity > 0)
    const totals = valid.reduce((acc, line) => ({ ...acc, [line.productId]: (acc[line.productId] || 0) + line.quantity }), {})
    for (const [productId, quantity] of Object.entries(totals)) {
      const item = data.inventory.find(x => x.id === productId)
      if (!item || Number(item.quantity) < quantity) throw new Error(`${item?.name || t.product}: merkez depo stogu yetersiz`)
    }
    for (const line of valid) {
      const { error: assignError } = await supabase.rpc('assign_stock_to_employee', {
        p_employee_id: employeeId,
        p_item_id: line.productId,
        p_quantity: line.quantity,
        p_note: line.note || null,
      })
      if (assignError) throw assignError
    }
    setStockLines([blankLine()])
    await reload()
  }
  async function deleteStock(row) {
    await supabase.from('employee_stock').delete().eq('id', row.id)
    await reload()
  }
  async function makeSale() {
    const stock = data.employeeStocks.find(x => x.id === saleForm.stockRowId)
    if (!stock) return
    const quantity = Number(saleForm.quantity || 0)
    const price = Number(saleForm.price || 0)
    if (quantity <= 0 || quantity > stock.quantity || !saleForm.customerId) return
    const { error: saleError } = await supabase.rpc('sell_employee_stock_to_customer', {
      p_employee_id: employeeId,
      p_customer_id: saleForm.customerId,
      p_item_id: stock.productId,
      p_quantity: quantity,
      p_unit_price: price,
      p_note: null,
    })
    if (saleError) throw saleError
    setSaleForm({ stockRowId: null, customerId: '', quantity: 1, price: 0 })
    await reload()
  }
  return <><Header title={t.employeeStock} /><div className="page-body two-column"><section className="card"><div className="card-title">{t.assignStock}</div><Select label={t.employee} value={employeeId} onChange={selectEmployeeStock} options={data.employees.map(x => [x.id, x.name])} />{stockLines.map((line, index) => <div className="stock-line" key={line.id}><Select label={`${t.product} ${index + 1}`} value={line.productId} onChange={v => updateLine(line.id, { productId: v })} options={[['', '-'], ...data.inventory.map(x => [x.id, `${x.name} (${x.quantity} ${x.unit}, ${x.warehouse})`])]} /><Field label={t.quantity} type="number" value={line.quantity} onChange={v => updateLine(line.id, { quantity: v })} /><Field label={t.note} value={line.note} onChange={v => updateLine(line.id, { note: v })} />{stockLines.length > 1 && <button className="btn btn-danger btn-compact" onClick={() => setStockLines(prev => prev.filter(x => x.id !== line.id))}>{t.removeRow}</button>}</div>)}<div className="gap-8"><button className="btn" onClick={() => setStockLines(prev => [...prev, blankLine()])}>{t.addRow}</button><button className="btn btn-primary" onClick={saveStocks}>{t.addStocks}</button></div></section><section className="card"><StockTable t={t} rows={employeeStocks} product={product} onDelete={deleteStock} onSale={row => setSaleForm({ ...saleForm, stockRowId: row.id })} />{saleForm.stockRowId && <div className="inline-panel mb-1"><Select label={t.customer} value={saleForm.customerId} onChange={v => setSaleForm({ ...saleForm, customerId: v })} options={[['', '-'], ...data.customers.map(x => [x.id, x.name])]} /><Field label={t.quantity} type="number" value={saleForm.quantity} onChange={v => setSaleForm({ ...saleForm, quantity: v })} /><Field label={t.unitPrice} type="number" value={saleForm.price} onChange={v => setSaleForm({ ...saleForm, price: v })} /><button className="btn btn-primary" onClick={makeSale}>{t.sale}</button></div>}<HistoryTable t={t} title={t.customerStock} rows={customerStocks} product={product} mode="customerStock" /><HistoryTable t={t} title={t.movements} rows={movements} product={product} mode="movement" /><HistoryTable t={t} title={t.latestSales} rows={sales} product={product} mode="sale" /></section></div></>
}

function Inventory({ t, data, reload }) {
  const [form, setForm] = useState({ id: null, name: '', category: '', warehouse: 'Merkez Depo', quantity: 0, min: 2, unit: 'adet' })
  const reset = () => setForm({ id: null, name: '', category: '', warehouse: 'Merkez Depo', quantity: 0, min: 2, unit: 'adet' })
  async function saveProduct() {
    if (!form.name.trim()) return
    const payload = { name: form.name, category: form.category, warehouse: form.warehouse, quantity: Number(form.quantity), min_quantity: Number(form.min), unit: form.unit }
    form.id ? await supabase.from('inventory_items').update(payload).eq('id', form.id) : await supabase.from('inventory_items').insert(payload)
    reset()
    await reload()
  }
  async function adjust(item, delta) {
    await supabase.from('inventory_items').update({ quantity: Math.max(0, Number(item.quantity) + delta), updated_at: new Date().toISOString() }).eq('id', item.id)
    await reload()
  }
  async function deleteProduct(item) {
    await supabase.from('inventory_items').delete().eq('id', item.id)
    await reload()
  }
  return <><Header title={t.inventoryTitle} /><div className="page-body two-column"><section className="card"><div className="card-title">{t.addProduct}</div><Field label={t.product} value={form.name} onChange={v => setForm({ ...form, name: v })} /><div className="form-grid"><Field label={t.category} value={form.category} onChange={v => setForm({ ...form, category: v })} /><Field label={t.warehouse} value={form.warehouse} onChange={v => setForm({ ...form, warehouse: v })} /></div><div className="form-grid"><Field label={t.quantity} type="number" value={form.quantity} onChange={v => setForm({ ...form, quantity: v })} /><Field label={t.minStock} type="number" value={form.min} onChange={v => setForm({ ...form, min: v })} /></div><Field label={t.unit} value={form.unit} onChange={v => setForm({ ...form, unit: v })} /><div className="gap-8"><button className="btn btn-primary" onClick={saveProduct}>{form.id ? t.update : t.add}</button>{form.id && <button className="btn" onClick={reset}>{t.cancel}</button>}</div></section><section className="card"><Table headers={[t.product, t.category, t.warehouse, t.quantity, t.minStock, t.status, t.edit]}>{data.inventory.map(item => <tr key={item.id}><td>{item.name}</td><td>{item.category}</td><td>{item.warehouse}</td><td>{item.quantity} {item.unit}</td><td>{item.min}</td><td><span className={`badge ${item.quantity <= item.min ? 'badge-amber' : 'badge-green'}`}>{item.quantity <= item.min ? t.criticalStock : t.active}</span></td><td><div className="gap-8 row-actions"><button className="btn btn-compact" onClick={() => adjust(item, 1)}>+1</button><button className="btn btn-compact" onClick={() => adjust(item, -1)}>-1</button><button className="btn btn-compact" onClick={() => setForm(item)}>{t.edit}</button><button className="btn btn-danger btn-compact" onClick={() => deleteProduct(item)}>{t.delete}</button></div></td></tr>)}</Table></section></div></>
}

function Customers({ t, data, reload }) {
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ id: null, name: '', phone: '', district: '', address: '' })
  const customers = data.customers.filter(x => [x.name, x.phone, x.district].join(' ').toLowerCase().includes(query.toLowerCase()))
  async function saveCustomer() {
    if (!form.name.trim()) return
    const payload = { name: form.name, phone: form.phone, district: form.district, address: form.address }
    form.id ? await supabase.from('customers').update(payload).eq('id', form.id) : await supabase.from('customers').insert(payload)
    setForm({ id: null, name: '', phone: '', district: '', address: '' })
    await reload()
  }
  return <><Header title={t.customers} /><div className="page-body two-column"><section className="card"><div className="card-title">{t.addCustomer}</div><Field label={t.customerName} value={form.name} onChange={v => setForm({ ...form, name: v })} /><Field label={t.phone} value={form.phone} onChange={v => setForm({ ...form, phone: v })} /><Field label={t.district} value={form.district} onChange={v => setForm({ ...form, district: v })} /><Field label={t.address} value={form.address} onChange={v => setForm({ ...form, address: v })} /><button className="btn btn-primary" onClick={saveCustomer}>{form.id ? t.update : t.addCustomer}</button></section><section className="card"><label className="search-field mb-1"><Search size={16} /><input placeholder={t.searchCustomers} value={query} onChange={e => setQuery(e.target.value)} /></label><Table headers={[t.customerName, t.phone, t.district, t.address, t.edit]}>{customers.map(c => <tr key={c.id}><td>{c.name}</td><td>{c.phone}</td><td>{c.district}</td><td>{c.address}</td><td><div className="gap-8"><button className="btn btn-compact" onClick={() => setForm(c)}>{t.edit}</button><button className="btn btn-danger btn-compact" onClick={async () => { await supabase.from('customers').delete().eq('id', c.id); await reload() }}>{t.delete}</button></div></td></tr>)}</Table></section></div></>
}

function Jobs({ t, data, reload }) {
  const blank = { id: null, title: '', customerId: data.customers[0]?.id || '', district: '', employeeId: '', status: 'pending' }
  const [form, setForm] = useState(blank)
  const [photoFile, setPhotoFile] = useState(null)
  const customerName = id => data.customers.find(x => x.id === id)?.name || '-'
  const employeeName = id => data.employees.find(x => x.id === id)?.name || t.unassigned
  const photoFor = id => data.jobPhotos.find(x => x.jobId === id)
  async function saveJob() {
    if (!form.title.trim()) return
    const payload = { title: form.title, customer_id: form.customerId || null, district: form.district, assigned_employee_id: form.employeeId || null, status: form.status || 'pending', category: 'other' }
    let jobId = form.id
    if (form.id) {
      await supabase.from('jobs').update(payload).eq('id', form.id)
    } else {
      const { data: created, error: createError } = await supabase.from('jobs').insert(payload).select('id').single()
      if (createError) throw createError
      jobId = created.id
    }
    await uploadJobPhoto(jobId, photoFile, t.jobPhoto)
    setForm(blank)
    setPhotoFile(null)
    await reload()
  }
  async function updateJob(job, patch) {
    await supabase.from('jobs').update(patch).eq('id', job.id)
    await reload()
  }
  return <><Header title={t.workOrders} /><div className="page-body two-column"><section className="card"><div className="card-title">{t.addJob}</div><Field label={t.jobTitle} value={form.title} onChange={v => setForm({ ...form, title: v })} /><Select label={t.customer} value={form.customerId} onChange={v => setForm({ ...form, customerId: v })} options={[['', '-'], ...data.customers.map(x => [x.id, x.name])]} /><Field label={t.district} value={form.district} onChange={v => setForm({ ...form, district: v })} /><Select label={t.assignedTo} value={form.employeeId} onChange={v => setForm({ ...form, employeeId: v })} options={[['', t.unassigned], ...data.employees.map(x => [x.id, x.name])]} /><Field label={t.status} value={form.status} onChange={v => setForm({ ...form, status: v })} /><div className="form-group"><label className="form-label">{t.jobPhoto}</label><input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} /></div><div className="gap-8"><button className="btn btn-primary" onClick={saveJob}>{form.id ? t.update : t.addJob}</button>{form.id && <button className="btn" onClick={() => { setForm(blank); setPhotoFile(null) }}>{t.cancel}</button>}</div></section><section className="card"><Table headers={[t.jobs, t.customer, t.district, t.assignedTo, t.status, t.jobPhoto, t.transfer]}>{data.jobs.map(job => { const photo = photoFor(job.id); return <tr key={job.id}><td>{job.title}</td><td>{customerName(job.customerId)}</td><td>{job.district}</td><td>{employeeName(job.employeeId)}</td><td><span className="badge badge-blue">{job.status}</span></td><td>{photo ? <a href={photo.url} target="_blank" rel="noreferrer">{t.jobPhoto}</a> : '-'}</td><td><div className="gap-8 row-actions"><select className="mini-select" value={job.employeeId || ''} onChange={e => updateJob(job, { assigned_employee_id: e.target.value || null })}><option value="">{t.unassigned}</option>{data.employees.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select><button className="btn btn-compact" onClick={() => updateJob(job, { assigned_employee_id: null })}>{t.unassign}</button><button className="btn btn-compact" onClick={() => setForm(job)}>{t.edit}</button><button className="btn btn-danger btn-compact" onClick={async () => { await supabase.from('jobs').delete().eq('id', job.id); await reload() }}>{t.delete}</button></div></td></tr> })}</Table></section></div></>
}

function EmployeeJobs({ t, data, reload, profile }) {
  const [closingJob, setClosingJob] = useState(null)
  const [usedStockId, setUsedStockId] = useState('')
  const [usedQty, setUsedQty] = useState(1)
  const [photoFiles, setPhotoFiles] = useState({})
  const activeJobs = data.jobs.filter(x => x.employeeId === profile.id && x.status !== 'completed')
  const completedJobs = data.jobs.filter(x => x.employeeId === profile.id && x.status === 'completed')
  const customerName = id => data.customers.find(x => x.id === id)?.name || '-'
  const photosFor = id => data.jobPhotos.filter(x => x.jobId === id)
  const myStocks = data.employeeStocks.filter(x => x.employeeId === profile.id)
  const product = id => data.inventory.find(x => x.id === id) || {}
  async function saveEmployeePhoto(job) {
    await uploadJobPhoto(job.id, photoFiles[job.id], t.jobPhoto)
    setPhotoFiles(prev => ({ ...prev, [job.id]: null }))
    await reload()
  }
  async function closeJob() {
    const stock = data.employeeStocks.find(x => x.id === usedStockId)
    await supabase.rpc('complete_job_with_stock', { p_job_id: closingJob.id, p_item_id: stock?.productId || null, p_quantity: stock ? Number(usedQty || 0) : 0, p_note: null })
    setClosingJob(null)
    setUsedStockId('')
    setUsedQty(1)
    await reload()
  }
  return <><Header title={t.myJobs} /><div className="page-body two-column"><section className="card"><div className="card-title">{t.activeJobs}</div><div className="job-card-list">{activeJobs.map(job => <article className="job-card" key={job.id}><div><div className="job-card-title">{job.title}</div><div className="job-card-meta">{customerName(job.customerId)} · {job.district || '-'}</div><PhotoLinks t={t} photos={photosFor(job.id)} /></div><span className="badge badge-blue">{job.status}</span><button className="btn btn-primary btn-compact" onClick={() => setClosingJob(job)}>{t.closeJob}</button><div className="job-photo-upload"><input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFiles(prev => ({ ...prev, [job.id]: e.target.files?.[0] || null }))} /><button className="btn btn-compact" disabled={!photoFiles[job.id]} onClick={() => saveEmployeePhoto(job)}>{t.uploadPhoto}</button></div></article>)}</div>{!activeJobs.length && <p className="empty-text">{t.noAssignedJobs}</p>}</section><section className="card">{closingJob ? <><div className="card-title">{t.closeJobTitle}</div><div className="inline-job-summary"><strong>{closingJob.title}</strong><span>{customerName(closingJob.customerId)} · {closingJob.district || '-'}</span><PhotoLinks t={t} photos={photosFor(closingJob.id)} /></div><Select label={t.usedStock} value={usedStockId} onChange={setUsedStockId} options={[['', '-'], ...myStocks.map(x => [x.id, `${product(x.productId).name} (${x.quantity} ${product(x.productId).unit})`])]} /><Field label={t.quantity} type="number" value={usedQty} onChange={setUsedQty} /><div className="gap-8"><button className="btn btn-primary" onClick={closeJob}>{t.complete}</button><button className="btn" onClick={() => setClosingJob(null)}>{t.cancel}</button></div></> : <><div className="card-title">{t.completedJobs}</div><Table headers={[t.jobTitle, t.customer, t.district, t.status, t.jobPhoto]}>{completedJobs.map(job => <tr key={job.id}><td>{job.title}</td><td>{customerName(job.customerId)}</td><td>{job.district}</td><td><span className="badge badge-green">{job.status}</span></td><td><PhotoLinks t={t} photos={photosFor(job.id)} /></td></tr>)}</Table></>}</section></div></>
}

function PhotoLinks({ t, photos }) {
  if (!photos.length) return <span className="empty-text">-</span>
  return <div className="photo-links">{photos.map((photo, index) => <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer">{t.jobPhoto} {index + 1}</a>)}</div>
}

function EmployeeMyStock({ t, data, profile }) {
  const product = id => data.inventory.find(x => x.id === id) || {}
  const rows = data.employeeStocks.filter(x => x.employeeId === profile.id)
  return <><Header title={t.myStock} /><div className="page-body"><section className="card"><Table headers={[t.product, t.category, t.warehouse, t.quantity, t.date]}>{rows.map(row => { const p = product(row.productId); return <tr key={row.id}><td>{p.name}</td><td>{p.category}</td><td>{p.warehouse}</td><td>{row.quantity} {p.unit}</td><td>{new Date(row.updatedAt).toLocaleString('tr-TR')}</td></tr> })}</Table></section></div></>
}

function LiveMap({ t, data, refreshLocations }) {
  const employees = data.employees.filter(x => x.role === 'employee')
  const locationFor = id => data.locations.find(x => x.employeeId === id)
  const [selectedId, setSelectedId] = useState(employees[0]?.id || '')
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState('')
  useEffect(() => {
    if (!selectedId && employees[0]?.id) setSelectedId(employees[0].id)
  }, [employees, selectedId])
  useEffect(() => {
    if (!refreshLocations) return undefined
    const intervalId = window.setInterval(refreshLocations, 15000)
    return () => window.clearInterval(intervalId)
  }, [refreshLocations])
  async function manualRefresh() {
    setRefreshing(true)
    const ok = await refreshLocations()
    if (ok) setLastRefresh(new Date().toLocaleTimeString('tr-TR'))
    setRefreshing(false)
  }
  const selectedLoc = locationFor(selectedId) || data.locations[0]
  const mapUrl = selectedLoc ? `https://maps.google.com/maps?q=${selectedLoc.lat},${selectedLoc.lng}&z=15&output=embed` : 'https://maps.google.com/maps?q=Mersin,Turkey&z=12&output=embed'
  return <><Header title={t.liveMap} /><div className="page-body map-grid"><section className="card"><div className="toolbar mb-1"><div><div className="card-title">{t.employees}</div><p className="empty-text">{lastRefresh ? `${t.mapHint} - ${t.lastSeen}: ${lastRefresh}` : t.mapHint}</p></div><button className="btn btn-compact" disabled={refreshing} onClick={manualRefresh}>{refreshing ? t.loading : t.simulateMove}</button></div><div className="location-list">{employees.map(emp => { const loc = locationFor(emp.id); return <button key={emp.id} className={`location-row ${selectedId === emp.id ? 'active' : ''}`} type="button" onClick={() => setSelectedId(emp.id)}><span className={`status-dot ${loc ? 'online' : ''}`} /><span><strong>{emp.name}</strong><small>{loc ? `${t.lastSeen}: ${new Date(loc.updatedAt).toLocaleTimeString('tr-TR')} - ${t.accuracy}: ${loc.accuracy}m` : '-'}</small></span></button> })}</div></section><section className="card map-card"><div className="google-map-shell"><iframe title={t.liveMap} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> <div className="map-side-pins">{data.locations.map(loc => <button key={loc.employeeId} className={`map-mini-pin ${selectedId === loc.employeeId ? 'active' : ''}`} onClick={() => setSelectedId(loc.employeeId)}><span>{employees.find(x => x.id === loc.employeeId)?.name || '-'}</span><small>{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}</small></button>)}</div></div></section></div></>
}

function AiChat({ t, data, reload, profile, onShowEmployeeStock }) {
  const [input, setInput] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [chatError, setChatError] = useState('')
  const productById = id => data.inventory.find(x => x.id === id)
  const employeeById = id => data.employees.find(x => x.id === id)
  const normalize = value => String(value || '').toLocaleLowerCase('tr-TR')
  const matchProduct = text => data.inventory.find(item => normalize(text).includes(normalize(item.name)))
  const matchEmployee = text => data.employees.find(emp => normalize(text).includes(normalize(emp.name)) || normalize(text).includes(normalize(emp.email)))
  const matchCustomer = text => data.customers.find(customer => normalize(text).includes(normalize(customer.name)))
  const matchJob = text => data.jobs.find(job => normalize(text).includes(normalize(job.title)))
  const parseQty = text => Number((normalize(text).match(/\d+/) || [1])[0])
  const looksLikeEmployeeStockAssign = text => {
    const normalized = normalize(text)
    const hasQuantity = /\d+/.test(normalized)
    const hasStockWord = /(stok|stock|envanter|inventory)/i.test(normalized)
    const hasEmployeeWord = /(employee|calisan|çalışan|personele|ustune|üstüne|to )/i.test(normalized)
    const hasAddWord = /(ekle|ver|ata|aktar|assign|add|give|transfer)/i.test(normalized)
    return hasQuantity && hasStockWord && hasEmployeeWord && hasAddWord
  }
  const parseInventoryItems = text => {
    const cleaned = text.replace(/merkez depoya|merkez depo|stoğa|stoga|stok|ekle|adet/gi, ' ').replace(/\s+/g, ' ').trim()
    const matches = [...cleaned.matchAll(/(\d+)\s+([^,\n]+?)(?=\s+\d+\s+|,|$)/gi)]
    return matches.map(match => {
      const productName = match[2].trim()
      const meterUnit = productName.match(/\b\d+\s*m\b/i)?.[0] || null
      return { productName, quantity: Number(match[1]), unit: meterUnit || 'adet', warehouse: 'Merkez Depo', category: '' }
    }).filter(item => item.productName)
  }

  const looksLikeInventoryAdd = text => {
    const normalized = normalize(text)
    const hasQuantity = /\d+/.test(normalized)
    const hasAddWord = /(ekle|artir|artır|add|increase|put|create)/i.test(normalized)
    const hasInventoryWord = /(stok|stock|envanter|inventory|depo|warehouse|merkez|main warehouse|main inventory)/i.test(normalized)
    const isOtherEntity = /(musteri|müşteri|customer|isi |işi |job|calisan|çalışan|employee)/i.test(normalized)
    return hasQuantity && hasAddWord && (hasInventoryWord || /\b(add|ekle)\s+\d+/i.test(normalized)) && !isOtherEntity
  }

  const cleanInventoryName = value => String(value || '')
    .replace(/\b(main warehouse|main inventory|central warehouse|merkez depo|merkez depoya|ana depo)\b/gi, ' ')
    .replace(/\b(to|the|of|for|into|warehouse|inventory|stock|stok|depo|main|central|merkez|ana)\b/gi, ' ')
    .replace(/\b(units?|pieces?|pcs?|adet|tane|quantity|qty|add|added|ekle|eklenecek|eklemek)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[,.;:-]+|[,.;:-]+$/g, '')
    .trim()

  const parseInventoryItemsStrict = text => {
    const cleaned = String(text || '')
      .replace(/\b(main warehouse|main inventory|central warehouse|merkez depoya|merkez depo|ana depo)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const matches = [...cleaned.matchAll(/(\d+)\s*(?:adet|tane|units?|pieces?|pcs?)?\s+([^,\n]+?)(?=\s+(?:ve|and)\s+\d+\s*|\s+\d+\s*(?:adet|tane|units?|pieces?|pcs?)?\s+|,|\n|$)/gi)]
    return matches.map(match => {
      const productName = cleanInventoryName(match[2])
      const meterUnit = productName.match(/\b\d+\s*m\b/i)?.[0] || null
      return { productName, quantity: Number(match[1]), unit: meterUnit || 'adet', warehouse: 'Merkez Depo', category: '' }
    }).filter(item => item.productName)
  }

  function buildInventoryAddResponse(text, product) {
    if (profile.role !== 'admin' || !looksLikeInventoryAdd(text)) return null
    if (product) {
      const qty = parseQty(text)
      return {
        message: `${qty} ${product.unit || 'adet'} ${product.name} ana stoga eklensin mi?`,
        action: { type: 'add_main_stock', productId: product.id, quantity: qty, label: `${product.name} +${qty}` },
      }
    }
    const items = parseInventoryItemsStrict(text)
    if (!items.length) return null
    return {
      message: `${items.map(item => `${item.quantity} ${item.productName}`).join(', ')} merkez depoya eklensin mi?`,
      action: { type: 'add_inventory_products', items, label: items.map(item => `${item.productName} +${item.quantity}`).join(', ') },
    }
  }

  function buildEmployeeStockAssignResponse(text, employee, product) {
    if (profile.role !== 'admin' || !looksLikeEmployeeStockAssign(text) || !employee || !product) return null
    const qty = parseQty(text)
    return {
      message: `${employee.name} uzerine ${qty} ${product.unit || 'adet'} ${product.name} stok aktarilsin mi? Merkez depodan dusecek.`,
      action: {
        type: 'assign_employee_stock',
        employeeId: employee.id,
        productId: product.id,
        quantity: qty,
        label: `${employee.name} -> ${product.name} +${qty}`,
      },
    }
  }

  async function uploadAiPhoto(file) {
    if (!file) return ''
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `ai/${profile.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('fault-photos').upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data: publicData } = supabase.storage.from('fault-photos').getPublicUrl(path)
    return publicData.publicUrl
  }

  async function saveMessage(role, content, imageUrl = '') {
    await supabase.from('ai_messages').insert({ user_id: profile.id, role, content, image_url: imageUrl || null })
  }

  function stockSummaryForEmployee(emp) {
    const rows = data.employeeStocks.filter(x => x.employeeId === emp.id)
    if (!rows.length) return `${emp.name} uzerinde stok gorunmuyor.`
    return `${emp.name} stogu: ${rows.map(row => `${productById(row.productId)?.name || t.product}: ${row.quantity}`).join(', ')}.`
  }

  function buildAiResponse(text) {
    const normalized = normalize(text)
    const qty = parseQty(text)
    const product = matchProduct(text)

    if (profile.role === 'admin') {
      const employee = matchEmployee(text)
      const employeeStockAssign = buildEmployeeStockAssignResponse(text, employee, product)
      if (employeeStockAssign) return employeeStockAssign
      const inventoryAdd = buildInventoryAddResponse(text, product)
      if (inventoryAdd) return inventoryAdd
      if (normalized.includes('musteri') && normalized.includes('ekle')) {
        const cleaned = text.replace(/müşteri|musteri|ekle|oluştur|olustur/gi, ' ').replace(/\s+/g, ' ').trim()
        const name = cleaned || 'Yeni Musteri'
        return {
          message: `${name} musteri olarak eklensin mi?`,
          action: { type: 'add_customer', customerName: name, phone: '', district: '', address: '', label: name },
        }
      }
      if ((normalized.includes('is') || normalized.includes('iş')) && normalized.includes('ekle')) {
        const customer = matchCustomer(text)
        const employee = matchEmployee(text)
        const cleaned = text.replace(/iş|is|ekle|oluştur|olustur|müşteri|musteri|çalışana|calisana|ata|atama/gi, ' ').replace(/\s+/g, ' ').trim()
        const title = cleaned || 'Yeni Is'
        return {
          message: `${title} isi eklensin mi?`,
          action: { type: 'add_job', jobTitle: title, customerId: customer?.id || null, employeeId: employee?.id || null, district: customer?.district || '', status: 'pending', label: title },
        }
      }
      if ((normalized.includes('devret') || normalized.includes('aktar') || normalized.includes('ata')) && (normalized.includes('is') || normalized.includes('iş'))) {
        const job = matchJob(text) || data.jobs.find(x => x.status !== 'completed')
        const employee = matchEmployee(text)
        if (job && employee) {
          return {
            message: `${job.title} isi ${employee.name} uzerine aktarilsin mi?`,
            action: { type: 'transfer_job', jobId: job.id, employeeId: employee.id, label: `${job.title} -> ${employee.name}` },
          }
        }
      }
      if (employee && normalized.includes('stok') && (normalized.includes('goster') || normalized.includes('göster') || normalized.includes('ne var'))) {
        return { message: stockSummaryForEmployee(employee) }
      }
      if (product && normalized.includes('stok') && (normalized.includes('ekle') || normalized.includes('artir') || normalized.includes('artır'))) {
        return {
          message: `${qty} ${product.unit || 'adet'} ${product.name} ana stoga eklensin mi?`,
          action: { type: 'add_main_stock', productId: product.id, quantity: qty, label: `${product.name} +${qty}` },
        }
      }
      if ((normalized.includes('merkez') || normalized.includes('stok')) && normalized.includes('ekle')) {
        const items = parseInventoryItems(text)
        if (items.length) {
          return {
            message: `${items.map(item => `${item.quantity} ${item.productName}`).join(', ')} merkez depoya eklensin mi?`,
            action: { type: 'add_inventory_products', items, label: items.map(item => `${item.productName} +${item.quantity}`).join(', ') },
          }
        }
      }
      if (normalized.includes('kritik')) {
        const critical = data.inventory.filter(x => x.quantity <= x.min)
        return { message: critical.length ? `Kritik stoklar: ${critical.map(x => `${x.name} (${x.quantity})`).join(', ')}.` : 'Kritik stok yok.' }
      }
    }

    if (profile.role === 'employee') {
      const myStocks = data.employeeStocks.filter(x => x.employeeId === profile.id)
      if (normalized.includes('stok') && (normalized.includes('goster') || normalized.includes('göster') || normalized.includes('ne var'))) {
        return { message: myStocks.length ? `Uzerindeki stok: ${myStocks.map(row => `${productById(row.productId)?.name || t.product}: ${row.quantity}`).join(', ')}.` : 'Uzerinde stok gorunmuyor.' }
      }
      if (normalized.includes('son') && normalized.includes('is') && (normalized.includes('kapat') || normalized.includes('tamamla'))) {
        const job = data.jobs.find(x => x.employeeId === profile.id && x.status !== 'completed')
        const stock = product ? myStocks.find(x => x.productId === product.id) : null
        return {
          message: job ? `${job.title} isi kapatilsin mi${stock ? ` ve ${qty} ${product.name} stoktan dusulsun mu` : ''}?` : 'Uzerine atanmis aktif is bulamadim.',
          action: job ? { type: 'close_my_job', jobId: job.id, productId: stock?.productId || null, quantity: stock ? qty : 0, label: job.title } : null,
        }
      }
    }

    const activeJobs = data.jobs.filter(x => x.status !== 'completed').length
    const critical = data.inventory.filter(x => x.quantity <= x.min).map(x => x.name).join(', ') || '-'
    return { message: `Ozet: ${activeJobs} aktif is var. Kritik stok: ${critical}. Komut ornekleri: "15 kamera stok ekle", "Mehmetin stokunu goster", "son isi kapat ve 1 kamera dus".` }
  }

  async function askRealAi(text, imageUrl = '') {
    const projectRef = new URL(process.env.REACT_APP_SUPABASE_URL).hostname.split('.')[0]
    const body = {
      message: text,
      imageUrl,
      role: profile.role,
      profile,
      inventory: data.inventory,
      employees: data.employees,
      employeeStocks: data.employeeStocks,
      jobs: data.jobs,
      customers: data.customers,
    }
    const errors = []

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('ai-chat', { body })
      if (!fnError && fnData?.message) return fnData
      if (fnError) errors.push(fnError.message || String(fnError))
    } catch (err) {
      errors.push(err.message)
    }

    for (const url of [`https://${projectRef}.functions.supabase.co/ai-chat`, `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/ai-chat`]) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify(body),
        })
        const raw = await response.text()
        let parsed
        try {
          parsed = JSON.parse(raw)
        } catch {
          parsed = { message: raw, action: null }
        }
        if (response.ok) return parsed
        errors.push(`${url}: ${parsed.message || raw || response.status}`)
      } catch (err) {
        errors.push(`${url}: ${err.message}`)
      }
    }

    throw new Error(errors.join(' | '))
  }

  async function send() {
    if (!input.trim() && !photoFile) return
    setChatError('')
    const text = input
    const imageUrl = await uploadAiPhoto(photoFile)
    setInput('')
    setPhotoFile(null)
    await saveMessage('user', text || t.jobPhoto, imageUrl)
    let response
    try {
      const localAction = buildEmployeeStockAssignResponse(text, matchEmployee(text), matchProduct(text)) || buildInventoryAddResponse(text, matchProduct(text))
      response = localAction || await askRealAi(text || 'Bu fotografi incele.', imageUrl)
      if (!response.action) response = buildEmployeeStockAssignResponse(text, matchEmployee(text), matchProduct(text)) || buildInventoryAddResponse(text, matchProduct(text)) || response
    } catch (err) {
      response = buildAiResponse(text)
      response.message = `${response.message}\n\nAI API baglantisi henuz aktif degil: ${errorMessage(err)}`
    }
    await saveMessage('assistant', response.message)
    setPendingAction(response.action || null)
    await reload()
  }

  async function approveAction() {
    setChatError('')
    try {
      await approvePendingAction()
    } catch (err) {
      setChatError(errorMessage(err))
    }
  }

  async function approvePendingAction() {
    if (!pendingAction) return
    let focusEmployeeStockId = ''
    if (pendingAction.type === 'add_main_stock') {
      const product = data.inventory.find(x => x.id === pendingAction.productId)
      if (!product) return
      await supabase.from('inventory_items').update({ quantity: Number(product.quantity) + pendingAction.quantity, updated_at: new Date().toISOString() }).eq('id', product.id)
      await supabase.from('stock_movements').insert({ item_id: product.id, movement_type: 'main_in', quantity: pendingAction.quantity, note: 'AI approved main stock add' })
      await saveMessage('assistant', `${product.name} ana stoga ${pendingAction.quantity} adet eklendi.`)
    }
    if (pendingAction.type === 'add_inventory_products') {
      const items = pendingAction.items || []
      for (const item of items) {
        const existing = data.inventory.find(x => normalize(x.name) === normalize(item.productName))
        if (existing) {
          await supabase.from('inventory_items').update({
            quantity: Number(existing.quantity) + Number(item.quantity || 0),
            updated_at: new Date().toISOString(),
          }).eq('id', existing.id)
          await supabase.from('stock_movements').insert({ item_id: existing.id, movement_type: 'main_in', quantity: Number(item.quantity || 0), note: 'AI approved inventory add' })
        } else {
          const { data: created, error: createError } = await supabase.from('inventory_items').insert({
            name: item.productName,
            category: item.category || '',
            warehouse: item.warehouse || 'Merkez Depo',
            quantity: Number(item.quantity || 0),
            min_quantity: 2,
            unit: item.unit || 'adet',
          }).select('id').single()
          if (createError) throw createError
          await supabase.from('stock_movements').insert({ item_id: created.id, movement_type: 'main_in', quantity: Number(item.quantity || 0), note: 'AI created inventory item' })
        }
      }
      await saveMessage('assistant', `${items.map(item => `${item.productName} (${item.quantity})`).join(', ')} merkez depoya eklendi.`)
    }
    if (pendingAction.type === 'assign_employee_stock') {
      const product = data.inventory.find(x => x.id === pendingAction.productId)
      const employee = data.employees.find(x => x.id === pendingAction.employeeId)
      if (!product || !employee) return
      const { error: assignError } = await supabase.rpc('assign_stock_to_employee', {
        p_employee_id: employee.id,
        p_item_id: product.id,
        p_quantity: Number(pendingAction.quantity || 0),
        p_note: 'AI approved employee stock assign',
      })
      if (assignError) throw assignError
      focusEmployeeStockId = employee.id
      await saveMessage('assistant', `${employee.name} uzerine ${pendingAction.quantity} ${product.name} stok aktarildi.`)
    }
    if (pendingAction.type === 'add_customer') {
      const customerName = pendingAction.customerName || pendingAction.label
      if (!customerName) return
      const { error: customerError } = await supabase.from('customers').insert({
        name: customerName,
        phone: pendingAction.phone || null,
        district: pendingAction.district || null,
        address: pendingAction.address || null,
      })
      if (customerError) throw customerError
      await saveMessage('assistant', `${customerName} musteri olarak eklendi.`)
    }
    if (pendingAction.type === 'add_job') {
      const title = pendingAction.jobTitle || pendingAction.label
      if (!title) return
      const { error: jobError } = await supabase.from('jobs').insert({
        title,
        customer_id: pendingAction.customerId || null,
        assigned_employee_id: pendingAction.employeeId || null,
        district: pendingAction.district || null,
        status: pendingAction.status || 'pending',
        category: 'other',
      })
      if (jobError) throw jobError
      await saveMessage('assistant', `${title} isi eklendi.`)
    }
    if (pendingAction.type === 'transfer_job') {
      if (!pendingAction.jobId || !pendingAction.employeeId) return
      const { error: transferError } = await supabase.from('jobs').update({
        assigned_employee_id: pendingAction.employeeId,
        updated_at: new Date().toISOString(),
      }).eq('id', pendingAction.jobId)
      if (transferError) throw transferError
      await saveMessage('assistant', `Is ${employeeById(pendingAction.employeeId)?.name || 'calisana'} aktarildi.`)
    }
    if (pendingAction.type === 'close_my_job') {
      await supabase.rpc('complete_job_with_stock', {
        p_job_id: pendingAction.jobId,
        p_item_id: pendingAction.productId,
        p_quantity: pendingAction.quantity,
        p_note: 'AI approved job close',
      })
      await saveMessage('assistant', 'Is kapatildi.')
    }
    setPendingAction(null)
    await reload()
    if (focusEmployeeStockId) {
      localStorage.setItem('techfield_focus_employee_stock_id', focusEmployeeStockId)
      localStorage.setItem('techfield_employee_stock_selected_id', focusEmployeeStockId)
      onShowEmployeeStock?.()
    }
  }

  function rejectAction() {
    setPendingAction(null)
  }

  async function clearHistory() {
    if (!window.confirm(t.clearHistory + '?')) return
    setChatError('')
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userIds = [...new Set([profile.id, userData?.user?.id].filter(Boolean))]
      const { data: rowsBefore, error: selectError } = await supabase.from('ai_messages').select('id').in('user_id', userIds)
      if (selectError) throw selectError
      if (!rowsBefore?.length) {
        setPendingAction(null)
        await reload()
        return
      }
      const { data: deletedRows, error: deleteError } = await supabase.from('ai_messages').delete().in('user_id', userIds).select('id')
      if (deleteError) throw deleteError
      if ((deletedRows || []).length === 0) {
        throw new Error('Supabase RLS delete policy eksik. supabase_next_changes.sql icindeki ai_messages_delete_self policy kodunu SQL Editor’da calistir.')
      }
      setPendingAction(null)
      await reload()
    } catch (err) {
      setChatError(errorMessage(err))
    }
  }

  return <><Header title={t.ai} /><div className="page-body chat-layout"><div className="chat-toolbar"><button className="btn btn-compact" onClick={clearHistory}>{t.clearHistory}</button></div>{chatError && <div className="inline-error">{chatError}</div>}<div className="card chat-box">{data.chat.map((m, i) => <div key={m.id || i} className={`chat-msg ${m.role}`}>{m.imageUrl && <a href={m.imageUrl} target="_blank" rel="noreferrer"><img className="chat-image" src={m.imageUrl} alt={t.jobPhoto} /></a>}<div>{m.text}</div></div>)}{pendingAction && <div className="ai-action-card"><div><strong>{t.aiActionReady}</strong><span>{pendingAction.label}</span></div><div className="gap-8"><button className="btn btn-primary btn-compact" onClick={approveAction}>{t.approve}</button><button className="btn btn-compact" onClick={rejectAction}>{t.reject}</button></div></div>}</div><div className="chat-input ai-chat-input"><input className="form-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder={t.askAi} /><input className="form-input" type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} /><button className="btn btn-primary" onClick={send}>{t.send}</button></div></div></>
}

function StockTable({ t, rows, product, onDelete, onSale }) {
  return <><div className="card-title">{t.currentStocks}</div><Table headers={[t.product, t.quantity, t.date, t.sale]}>{rows.map(row => <tr key={row.id}><td>{product(row.productId).name}</td><td>{row.quantity} {product(row.productId).unit}</td><td>{new Date(row.updatedAt).toLocaleString('tr-TR')}</td><td><div className="gap-8"><button className="btn btn-compact" onClick={() => onSale(row)}>{t.sale}</button><button className="btn btn-danger btn-compact" onClick={() => onDelete(row)}>{t.delete}</button></div></td></tr>)}</Table></>
}

function HistoryTable({ t, title, rows, product, mode }) {
  return <><hr className="soft-separator" /><div className="card-title">{title}</div><Table headers={[...(mode === 'movement' ? [t.type] : []), t.product, t.customer, t.quantity, ...(mode === 'sale' ? [t.unitPrice, t.total] : []), ...(mode === 'customerStock' ? [] : [t.note]), t.date]}>{rows.map(row => <tr key={row.id}>{mode === 'movement' && <td><span className={`badge ${row.type === 'employee_in' || row.type === 'main_in' ? 'badge-green' : row.type === 'sale' ? 'badge-red' : 'badge-gray'}`}>{row.type}</span></td>}<td>{product(row.productId).name}</td><td>{row.customer || '-'}</td><td>{row.quantity}</td>{mode === 'sale' && <><td>{money(row.price)}</td><td>{money(row.price * row.quantity)}</td></>}{mode !== 'customerStock' && <td>{row.note || '-'}</td>}<td>{new Date(row.date || row.updatedAt).toLocaleString('tr-TR')}</td></tr>)}</Table></>
}

function Header({ title }) { return <div className="page-header"><div className="page-title">{title}</div></div> }
function Metric({ icon: Icon, label, value, sub, warn }) { return <div className="metric-card"><Icon className="metric-icon" /><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className={`metric-sub ${warn ? 'warn' : 'up'}`}>{sub}</div></div> }
function Field({ label, value, onChange, type = 'text', placeholder = '' }) { return <div className="form-group"><label className="form-label">{label}</label><input className="form-input" type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} /></div> }
function Select({ label, value, onChange, options }) { return <div className="form-group"><label className="form-label">{label}</label><select className="form-input" value={value || ''} onChange={e => onChange(e.target.value)}>{options.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div> }
function Table({ headers, children }) { const rows = Array.isArray(children) ? children.filter(Boolean) : [children].filter(Boolean); return <div className="table-wrap"><table><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.length ? rows : <tr><td colSpan={headers.length} className="table-empty">Kayit yok.</td></tr>}</tbody></table></div> }
