# Web Monitoring PSRE

Sistem monitoring untuk Electronic Certification Authorities (PSRE) yang memantau ketersediaan VA (CA, CRL, OCSP), mengelola repositori sertifikat, dan sistem ticketing otomatis untuk masalah ketersediaan.

## 🚀 Fitur Utama

- **Dashboard Real-time**: Visualisasi ketersediaan VA (CRL & OCSP) dengan indikator warna (Red <70%, Yellow 71-80%, Green >80%).
- **File Repository**: Pemisahan otomatis antara Sertifikat CA dan Non-CA dengan filter yang dinamis.
- **Data Manager**: Pengelolaan data input untuk monitoring.
- **Ticketing System**: Deteksi masalah otomatis dan pembuatan tiket (Open/Closed) dengan jumlah kemunculan.
- **Auto Cleanup**: Pembersihan otomatis tiket yang sudah selesai (Closed) lebih dari 90 hari.
- **Docker Ready**: Build script otomatis dengan versioning dan push ke Docker Hub.
- **Runtime Configuration**: Konfigurasi API URL pada frontend tanpa perlu rebuild Docker image.

## 🛠️ Tech Stack

### Backend (API)
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB (untuk data persisten) & InfluxDB (untuk data time-series/statistik)
- **Task Queue**: Celery with Redis (untuk monitoring berkala)
- **Scheduler**: APScheduler
- **Validation**: Pydantic

### Frontend (App)
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **UI & Icons**: Vanilla CSS & Lucide React
- **Routing**: React Router 7
- **Charts**: Recharts

## 📁 Struktur Proyek

```text
web-monitoring-psre/
├── api/                # Backend FastAPI
│   ├── src/            # Source code Python
│   ├── Dockerfile      # Backend Docker configuration
│   └── version.txt     # API version file
├── app/                # Frontend React
│   ├── src/            # Source code React/TS
│   ├── public/         # Static assets & runtime config
│   ├── Dockerfile      # Frontend Docker configuration
│   └── version.txt     # Frontend version file
├── build.sh            # Script build & push Docker
└── docker-compose.yml  # Orchestration services
```

## 🏗️ Cara Menjalankan

### Menggunakan Docker (Rekomendasi)

1. **Persiapan Environtment**:
   Duplicate file `.env.example` (jika ada) ke `.env` dan isi variabelnya.

2. **Jalankan dengan Docker Compose**:
   ```bash
   docker-compose up -d --build
   ```

   - Frontend: `http://localhost` (Port 80)
   - API: `http://localhost:8080/api` (Port 8080)

### Development (Lokal)

#### Backend
```bash
cd api
pip install -r requirements.txt
fastapi dev src/app.py
```

#### Frontend
```bash
cd app
npm install
npm run dev
```

## 🐋 Docker Build & Tagging

Gunakan script `build.sh` untuk melakukan build, tagging versi otomatis (`YYYYMMDD.XXXX`), dan push ke Docker Hub:

```bash
chmod +x build.sh
./build.sh
```

Script ini akan:
1. Menghasilkan versi unik berdasarkan tanggal dan random hex.
2. Melakukan build untuk API dan App.
3. Memberikan tag versi dan `latest`.
4. Melakukan push ke Docker Hub (`taufikp/monitoring-psre-*`).

## ⚙️ Konfigurasi Runtime

Frontend mendukung injeksi API URL secara dinamis saat container dijalankan menggunakan environment variable `API_BASE_URL`.

**Contoh di docker-compose:**
```yaml
app:
  environment:
    - API_BASE_URL=http://api.domain.com/api
```

## 🧹 Ticket Cleanup

Ticketing system memiliki fitur pembersihan otomatis:
- **Jadwal**: Setiap hari pukul 08:00 AM.
- **Kondisi**: Hanya tiket berstatus **Closed** yang sudah berumur > 90 hari.
- **Trigger Manual**: `POST /api/tickets/cleanup?days=90`

## 🏷️ Versi

Versi aplikasi ditampilkan di bagian bawah sidebar.
- **Frontend Version**: Disuntikkan saat build (`app/version.txt`).
- **API Version**: Diambil secara dinamis dari file versi di folder `api/`.

---
Build with ❤️ by Taufik
