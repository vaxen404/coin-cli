# 🪙 coin-cli



Döviz kurlarını takip etmenizi ve elinizdeki paranın kaç Bitcoin (BTC) ettiğini hesaplamanızı sağlayan hızlı bir terminal aracı.



## 🚀 Özellikler

- Canlı Veri: Güncel döviz kurlarını ve BTC fiyatını yerleşik Fetch API üzerinden anlık çeker.

- Akıllı Dönüşüm: Paranızı önce USD'ye, ardından güncel pariteyle BTC'ye çevirir.

- Şık Arayüz: Terminalde renkli, okunaklı ve kullanıcı dostu bir çıktı sunar.

- Satoshi Hassasiyeti: BTC değerlerini virgülden sonra 8 basamaklı (satoshi birimiyle uyumlu) gösterir.


## 🛠️ Kurulum ve Çalıştırma



1. Depoyu klonlayın:

git clone https://github.com/vaxen404/coin-cli.git

cd coin-cli



2. Bağımlılıkları yükleyin:

npm install



3. Uygulamayı başlatın:

npx tsx src/app.ts



## 📦 Teknolojiler

- TypeScript: Güvenli ve ölçeklenebilir kod yapısı.

- Native Fetch: Harici kütüphane bağımlılığı olmadan yüksek performanslı HTTP istekleri.

- Inquirer: Etkileşimli terminal menüleri ve kullanıcı girişleri.

- Chalk: Terminal çıktılarını renklendirme.


## 📄 Lisans

MIT
