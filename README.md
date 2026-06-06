# TechField — Saha Teknik Servis Yönetim Sistemi

Güvenlik kameraları, uydu anten, internet altyapısı ve IT işleri için saha yönetim uygulaması.

## Özellikler

- Dashboard: bugünkü işler, tamamlanma oranı ve kritik stok görünümü
- İş Emirleri: CRUD, durum takibi, öncelik, arama ve filtreleme
- Müşteri Yönetimi
- Stok Takibi: kritik stok uyarıları
- Çalışan Paneli: personele atanmış işler ve konum paylaşımı
- AI Asistan: rota, mesaj ve analiz desteği

## Kurulum

### 1. Supabase Kurulumu

1. [supabase.com](https://supabase.com) üzerinden yeni proje oluştur.
2. SQL Editor'a gir, `supabase_schema.sql` dosyasının içeriğini yapıştır ve çalıştır.
3. Project Settings > API bölümünden URL ve anon key değerlerini kopyala.

### 2. Proje Kurulumu

```bash
npm install
npm start
```

Gerekli ortam değişkenleri:

```bash
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

### 3. Production Build

```bash
npm run build
```

## Teknoloji

- React 18
- React Router v6
- Supabase
- lucide-react
- date-fns

## AI Asistan Örnek Komutları

- "Bugünkü işlerimi özetle"
- "En verimli iş rotasını çıkar"
- "Ahmet Bey'e kurulum tamamlandı mesajı yaz"
- "Kritik stokları listele, sipariş öner"
- "Hikvision kamera görüntü gelmiyor, ne yapmalıyım?"
