# 🔥 Firebase Google Giriş Sorunu Çözümü

## ❌ Sorun: "Firebase: Error (auth/unauthorized-domain)"

Bu hata, Firebase Console'da mevcut domain'in "Authorized Domains" listesinde olmadığı anlamına gelir.

## ✅ Çözüm Adımları

### Adım 1: Firebase Console'a Giriş

1. [Firebase Console](https://console.firebase.google.com) adresine gidin
2. Projenizi seçin (`sporotesi-a4ee9`)

### Adım 2: Authentication Ayarları

1. Sol menüden **Authentication** seçin
2. Üst menüden **Settings** (Ayarlar) sekmesine tıklayın
3. Sayfayı aşağı kaydırın ve **Authorized domains** bölümünü bulun

### Adım 3: Domain Ekleme

**Emergent Preview için:**
```
sportsocial-3.preview.emergentagent.com
```

**Vercel Deploy sonrası (örnekler):**
```
your-app-name.vercel.app
your-custom-domain.com
```

4. **Add domain** butonuna tıklayın
5. Domain'i yapıştırın ve **Add** deyin

### Adım 4: Test

1. Birkaç dakika bekleyin (Firebase'in güncellenmesi için)
2. Sayfayı yenileyin (Ctrl+F5 veya Cmd+Shift+R)
3. "Giriş Yap" → "Google ile Devam Et" butonuna tekrar tıklayın

## 🎯 Alternatif Çözüm: Vercel'e Deploy

Eğer yukarıdaki adımları uygulamak istemiyorsanız:

1. Uygulamayı doğrudan **Vercel'e deploy edin**
2. Vercel domain'i (örn: `your-app.vercel.app`) otomatik olarak çalışacaktır
3. Firebase Console'da Vercel domain'inizi authorize edin

## 📝 Domain Listesi Örnekleri

Firebase Console → Authentication → Settings → Authorized domains'de şunlar olmalı:

```
✅ localhost
✅ sportsocial-3.preview.emergentagent.com (Preview)
✅ your-app-name.vercel.app (Production)
✅ your-custom-domain.com (Custom domain - opsiyonel)
```

## ⚠️ Önemli Notlar

1. **Her yeni domain için** aynı işlemi yapmalısınız
2. Değişiklikler **2-3 dakika** içinde aktif olur
3. Browser cache'i temizleyin (hard refresh)
4. Incognito/private mode'da test edin

## 🐛 Hala Çalışmıyor mu?

### Kontrol Listesi:

- [ ] Firebase Console'da doğru projeyi mi seçtiniz?
- [ ] Domain'i tam ve doğru yazdınız mı?
- [ ] Google Authentication aktif mi? (Authentication → Sign-in method → Google → Enabled)
- [ ] Browser console'da başka hata var mı? (F12)
- [ ] Hard refresh yaptınız mı? (Ctrl+Shift+R)

### Hata Mesajları:

**"auth/popup-blocked"**
- Browser popup'ları engelliyor
- Browser ayarlarından popup'lara izin verin

**"auth/popup-closed-by-user"**
- Kullanıcı popup'ı kapatmış
- Normal bir durum, tekrar deneyin

**"auth/network-request-failed"**
- İnternet bağlantısı sorunu
- Bağlantınızı kontrol edin

## 📚 Daha Fazla Bilgi

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth/web/google-signin)
- [Authorized Domains Setup](https://firebase.google.com/docs/auth/web/redirect-best-practices)

---

**Son Güncelleme:** 27 Kasım 2024
