# 🚀 Vercel Deployment Rehberi - Spor Ötesi

Bu rehber, uygulamanızı Vercel'e başarıyla deploy etmeniz için adım adım talimatlar içerir.

## 📋 Ön Gereksinimler

- GitHub hesabı
- Vercel hesabı (GitHub ile bağlantılı)
- Emergent'te çalışan backend API

## ⚙️ Adım 1: GitHub'a Push

Kodunuzu GitHub'a pushlayın:
```bash
git add .
git commit -m "Production ready"
git push origin main
```

## 🔧 Adım 2: Vercel'de Proje Oluşturma

### 2.1 Vercel Dashboard
1. [vercel.com](https://vercel.com) adresine gidin
2. "Add New" → "Project" seçin
3. GitHub repository'nizi seçin

### 2.2 Build Ayarları
```
Framework Preset: Create React App
Root Directory: frontend
Build Command: yarn build
Output Directory: build
Install Command: yarn install
```

**ÖNEMLİ:** `.npmrc` dosyası root'ta olduğu için `legacy-peer-deps=true` ayarı otomatik uygulanacak.

## 🔐 Adım 3: Environment Variables (Kritik!)

Vercel dashboard'da Project Settings → Environment Variables bölümüne gidin ve aşağıdaki değişkenleri ekleyin:

### Frontend Environment Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `REACT_APP_BACKEND_URL` | `https://sportgram.preview.emergentagent.com` | Backend API URL'i |
| `REACT_APP_FIREBASE_API_KEY` | `AIzaSyBzqEYs6V5oM2RLi1vOorMwgKDoOvqMmnI` | Firebase API Key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | `sporotesi-a4ee9.firebaseapp.com` | Firebase Auth Domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | `sporotesi-a4ee9` | Firebase Project ID |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | `sporotesi-a4ee9.firebasestorage.app` | Firebase Storage |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | `715719411524` | Firebase Messaging ID |
| `REACT_APP_FIREBASE_APP_ID` | `1:715719411524:web:ead6e98b58bf6c27bff911` | Firebase App ID |

**Not:** Her değişkeni Production, Preview ve Development environment'larda da aktif edin!

## 🎯 Adım 4: Deploy

1. Tüm ayarları kaydedin
2. "Deploy" butonuna tıklayın
3. Build loglarını izleyin (2-3 dakika sürer)
4. Deploy tamamlandığında verilen URL'i açın

## ✅ Adım 5: Doğrulama Checklist

Deploy sonrası şunları kontrol edin:

- [ ] Sayfa açılıyor mu?
- [ ] Logo görünüyor mu?
- [ ] Navbar'da 5 buton var mı? (Ana Sayfa, Sosyal, Takip, Yoga, Bağış)
- [ ] Google ile giriş yapabiliyor musunuz?
- [ ] Sosyal feed yükleniyor mu?
- [ ] AI koçlar çalışıyor mu?
- [ ] Yoga programı oluşturabiliyor musunuz?
- [ ] Console'da error var mı? (F12)

## 🐛 Yaygın Sorunlar ve Çözümleri

### Sorun 1: Beyaz Ekran / Blank Page
**Sebep:** Environment variables eksik veya yanlış
**Çözüm:**
1. Vercel Dashboard → Project Settings → Environment Variables kontrol edin
2. Tüm `REACT_APP_*` değişkenleri eklendi mi?
3. "Redeploy" yapın

### Sorun 2: Firebase Giriş Çalışmıyor
**Sebep:** Firebase console'da Vercel domain'i authorized değil
**Çözüm:**
1. [Firebase Console](https://console.firebase.google.com) → Authentication → Settings
2. Authorized domains'e Vercel URL'inizi ekleyin (örn: `your-app.vercel.app`)

### Sorun 3: API Çağrıları Başarısız
**Sebep:** Backend URL yanlış veya backend çalışmıyor
**Çözüm:**
1. `REACT_APP_BACKEND_URL` değişkenini kontrol edin
2. Backend'in Emergent'te çalıştığından emin olun
3. CORS ayarlarını kontrol edin

### Sorun 4: Build Failed - Dependency Error
**Sebep:** Peer dependency çakışması
**Çözüm:**
- `.npmrc` dosyası root'ta olduğundan emin olun
- İçeriği: `legacy-peer-deps=true`

### Sorun 5: Eski Versiyon Görünüyor
**Sebep:** Browser cache veya Vercel CDN cache
**Çözüm:**
1. Hard refresh yapın (Ctrl+Shift+R veya Cmd+Shift+R)
2. Vercel'de "Redeploy" yapın
3. Browser'da incognito mode'da test edin

## 🔄 Güncelleme Nasıl Yapılır?

1. Kodunuzu GitHub'a pushlayın
2. Vercel otomatik olarak yeni deploy başlatır
3. Deploy tamamlandığında değişiklikler yayına girer

## 📱 Custom Domain Ekleme (Opsiyonel)

1. Vercel Dashboard → Domains
2. "Add" butonuna tıklayın
3. Domain adınızı girin
4. DNS ayarlarını yapın (Vercel size yönlendirme talimatları verecek)

## 🆘 Destek

Sorun yaşarsanız:
1. Vercel build loglarını kontrol edin
2. Browser console'u (F12) kontrol edin
3. Backend loglarını kontrol edin

## 🎉 Production Checklist

Deploy öncesi:
- [ ] Tüm testler geçiyor
- [ ] Firebase production keys kullanılıyor
- [ ] Backend production'da çalışıyor
- [ ] CORS ayarları production domain'i içeriyor
- [ ] Error tracking kurulumu (Sentry vs.)
- [ ] Analytics kurulumu (Google Analytics vs.)
- [ ] Performance monitoring

## 📊 Önemli Notlar

1. **Backend Dependency:** Frontend, backend'in çalışmasına bağımlıdır. Backend kapanırsa frontend hata verir.
2. **Hot Reload:** Vercel'de kod değişikliği için yeniden deploy gerekir (local'deki gibi hot reload yok)
3. **Free Plan Limits:** Vercel free plan'da bandwidth ve build minute limitleri var
4. **Environment Secrets:** API key'leri asla GitHub'a pushlamayın, sadece Vercel'de tanımlayın

## 🔗 Faydalı Linkler

- [Vercel Documentation](https://vercel.com/docs)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [Firebase Auth Domain Setup](https://firebase.google.com/docs/auth/web/redirect-best-practices)

---

**Son Güncelleme:** 27 Kasım 2024
**Versiyon:** 1.0
