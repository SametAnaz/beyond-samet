# Ortam ayarları

Yerelde `.env` kullanılır. Bu dosya, CA dosyaları ve `.env.backups/` Git'e eklenmez.

| Değişken | Açıklama |
| --- | --- |
| `AIVEN_DATABASE_URL` | Aiven MySQL servis URI'si; `DATABASE_URL` varsa öncelik Aiven'dedir. |
| `MYSQL_SSL_CA` | CA sertifikasının tam PEM içeriği. Hosting panelinde gerçek satır sonlarıyla yapıştırın; `.env` içinde çift tırnaklı `\n` gösterimi de desteklenir. |
| `AIVEN_CA_PATH` | Yerelde CA dosyasının yolu. `MYSQL_SSL_CA` varsa dosyaya gerek yoktur. |
| `MYSQL_CONNECTION_LIMIT` | Tek süreçte DB bağlantı sayısı; varsayılan 5. Çoklu instance sayısını Aiven bağlantı sınırıyla birlikte değerlendirin. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Admin giriş bilgileri. |
| `ADMIN_SESSION_SECRET` | En az 32 karakterlik rastgele oturum imzalama anahtarı. Yerelde oluşturulan değeri hosting ortamına da ekleyin. Anahtarı değiştirmek mevcut oturumları geçersiz kılar. |
| `NEXT_PUBLIC_SITE_URL` | Canlı sitenin tam HTTPS adresi; canonical, sitemap ve paylaşım URL'leri için. |
| `BLOB_READ_WRITE_TOKEN` | Mevcut Vercel Blob deposunun anahtarı. |
| `RESEND_API_KEY` | İletişim formunun e-posta anahtarı. |
| `CONTACT_FROM_EMAIL` | Resend'de doğrulanmış gönderen adresi. Varsayılan test göndereni `onboarding@resend.dev`; canlıda doğrulanmış alan adınızı kullanın. |
| `CONTACT_TO_EMAIL` | Mesajların teslim edileceği adres; varsayılan mevcut iletişim adresi. |

## Başlatma ve dağıtım

```sh
npm ci
npm run db:migrate
npm run db:image-dimensions
npm run dev
```

`db:migrate` tablo yapısını hazırlar, görsel boyut kolonlarını veri silmeden ekler ve eksik okuma sürelerini hesaplar. İçerikler ve düzenlenme tarihleri korunur. `db:image-dimensions`, mevcut Blob görsellerini okuyarak eksik boyutları tamamlar; okunamayanlar güvenli varsayılanlarla gösterilir. Şema değişikliklerinden önce DB yedeği alın.

Canlı dağıtımda önce ortam değişkenlerini tanımlayın, ardından migration'ı kontrollü olarak bir kez çalıştırın ve `npm run build` ile dağıtın. Yapı değişiklikleri HTTP istekleri sırasında çalıştırılmaz.

```sh
npm run lint
npm test
npm run build
```

Admin oturumu 24 saatlik, imzalı, HttpOnly, SameSite=Strict cookie kullanır. Production'da Secure cookie için HTTPS gerekir. API, her yönetim isteğinde oturumu doğrular; tarayıcıdaki `localStorage` yetkilendirme için kullanılmaz. Yorum, iletişim ve giriş hız sınırları tek Node süreci için geçerlidir; çoklu instance'da ortak bir store veya hosting katmanı limiti kullanın.

Editör taslakları bekledikten sonra sunucuya otomatik kaydeder. Yayınlanmış yazıda çalışırken değişiklikler bu cihazda yedeklenir; açıkça kaydetmeden yayındaki içerik değişmez. Gizli veya özel çalışma cihazında admin oturumunu kapatın.

Geçmiş Firebase/MySQL taşıma araçları `scripts/archive/` altında korunur; normal uygulama başlatma ve dağıtım akışının parçası değildir.

## Son doğrulama — 12 Ekim 2026

Lint, otomatik testler ve üretim derlemesi geçti. Yerel üretim sunucusunda admin girişi, korunan API'ler, cross-origin engeli, geçici taslağın oluşturulması/düzenlenmesi/silinmesi ve ziyaretçilere gizlenmesi doğrulandı. Ana sayfa, blog, galeri, projeler ve sitemap HTTP 200 döndü. Kontrol taslağı silindi.

Aiven'de 6 yazı, 5 yorum, 17 blog görseli ve 9 galeri görseli doğrulandı. Mevcut kayıt alanları değişiklik öncesi yedekle karşılaştırıldı; içerikler aynı. Tüm görsellerin boyut bilgileri mevcut. Okuma süreleri eksik olan yazılar migration ile tamamlanır.

`npm audit --omit=dev` sıfır açık bildirdi. Tam audit, yalnız geliştirme/arşiv araçlarında 9 uyarı bildiriyor: Next ESLint'in braces zinciri ve arşiv araçlarının gray-matter zinciri. Önerilen otomatik düzeltmeler sürüm düşürme içerdiği için uygulanmadı. Bu araçlar güvenilmeyen dış dosyaları işlerken kullanılmamalı; uyumlu yamalar geldiğinde yeniden kontrol edilmeli.

Tarayıcıda görsel/klavye testi ve canlı hosting dağıtımı yapılmadı. İletişim hizmetinde gerçek e-posta gönderimi test edilmedi; form doğrulaması test edildi. Blob SDK, güncel public `put`/`del` API'sine yükseltildi; yeni yüklemeler benzersiz suffix kullanır ([Vercel SDK dokümanı](https://vercel.com/docs/vercel-blob/using-blob-sdk)). Gerçek Blob yükleme/silme işlemleri bu son kontrolde denenmedi.
