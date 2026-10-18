# StartApp – frontend + backend BITTA loyihada

React (Vite) + Node backend, hammasi bitta `server.js` da. Qoʻshimcha server yoki alohida backend kerak emas.

## Kompyuterda ishga tushirish (bitta buyruq)
```bash
npm install
npm run dev        # http://localhost:3000  – frontend ham, /api (backend) ham shu yerda
```

## Production (Railway)
```bash
npm run build      # frontendni dist/ ga yigʻadi
npm start          # dist/ + /api ni bitta serverda beradi (Railway buni oʻzi bajaradi)
```

### Railway'ga qoʻyish
1. Loyihani GitHub'ga yuklang.
2. railway.com → **New Project → Deploy from GitHub repo**.
3. **Variables** boʻlimiga qoʻshing: `ADMIN_PASSWORD` = oʻzingiz tanlagan admin paroli.
4. **Maʼlumot yoʻqolmasligi uchun Volume qoʻshing:** servis → **Volumes → Add Volume**, Mount path: `/data`, soʻng Variables ga `DATA_DIR` = `/data` ni qoʻshing.
   (Volume boʻlmasa, har safar qayta deploy qilinganda baza tozalanadi.)
5. **Settings → Networking → Generate Domain**.

## Admin
Login: `admin`. Parol: `ADMIN_PASSWORD` (oʻzgaruvchi berilmasa – `admin123`, buni almashtiring!).
Bosh sahifadagi "🛡 Admin" tugmasi yoki kirish ekranidagi "Admin sifatida kirish" orqali kiriladi.

## Qanday ishlaydi
- Maʼlumotlar `data/db.json` faylida saqlanadi (`DATA_DIR` bilan joyini oʻzgartirish mumkin).
- Parollar `scrypt` bilan shifrlanadi, kirish tokenlari serverda saqlanadi (30 kun).
- Foydalanuvchi, xarajat, karta, maqsad, ariza, joy va ish – hammasi serverda, shuning uchun admin boshqa qurilmadagi foydalanuvchilarni ham koʻradi.
- Karta, balans va jarima – demo (haqiqiy toʻlov uchun Payme/Click ulanadi).
- Mikrofon faqat `https://` yoki `localhost` da ishlaydi.

## Tuzilma
```
server.js            backend (API) + frontend serveri, bitta fayl
src/                 React ilova
  lib/api.js         backend bilan gaplashish
  screens/, components/, lib/
vite.config.js
```
