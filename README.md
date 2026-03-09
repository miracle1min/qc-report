# QC Report Generator PWA ⚡

Mobile-first Progressive Web App untuk QC Report Generation & Logging.
**100% Offline — Data disimpan di JSON localStorage. Zero database.**

**App by Marko**

## 🚀 Quick Start (Termux)

```bash
# Prerequisites
pkg update && pkg install nodejs-lts

# Extract & run
unzip qc-report-pwa.zip -d qc-report-pwa
cd qc-report-pwa
npm install
npm run dev
```

Buka **http://localhost:3000** di browser HP.

## 📱 Install sebagai PWA
Chrome → Menu ⋮ → "Add to Home Screen" → Done!

## 🗄️ Storage
- **100% JSON localStorage** — tidak pakai database apapun
- Data persist di browser
- Export/Import backup via JSON file di Settings

## 📋 Features
- 5 Report Forms (Sortir, Cabe, Suhu, Tester, Return)
- WhatsApp-formatted output → Copy & Paste
- Crew Schedule dari Google Sheets
- Personal Notes
- History + Search & Filters
- Export/Import JSON backup
- Cyberpunk Minimal theme 🎨
- Installable PWA + Offline support

## v1.1.0
- Removed all database dependencies (sql.js)
- Pure JSON localStorage storage
- Faster load, smaller bundle, zero WASM
