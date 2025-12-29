# Test Setup - Docker Dışında Çalıştırma

Bu doküman, geliştirdiğimiz özellikleri test etmek için Docker dışında nasıl çalıştırılacağını açıklar.

## Gereksinimler

1. Node.js (v12 veya üzeri)
2. MongoDB ve Elasticsearch bağlantı bilgileri
3. Gerekli npm paketleri

## Kurulum

### 1. Environment Variables

`.env.test` dosyası oluşturun (veya mevcut `.env` dosyasını kullanın):

```bash
cd kelimecom-apiend
```

`.env.test` dosyası içeriği:
```env
NODE_ENV=development
PORT=5001

# MongoDB Connection
MONGODB_URL=mongodb://monster:S4n4n3123A@kelime.com:27027/kelimecomdb?authSource=admin

# Elasticsearch Connection
ELASTICSEARCH_URL=http://46.235.14.33:9200
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASSWORD=Vd8I39ShIr66KHMBe5O1

# JWT Secret
JWT_SECRET=test-jwt-secret-key-change-in-production
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10
```

### 2. Dependencies

```bash
cd kelimecom-apiend
npm install
```

## Test Script Kullanımı

### Basit Test

```bash
npm run test:search
```

Bu komut:
- MongoDB bağlantısını test eder
- Elasticsearch bağlantısını test eder
- Kurum kontrolünü test eder (varsayılan IP: 192.168.1.1)
- "kalem" kelimesi için arama yapar (aktif ve aktif olmayan kullanıcı için)

### Özel Arama Terimi ile Test

```bash
node test-search-debug.js --search "araba"
```

### Özel IP ile Kurum Testi

```bash
node test-search-debug.js --ip "192.168.1.100"
```

### Kombine Test

```bash
node test-search-debug.js --search "kitap" --ip "10.0.0.1"
```

## Debug Modunda Çalıştırma

### API Server'ı Debug Modunda Başlatma

```bash
cd kelimecom-apiend

# .env.test dosyasını kullanarak
NODE_ENV=development node --inspect src/index.js

# Veya nodemon ile (otomatik restart)
NODE_ENV=development nodemon --inspect src/index.js
```

### VS Code Debug Configuration

`.vscode/launch.json` dosyası oluşturun:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API Server",
      "runtimeExecutable": "node",
      "runtimeArgs": ["--inspect"],
      "program": "${workspaceFolder}/kelimecom-apiend/src/index.js",
      "envFile": "${workspaceFolder}/kelimecom-apiend/.env.test",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Test Script",
      "runtimeExecutable": "node",
      "program": "${workspaceFolder}/kelimecom-apiend/test-search-debug.js",
      "envFile": "${workspaceFolder}/kelimecom-apiend/.env.test",
      "args": ["--search", "kalem"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Test Senaryoları

### Senaryo 1: Kurum Kontrolü

```bash
# Aktif kurum IP'si ile test
node test-search-debug.js --ip "KURUM_IP_ADRESI"

# Pasif kurum IP'si ile test
node test-search-debug.js --ip "PASIF_KURUM_IP"
```

### Senaryo 2: Kullanıcı Aktif/Aktif Değil

Test script'i otomatik olarak iki durumu test eder:
- `isUserActive = false`: Sadece ilk whichDict kaydı gösterilir
- `isUserActive = true`: Tüm whichDict kayıtları gösterilir

### Senaryo 3: Farklı Arama Terimleri

```bash
# Tek kelime
node test-search-debug.js --search "kalem"

# Çoklu kelime
node test-search-debug.js --search "kitap okumak"
```

## Beklenen Çıktılar

### Başarılı Bağlantı

```
🚀 Test Başlatılıyor...

🔗 MongoDB'ye bağlanılıyor...
📍 URL: mongodb://***:***@kelime.com:27027/kelimecomdb?authSource=admin
✅ MongoDB bağlantısı başarılı

🔗 Elasticsearch'e bağlanılıyor...
✅ Elasticsearch bağlantısı başarılı
📊 Durum: { status: 'green', ... }
```

### Kurum Kontrolü

```
🧪 setKurumsalAccess Testi
📍 Test IP: 192.168.1.1
📊 Toplam X kurum bulundu

🔍 Kurum Kontrolleri:
  ✅ Kurum Adı: Tüm kontroller geçti
  ❌ Kurum Adı 2: Aktif değil

✅ 1 aktif kurum bulundu:
   - Kurum Adı (Aktif)
```

### Arama Sonuçları

```
🧪 searchMaddeExact Testi
🔍 Arama terimi: kalem
👤 Kullanıcı aktif: Hayır

📊 Sonuçlar:
   - Toplam: 10
   - Dönen kayıt: 1
   - Sayfa: 1/1

📝 İlk 1 kayıt:
   1. kalem
      - Sözlük: AKVARYUM TÜRKÇE SÖZLÜK-2012
      - Dil: tr
      - whichDict ID: 6333540682cdb227444ee507
      - ⚠️  Sadece ilk whichDict kaydı gösteriliyor

⚠️  UYARI: Bu maddenin 3 whichDict kaydı var, ama sadece 1 tanesi gösteriliyor!
   Kullanıcı aktif olsaydı, 3 kayıt gösterilecekti.
```

## Sorun Giderme

### MongoDB Bağlantı Hatası

```
❌ MongoDB bağlantı hatası: ...
```

**Çözüm:**
- MongoDB sunucusunun erişilebilir olduğundan emin olun
- Firewall ayarlarını kontrol edin
- Bağlantı string'ini kontrol edin

### Elasticsearch Bağlantı Hatası

```
❌ Elasticsearch bağlantı hatası: ...
```

**Çözüm:**
- Elasticsearch sunucusunun erişilebilir olduğundan emin olun
- Kullanıcı adı ve şifreyi kontrol edin
- URL'yi kontrol edin

### Module Not Found Hatası

```
Error: Cannot find module '...'
```

**Çözüm:**
```bash
cd kelimecom-apiend
npm install
```

## Notlar

- Test script'i sadece okuma işlemleri yapar, veritabanını değiştirmez
- Gerçek verilerle çalışır, dikkatli olun
- Debug modunda çalıştırırken breakpoint'ler kullanabilirsiniz
