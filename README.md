# Seviye

50 soruda İngilizce seviyesini (CEFR A1–C2) bulan iOS/Android uygulaması. Expo (React Native) + TypeScript.

## Yapı

- `src/engine.ts` — soru seçimi, seviye tahmini, cevap kontrolü (saf TypeScript, UI'dan bağımsız)
- `src/data/bank.json` — 156 soru (dilbilgisi, kelime, okuma, yazma, dinleme, kelime sıralama)
- `src/screens/` — Ana ekran, soru ekranı, sonuç ekranı
- `tests/engine.test.ts` — motor testleri

## Çalıştırma

```bash
npm install
npm test                # motor testleri
npx expo start          # telefonda Expo Go ile aç (QR kodu okut)
```

## App Store'a gönderme

1. Apple Developer hesabı aç (yılda 99 USD).
2. `app.json` içinde `ios.bundleIdentifier` ve `android.package` değerlerini kendi alan adına göre değiştir (şu an `com.example.seviye`).
3. `assets/icon.png` ve `assets/splash-icon.png` dosyalarını gerçek tasarımla değiştir (şu an Expo şablonu).
4. ```bash
   npm i -g eas-cli
   eas login
   eas build --platform ios --profile production
   eas submit --platform ios
   ```
5. App Store Connect'te: ekran görüntüleri, açıklama, gizlilik politikası adresi, yaş derecelendirmesi. Veri toplanmadığı için "Veri Toplanmıyor" seçilir.

## Yayından önce

- Soruları bir İngilizce öğretmenine gözden geçirt (doğru cevap, tek doğru şık, seviye uygunluğu).
- Mağaza açıklamasında ve uygulamada "resmî sınav değildir" ifadesini koru.
