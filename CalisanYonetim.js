import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const BOS_FORM = {
  ad: '',
  email: '',
  telefon: '',
  rol: 'calisan',
  aktif: true,
}

const BOS_STOK_FORM = {
  id: null,
  stok_id: '',
  adet: 1,
  aciklama: '',
}

export default function CalisanYonetim() {
  const [calisanlar, setCalisanlar] = useState([])
  const [secili, setSecili] = useState(null)
  const [form, setForm] = useState(BOS_FORM)
  const [stokForm, setStokForm] = useState(BOS_STOK_FORM)
  const [stoklar, setStoklar] = useState([])
  const [tumStoklar, setTumStoklar] = useState([])
  const [musteriler, setMusteriler] = useState([])
  const [satislar, setSatislar] = useState([])
  const [hareketler, setHareketler] = useState([])
  const [loading, setLoading] = useState(true)
  const [mesaj, setMesaj] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setMesaj('')

    const [calisanRes, stokRes, musteriRes] = await Promise.all([
      supabase.from('profiles').select('*').order('ad'),
      supabase.from('stok').select('*').order('urun_adi'),
      supabase.from('musteriler').select('*').order('ad'),
    ])

    if (calisanRes.error) setMesaj(calisanRes.error.message)
    if (stokRes.error) console.log(stokRes.error.message)
    if (musteriRes.error) console.log(musteriRes.error.message)

    setCalisanlar(calisanRes.data || [])
    setTumStoklar(stokRes.data || [])
    setMusteriler(musteriRes.data || [])
    setLoading(false)
  }

  async function calisanSec(c) {
    setSecili(c)
    setForm({
      ad: c.ad || '',
      email: c.email || '',
      telefon: c.telefon || '',
      rol: c.rol || 'calisan',
      aktif: c.aktif ?? true,
    })
    setStokForm(BOS_STOK_FORM)

    await Promise.all([
      calisanStoklariniGetir(c.id),
      calisanSatislariniGetir(c.id),
      calisanHareketleriniGetir(c.id),
    ])
  }

  async function seciliBilgileriYenile(calisanId = secili?.id) {
    if (!calisanId) return

    await Promise.all([
      calisanStoklariniGetir(calisanId),
      calisanSatislariniGetir(calisanId),
      calisanHareketleriniGetir(calisanId),
    ])
  }

  async function calisanGuncelle() {
    if (!secili) return
    setMesaj('')

    const { error } = await supabase
      .from('profiles')
      .update({
        ad: form.ad,
        email: form.email,
        telefon: form.telefon,
        rol: form.rol,
        aktif: form.aktif,
      })
      .eq('id', secili.id)

    if (error) {
      setMesaj(error.message)
      return
    }

    setMesaj('Çalışan bilgileri güncellendi.')
    await load()
    setSecili({ ...secili, ...form })
  }

  async function calisanSil(c) {
    if (!window.confirm(`${c.ad || 'Bu çalışan'} silinsin mi? Bu işlem çalışan profilini ve üzerindeki stok kayıtlarını kaldırır.`)) return

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', c.id)

    if (error) {
      setMesaj(error.message)
      return
    }

    if (secili?.id === c.id) {
      setSecili(null)
      setForm(BOS_FORM)
      setStoklar([])
      setSatislar([])
      setHareketler([])
    }

    setMesaj('Çalışan silindi.')
    await load()
  }

  async function sifreSifirlamaMailiGonder() {
    if (!form.email) {
      setMesaj('Bu çalışanın e-posta bilgisi yok.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(form.email)

    if (error) {
      setMesaj(error.message)
      return
    }

    setMesaj('Şifre sıfırlama maili gönderildi.')
  }

  async function calisanStoklariniGetir(calisanId) {
    const { data, error } = await supabase
      .from('calisan_stoklari')
      .select(`
        id,
        adet,
        guncelleme_tarihi,
        stok:stok_id (
          id,
          urun_adi,
          kategori,
          birim,
          miktar
        )
      `)
      .eq('calisan_id', calisanId)
      .order('guncelleme_tarihi', { ascending: false })

    if (error) {
      console.log(error.message)
      setStoklar([])
      return
    }

    setStoklar(data || [])
  }

  async function calisanSatislariniGetir(calisanId) {
    const { data, error } = await supabase
      .from('satislar')
      .select(`
        id,
        adet,
        fiyat,
        toplam,
        satis_tarihi,
        stok:stok_id (
          id,
          urun_adi,
          kategori
        ),
        musteri:musteri_id (
          id,
          ad,
          telefon
        )
      `)
      .eq('calisan_id', calisanId)
      .order('satis_tarihi', { ascending: false })
      .limit(20)

    if (error) {
      console.log(error.message)
      setSatislar([])
      return
    }

    setSatislar(data || [])
  }

  async function calisanHareketleriniGetir(calisanId) {
    const { data, error } = await supabase
      .from('calisan_stok_hareketleri')
      .select(`
        id,
        tip,
        adet,
        aciklama,
        olusturma_tarihi,
        stok:stok_id (
          id,
          urun_adi,
          kategori,
          birim
        ),
        musteri:musteri_id (
          id,
          ad,
          telefon
        )
      `)
      .eq('calisan_id', calisanId)
      .order('olusturma_tarihi', { ascending: false })
      .limit(30)

    if (error) {
      console.log(error.message)
      setHareketler([])
      return
    }

    setHareketler(data || [])
  }

  async function aktiflikDegistir(c) {
    const { error } = await supabase
      .from('profiles')
      .update({ aktif: !c.aktif })
      .eq('id', c.id)

    if (error) {
      setMesaj(error.message)
      return
    }

    await load()
  }

  async function calisanaStokKaydet() {
    if (!secili) return
    if (!stokForm.stok_id) {
      setMesaj('Lütfen ürün seç.')
      return
    }

    const adet = Number(stokForm.adet)
    if (!adet || adet < 0) {
      setMesaj('Adet 0 veya daha büyük olmalı.')
      return
    }

    setMesaj('')

    if (stokForm.id) {
      const eskiKayit = stoklar.find(s => s.id === stokForm.id)
      const eskiAdet = Number(eskiKayit?.adet || 0)
      const fark = adet - eskiAdet

      const { error } = await supabase
        .from('calisan_stoklari')
        .update({
          stok_id: stokForm.stok_id,
          adet,
          guncelleme_tarihi: new Date().toISOString(),
        })
        .eq('id', stokForm.id)

      if (error) {
        setMesaj(error.message)
        return
      }

      await stokHareketiEkle({
        tip: fark >= 0 ? 'giris' : 'cikis',
        stokId: stokForm.stok_id,
        adet: Math.abs(fark),
        aciklama: stokForm.aciklama || 'Çalışan stok adedi düzenlendi',
      })

      setMesaj('Çalışan stoku güncellendi.')
    } else {
      const mevcut = stoklar.find(s => s.stok?.id === stokForm.stok_id)

      if (mevcut) {
        const yeniAdet = Number(mevcut.adet || 0) + adet
        const { error } = await supabase
          .from('calisan_stoklari')
          .update({
            adet: yeniAdet,
            guncelleme_tarihi: new Date().toISOString(),
          })
          .eq('id', mevcut.id)

        if (error) {
          setMesaj(error.message)
          return
        }
      } else {
        const { error } = await supabase
          .from('calisan_stoklari')
          .insert({
            calisan_id: secili.id,
            stok_id: stokForm.stok_id,
            adet,
          })

        if (error) {
          setMesaj(error.message)
          return
        }
      }

      await stokHareketiEkle({
        tip: 'giris',
        stokId: stokForm.stok_id,
        adet,
        aciklama: stokForm.aciklama || 'Çalışana stok eklendi',
      })

      setMesaj('Çalışanın üzerine stok eklendi.')
    }

    setStokForm(BOS_STOK_FORM)
    await seciliBilgileriYenile()
  }

  async function stokHareketiEkle({ tip, stokId, adet, musteriId = null, aciklama = '' }) {
    if (!secili || !adet) return

    const { error } = await supabase
      .from('calisan_stok_hareketleri')
      .insert({
        calisan_id: secili.id,
        stok_id: stokId,
        musteri_id: musteriId || null,
        tip,
        adet,
        aciklama,
      })

    if (error) console.log(error.message)
  }

  function stokDuzenle(s) {
    setStokForm({
      id: s.id,
      stok_id: s.stok?.id || '',
      adet: s.adet || 0,
      aciklama: '',
    })
  }

  async function calisanStokSil(s) {
    if (!window.confirm(`${s.stok?.urun_adi || 'Ürün'} çalışanın üzerinden silinsin mi?`)) return

    const { error } = await supabase
      .from('calisan_stoklari')
      .delete()
      .eq('id', s.id)

    if (error) {
      setMesaj(error.message)
      return
    }

    await stokHareketiEkle({
      tip: 'cikis',
      stokId: s.stok?.id,
      adet: Number(s.adet || 0),
      aciklama: 'Çalışanın üzerindeki stok silindi',
    })

    setMesaj('Çalışanın üzerindeki stok silindi.')
    await seciliBilgileriYenile()
  }

  async function hizliSatisYap(s) {
    const musteri_id = window.prompt('Müşteri ID gir veya boş bırak:')
    const adetText = window.prompt('Satılan adet:', '1')
    const fiyatText = window.prompt('Birim fiyat:', '0')
    const adet = Number(adetText)
    const fiyat = Number(fiyatText || 0)

    if (!adet || adet <= 0) return
    if (adet > Number(s.adet || 0)) {
      setMesaj('Satılan adet çalışanın üzerindeki stoktan fazla olamaz.')
      return
    }

    const kalan = Number(s.adet || 0) - adet

    const { error: stokError } = await supabase
      .from('calisan_stoklari')
      .update({ adet: kalan, guncelleme_tarihi: new Date().toISOString() })
      .eq('id', s.id)

    if (stokError) {
      setMesaj(stokError.message)
      return
    }

    const temizMusteriId = musteri_id && musteri_id.trim() ? musteri_id.trim() : null

    const { error: satisError } = await supabase
      .from('satislar')
      .insert({
        calisan_id: secili.id,
        musteri_id: temizMusteriId,
        stok_id: s.stok?.id,
        adet,
        fiyat,
      })

    if (satisError) console.log(satisError.message)

    await stokHareketiEkle({
      tip: 'satis',
      stokId: s.stok?.id,
      musteriId: temizMusteriId,
      adet,
      aciklama: 'Çalışan üzerinden hızlı satış yapıldı',
    })

    setMesaj('Satış kaydedildi ve çalışanın stoku düşüldü.')
    await seciliBilgileriYenile()
  }

  function musteriAdiBul(id) {
    return musteriler.find(m => m.id === id)?.ad || '—'
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Çalışan Yönetimi</div>
      </div>

      <div className="page-body">
        {mesaj && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '10px 12px',
              background: '#F4F6F8',
              border: '1px solid #E1E4E8',
              borderRadius: 8,
              fontSize: 13,
              color: '#333',
            }}
          >
            {mesaj}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
          <div className="card">
            <div className="card-title">Çalışanlar</div>

            {loading ? (
              <p style={{ color: '#999', fontSize: 13 }}>Yükleniyor...</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ad</th>
                      <th>E-posta</th>
                      <th>Rol</th>
                      <th>Durum</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calisanlar.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 500 }}>{c.ad}</td>
                        <td>{c.email || '—'}</td>
                        <td>{c.rol}</td>
                        <td>
                          <span className={`badge ${c.aktif ? 'badge-green' : 'badge-gray'}`}>
                            {c.aktif ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td>
                          <div className="gap-8" style={{ flexWrap: 'wrap' }}>
                            <button
                              className="btn"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              onClick={() => calisanSec(c)}
                            >
                              Düzenle
                            </button>

                            <button
                              className={`btn ${c.aktif ? 'btn-danger' : ''}`}
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              onClick={() => aktiflikDegistir(c)}
                            >
                              {c.aktif ? 'Pasif Yap' : 'Aktif Yap'}
                            </button>

                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              onClick={() => calisanSil(c)}
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {calisanlar.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                          Çalışan bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            {!secili ? (
              <p style={{ color: '#999', fontSize: 13 }}>Soldan bir çalışan seç.</p>
            ) : (
              <>
                <div className="card-title">Çalışan Bilgilerini Düzenle</div>

                <div className="form-group">
                  <label className="form-label">Ad Soyad</label>
                  <input
                    className="form-input"
                    value={form.ad}
                    onChange={e => setForm({ ...form, ad: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">E-posta</label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    className="form-input"
                    value={form.telefon}
                    onChange={e => setForm({ ...form, telefon: e.target.value })}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-input"
                      value={form.rol}
                      onChange={e => setForm({ ...form, rol: e.target.value })}
                    >
                      <option value="calisan">Çalışan</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Durum</label>
                    <select
                      className="form-input"
                      value={form.aktif ? 'aktif' : 'pasif'}
                      onChange={e => setForm({ ...form, aktif: e.target.value === 'aktif' })}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="pasif">Pasif</option>
                    </select>
                  </div>
                </div>

                <div className="gap-8" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={calisanGuncelle}>
                    Bilgileri Güncelle
                  </button>

                  <button className="btn" onClick={sifreSifirlamaMailiGonder}>
                    Şifre Sıfırlama Maili Gönder
                  </button>

                  <button className="btn btn-danger" onClick={() => calisanSil(secili)}>
                    Çalışanı Sil
                  </button>
                </div>

                <hr style={{ margin: '1.5rem 0', border: 0, borderTop: '1px solid #eee' }} />

                <div className="card-title">Çalışanın Üzerine Stok Ekle / Düzenle</div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Ürün</label>
                    <select
                      className="form-input"
                      value={stokForm.stok_id}
                      onChange={e => setStokForm({ ...stokForm, stok_id: e.target.value })}
                    >
                      <option value="">Ürün seç</option>
                      {tumStoklar.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.urun_adi} - Ana stok: {s.miktar} {s.birim}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Adet</label>
                    <input
                      className="form-input"
                      type="number"
                      min="0"
                      value={stokForm.adet}
                      onChange={e => setStokForm({ ...stokForm, adet: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Açıklama</label>
                  <input
                    className="form-input"
                    value={stokForm.aciklama}
                    onChange={e => setStokForm({ ...stokForm, aciklama: e.target.value })}
                    placeholder="Örn: Montaj için teslim edildi"
                  />
                </div>

                <div className="gap-8" style={{ marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={calisanaStokKaydet}>
                    {stokForm.id ? 'Stoku Güncelle' : '+ Çalışana Stok Ekle'}
                  </button>
                  {stokForm.id && (
                    <button className="btn" onClick={() => setStokForm(BOS_STOK_FORM)}>
                      Vazgeç
                    </button>
                  )}
                </div>

                <div className="card-title">Çalışanın Üzerindeki Stoklar</div>

                {stoklar.length === 0 ? (
                  <p style={{ color: '#999', fontSize: 13 }}>Bu çalışanın üzerinde stok yok.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Ürün</th>
                          <th>Kategori</th>
                          <th>Adet</th>
                          <th>Birim</th>
                          <th>Güncelleme</th>
                          <th>İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stoklar.map(s => (
                          <tr key={s.id}>
                            <td>{s.stok?.urun_adi || '—'}</td>
                            <td>{s.stok?.kategori || '—'}</td>
                            <td style={{ fontWeight: 600 }}>{s.adet}</td>
                            <td>{s.stok?.birim || '—'}</td>
                            <td>{s.guncelleme_tarihi ? new Date(s.guncelleme_tarihi).toLocaleString('tr-TR') : '—'}</td>
                            <td>
                              <div className="gap-8" style={{ flexWrap: 'wrap' }}>
                                <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => stokDuzenle(s)}>
                                  Düzenle
                                </button>
                                <button className="btn" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => hizliSatisYap(s)}>
                                  Satış Yap
                                </button>
                                <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => calisanStokSil(s)}>
                                  Sil
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <hr style={{ margin: '1.5rem 0', border: 0, borderTop: '1px solid #eee' }} />

                <div className="card-title">En Son Stok Giriş / Çıkış / Satış Hareketleri</div>

                {hareketler.length === 0 ? (
                  <p style={{ color: '#999', fontSize: 13 }}>Stok hareketi yok.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Tip</th>
                          <th>Ürün</th>
                          <th>Müşteri</th>
                          <th>Adet</th>
                          <th>Açıklama</th>
                          <th>Tarih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hareketler.map(h => (
                          <tr key={h.id}>
                            <td>
                              <span className={`badge ${h.tip === 'giris' ? 'badge-green' : h.tip === 'satis' ? 'badge-red' : 'badge-gray'}`}>
                                {h.tip === 'giris' ? 'Giriş' : h.tip === 'satis' ? 'Satış' : 'Çıkış'}
                              </span>
                            </td>
                            <td>{h.stok?.urun_adi || '—'}</td>
                            <td>{h.musteri?.ad || musteriAdiBul(h.musteri_id)}</td>
                            <td>{h.adet} {h.stok?.birim || ''}</td>
                            <td>{h.aciklama || '—'}</td>
                            <td>{h.olusturma_tarihi ? new Date(h.olusturma_tarihi).toLocaleString('tr-TR') : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <hr style={{ margin: '1.5rem 0', border: 0, borderTop: '1px solid #eee' }} />

                <div className="card-title">En Son Kime / Ne Sattı?</div>

                {satislar.length === 0 ? (
                  <p style={{ color: '#999', fontSize: 13 }}>Satış kaydı yok.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Ürün</th>
                          <th>Müşteri</th>
                          <th>Telefon</th>
                          <th>Adet</th>
                          <th>Fiyat</th>
                          <th>Toplam</th>
                          <th>Tarih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {satislar.map(s => (
                          <tr key={s.id}>
                            <td>{s.stok?.urun_adi || '—'}</td>
                            <td>{s.musteri?.ad || '—'}</td>
                            <td>{s.musteri?.telefon || '—'}</td>
                            <td>{s.adet}</td>
                            <td>{s.fiyat || 0}</td>
                            <td>{s.toplam || 0}</td>
                            <td>
                              {s.satis_tarihi
                                ? new Date(s.satis_tarihi).toLocaleString('tr-TR')
                                : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
