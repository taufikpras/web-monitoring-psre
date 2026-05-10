# Web Monitoring PSRE

Monitoring system for Electronic Certification Authorities (PSRE) that monitors VA availability (CA, CRL, OCSP), manages certificate repositories, and features an automated ticketing system for availability issues.

## 🚀 Key Features

- **Real-time Dashboard**: Visualization of VA availability (CRL & OCSP) with color indicators (Red <70%, Yellow 71-80%, Green >80%).
- **File Repository**: Automatic separation of CA and Non-CA certificates with dynamic filters.
- **Data Manager**: Management of input data for monitoring.
- **Ticketing System**: Automatic issue detection and ticket creation (Open/Closed) with occurrence counts.
- **Auto Cleanup**: Automatic cleanup of completed (Closed) tickets older than 90 days.
- **Docker Ready**: Automated build scripts with versioning and pushing to Docker Hub.
- **Runtime Configuration**: API URL configuration on the frontend without needing to rebuild the Docker image.

## 🛠️ Tech Stack

### Backend (API)
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB (for persistent data) & InfluxDB (for time-series/statistics data)
- **Task Queue**: Celery with Redis (for periodic monitoring)
- **Scheduler**: APScheduler
- **Validation**: Pydantic

### Frontend (App)
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **UI & Icons**: Vanilla CSS & Lucide React
- **Routing**: React Router 7
- **Charts**: Recharts

## 📁 Project Structure

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

## 🏗️ How to Run

### Using Docker (Recommended)

1. **Environment Setup**:
   Duplicate the `.env.example` file (if available) to `.env` and fill in the variables.

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d --build
   ```

   - Frontend: `http://localhost` (Port 80)
   - API: `http://localhost:8080/api` (Port 8080)

### Development (Local)

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

Use the `build.sh` script to build, auto-tag versions (`YYYYMMDD.XXXX`), and push to Docker Hub:

```bash
chmod +x build.sh
./build.sh
```

This script will:
1. Generate a unique version based on date and random hex.
2. Build the API and App.
3. Assign version and `latest` tags.
4. Push to Docker Hub (`taufikp/monitoring-psre-*`).

## ⚙️ Runtime Configuration

The frontend supports dynamic API URL injection when the container is run, using the `API_BASE_URL` environment variable.

**Example in docker-compose:**
```yaml
app:
  environment:
    - API_BASE_URL=http://api.domain.com/api
```

## 🧹 Ticket Cleanup

The ticketing system has an automated cleanup feature:
- **Schedule**: Every day at 08:00 AM.
- **Condition**: Only tickets with a **Closed** status that are > 90 days old.
- **Manual Trigger**: `POST /api/tickets/cleanup?days=90`

## 🏷️ Versioning

The application version is displayed at the bottom of the sidebar.
- **Frontend Version**: Injected during build (`app/version.txt`).
- **API Version**: Fetched dynamically from the version file in the `api/` folder.

---
Built with ❤️ by Taufik
