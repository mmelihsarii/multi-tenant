# ePOS CRM - Randevu Yönetim Sistemi

Berber, kuaför ve spa işletmeleri için modern randevu yönetim sistemi.

## Özellikler

- Randevu oluşturma, düzenleme ve takibi
- Personel yönetimi
- Hizmet kataloğu
- Müşteriler için public booking linki
- Dashboard ve istatistikler
- Multi-tenant mimari (her işletme kendi verileri)

## Teknolojiler

- **Frontend:** React 19, Vite, TailwindCSS
- **State Management:** Zustand
- **Form:** React Hook Form + Yup
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Routing:** React Router v7

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
# Supabase bilgilerini .env'ye ekle

# Geliştirme sunucusunu başlat
npm run dev
```

## Proje Yapısı

```
src/
├── components/     # Reusable components
├── pages/          # Sayfa bileşenleri
├── stores/         # Zustand state management
├── utils/          # Helper fonksiyonlar
├── hooks/          # Custom hooks
└── constants/      # Sabitler
```

## Öğrendiklerim

Bu projeyi geliştirirken:
- Multi-tenant mimari tasarımı
- Supabase ile backend entegrasyonu
- State management (Zustand)
- Form validation ve error handling
- Performance optimization (code splitting, lazy loading)
- Security best practices (XSS koruması, input sanitization)

konularında deneyim kazandım.

## Lisans

MIT
