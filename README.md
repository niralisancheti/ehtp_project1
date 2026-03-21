# Threat Detection Laboratory

**Detection and Analysis of Common Web Vulnerabilities using Kali Linux Docker**

A full-stack cybersecurity education platform that demonstrates real web application attacks and their detection. Instead of requiring a Kali Linux VM, this project runs Kali inside a Docker container with real attack tools (sqlmap, nikto, hydra, nmap) that target a deliberately vulnerable Flask backend. All attack results are real — no dummy data or simulations.

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │   Frontend   │   │   Backend    │   │  Kali Linux  │ │
│  │  React SPA   │   │  Flask API   │   │  Attack Box  │ │
│  │  :5173       │──▶│  :5001       │◀──│  :8888       │ │
│  └──────────────┘   └──────────────┘   └──────────────┘ │
│                                                          │
│  Browser clicks     Vulnerable app +    sqlmap, nikto,   │
│  "KALI ATTACK" ──▶  detection engine    hydra, curl,     │
│                     logs all attacks    nmap              │
└──────────────────────────────────────────────────────────┘
```

**Flow:**
1. User clicks "KALI ATTACK" in the React frontend
2. Frontend calls the Flask backend's `/api/run-attack` endpoint
3. Backend forwards the request to the Kali container's API
4. Kali runs real attack tools (sqlmap, curl payloads, etc.) against the backend
5. Backend's detection engine catches the attacks and logs them
6. Frontend auto-refreshes and displays real attack data with "KALI LINUX" badges

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router 7, Axios |
| Backend | Python Flask, SQLite, Flask-CORS |
| Attack Box | Kali Linux (Docker), sqlmap, nikto, hydra, nmap, curl |
| Orchestration | Docker Compose |

---

## Prerequisites

Before starting, make sure you have the following installed:

### 1. Docker Desktop

Docker is required to run all three services (frontend, backend, Kali Linux).

**macOS:**
```bash
# Install via Homebrew
brew install --cask docker

# OR download from https://www.docker.com/products/docker-desktop/
```

**Windows:**
- Download Docker Desktop from https://www.docker.com/products/docker-desktop/
- Enable WSL 2 during installation
- Restart your computer after installation

**Linux (Ubuntu/Debian):**
```bash
# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose-plugin

# Add your user to the docker group (avoids needing sudo)
sudo usermod -aG docker $USER
newgrp docker
```

**Verify Docker is installed and running:**
```bash
docker --version
docker compose version
```

You should see version numbers for both. If Docker Desktop is installed but not running, open the Docker Desktop application first.

### 2. Git (optional, for cloning)

```bash
git --version
```

### 3. Disk Space

The Kali Linux Docker image is approximately 1-2 GB. Make sure you have at least 3 GB of free disk space.

---

## Setup & Installation

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd ehtp_project1
```

Or if you already have the project:
```bash
cd ehtp_project1
```

### Step 2: Verify Project Structure

Make sure these key files exist:
```
ehtp_project1/
├── docker-compose.yml          # Orchestration file
├── backend/
│   ├── Dockerfile              # Backend container config
│   ├── app.py                  # Flask API server
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── Dockerfile              # Frontend container config
│   ├── package.json            # Node dependencies
│   └── src/
│       ├── App.jsx             # React application
│       └── index.css           # Styles
└── kali/
    ├── Dockerfile              # Kali Linux container config
    ├── attack_api.py           # Attack API server
    └── scripts/
        ├── sqli_attack.sh      # SQL injection attacks
        ├── xss_attack.sh       # XSS attacks
        ├── cmdi_attack.sh      # Command injection attacks
        └── csrf_attack.sh      # CSRF attacks
```

### Step 3: Build and Start Everything

This single command builds all three Docker images and starts the services:

```bash
docker compose up --build
```

**What happens during the build:**
1. **Backend image** (~30 seconds): Installs Python, Flask, and dependencies
2. **Frontend image** (~1-2 minutes): Installs Node.js, React, and npm packages
3. **Kali image** (~5-10 minutes on first build): Downloads Kali Linux base image, installs sqlmap, nikto, hydra, nmap, curl, and sets up the attack API

The Kali image is large (~1-2 GB) so the first build takes time. Subsequent builds are cached and much faster.

**You'll see logs from all three services. Wait until you see:**
```
kali-1      | [+] Backend reachable at http://backend:5001
kali-1      |  * Running on all addresses (0.0.0.0)
kali-1      |  * Running on http://0.0.0.0:8888
backend-1   |  * Running on all addresses (0.0.0.0)
backend-1   |  * Running on http://0.0.0.0:5001
frontend-1  |   VITE v7.x.x  ready
frontend-1  |   ➜  Local:   http://localhost:5173/
```

### Step 4: Open the Application

Open your browser and go to:

```
http://localhost:5173
```

You should see the **Threat Detection Laboratory** home page with:
- A cyberpunk-themed UI with radar animation
- 4 attack module cards (SQL Injection, XSS, Command Injection, CSRF)
- A "KALI LINUX: ONLINE" status indicator (green)

---

## Usage Guide

### Launching Attacks from Kali Linux

Each attack card on the home page has two buttons:

| Button | What it does |
|--------|-------------|
| **MANUAL ATTACK** | Takes you to the attack page where you can type payloads yourself |
| **KALI ATTACK** | Triggers real attacks from the Kali Linux container using actual pentesting tools |

#### SQL Injection (CRITICAL)
- Click **KALI ATTACK** on the SQL Injection card
- Kali runs sqlmap + multiple curl-based SQLi payloads against the login endpoint
- The backend's detection engine catches patterns like `' OR 1=1 --`, `UNION SELECT`, etc.
- View results on the THREATS page

#### Cross-Site Scripting (HIGH)
- Click **KALI ATTACK** on the XSS card
- Kali sends 14 different XSS payloads (script tags, event handlers, SVG payloads, etc.)
- Targets both the search endpoint (reflected XSS) and comments endpoint (stored XSS)

#### Command Injection (HIGH)
- Click **KALI ATTACK** on the Command Injection card
- Kali sends 12 command injection payloads (shell operators, reverse shells, command chaining)
- Targets the ping endpoint

#### CSRF (MEDIUM)
- Click **KALI ATTACK** on the CSRF card
- Kali sends forged transfer requests without CSRF tokens and with spoofed Origin headers

### Viewing Attack Logs

Navigate to **THREATS** in the navbar to see all detected attacks:
- Attacks are auto-refreshed every 3 seconds
- Attacks from Kali are marked with a red **KALI LINUX** badge
- Filter by attack type using the buttons (ALL, SQLi, XSS, CMD, CSRF)
- Each entry shows the payload, source IP, timestamp, and user agent

### Manual Attack Testing

You can also test attacks manually:
- **Login page** (`/login`): Try `admin' --` as username with any password
- **Search page** (`/search`): Try `<script>alert("XSS")</script>`
- **Ping page** (`/ping`): Try `127.0.0.1 ; whoami`
- **Transfer page** (`/transfer`): Click "LAUNCH CSRF ATTACK"

Test accounts for login: `admin/admin123`, `john/john123`, `jane/jane123`

---

## Docker Commands Reference

```bash
# Build and start all services
docker compose up --build

# Start in background (detached mode)
docker compose up --build -d

# View logs
docker compose logs -f              # All services
docker compose logs -f kali         # Kali only
docker compose logs -f backend      # Backend only

# Stop all services
docker compose down

# Stop and remove volumes (clean reset)
docker compose down -v

# Rebuild only the Kali container
docker compose build kali
docker compose up -d kali

# Shell into the Kali container
docker compose exec kali bash

# Check container status
docker compose ps
```

### Running Kali Tools Manually

You can shell into the Kali container and run tools directly:

```bash
# Get a bash shell inside Kali
docker compose exec kali bash

# Run sqlmap manually
sqlmap -u "http://backend:5001/api/login" \
  --method POST \
  --data='{"username":"test","password":"test"}' \
  --headers="Content-Type: application/json" \
  --batch

# Run nmap scan
nmap -sV backend

# Run nikto scan
nikto -h http://backend:5001

# Send custom curl payloads
curl -X POST http://backend:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' --","password":"x"}'
```

---

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (React) | 5173 | http://localhost:5173 |
| Backend (Flask) | 5001 | http://localhost:5001 |
| Kali Attack API | 8888 | http://localhost:8888 (internal) |

---

## Troubleshooting

### "Kali Linux: OFFLINE" on the home page
- The Kali container may still be starting up (it waits for the backend to be ready)
- Check logs: `docker compose logs -f kali`
- Ensure Docker Desktop is running

### Build fails with "no space left on device"
- Free up Docker disk space: `docker system prune -a`
- The Kali image requires ~2 GB

### Frontend can't reach backend
- Both services must be on the same Docker network
- The frontend makes API calls to `http://localhost:5001` from the browser
- Make sure port 5001 is not used by another process: `lsof -i :5001`

### "KALI ATTACK" button doesn't work
- Check if the Kali container is running: `docker compose ps`
- Check Kali logs: `docker compose logs kali`
- The Kali API must be reachable from the backend container

### Attacks aren't showing in the log
- The backend's detection engine uses regex patterns — some payloads may bypass detection
- SQL injection on login is detected but the query still executes (by design, for demo)
- Check backend logs: `docker compose logs backend`

### Slow first build
- The Kali Linux Docker image downloads ~1-2 GB on first build
- Subsequent builds use the Docker cache and are much faster
- Make sure you have a stable internet connection

---

## Project Structure

```
ehtp_project1/
├── docker-compose.yml              # Docker orchestration
├── README.md                       # This file
├── PROJECT_REPORT.md               # Academic project report
│
├── backend/                        # Flask API server
│   ├── Dockerfile
│   ├── app.py                      # Main application (vulnerable endpoints + detection)
│   ├── requirements.txt
│   ├── app.db                      # SQLite database (auto-created)
│   └── attack_log.txt              # File-based attack log
│
├── frontend/                       # React SPA
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx                 # All React components
│       ├── index.css               # Cyberpunk theme styles
│       └── main.jsx                # Entry point
│
├── kali/                           # Kali Linux attack container
│   ├── Dockerfile
│   ├── attack_api.py               # Flask API for receiving attack commands
│   └── scripts/
│       ├── sqli_attack.sh          # SQL injection payloads + sqlmap
│       ├── xss_attack.sh           # 14 XSS payloads (reflected + stored)
│       ├── cmdi_attack.sh          # 12 command injection payloads
│       └── csrf_attack.sh          # Forged transfer requests
│
├── templates/                      # Legacy Jinja2 templates (server-rendered)
│   ├── base.html
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── search.html
│   ├── comments.html
│   ├── ping.html
│   ├── transfer.html
│   └── attacks.html
│
└── app.py                          # Legacy monolithic Flask app
```

---

## Attack Modules Detail

| Attack | Severity | Tools Used | Payloads | Target Endpoint |
|--------|----------|------------|----------|-----------------|
| SQL Injection | CRITICAL | sqlmap, curl | 7+ payloads (tautology, UNION, comment bypass, DROP) | `/api/login`, `/api/search` |
| Cross-Site Scripting | HIGH | curl | 14 payloads (script tags, event handlers, SVG, iframe) | `/api/search`, `/api/comments` |
| Command Injection | HIGH | curl | 12 payloads (shell operators, reverse shells, wget) | `/api/ping` |
| CSRF | MEDIUM | curl | 5 forged requests (no token, spoofed Origin/Referer) | `/api/transfer` |

---

## Vulnerabilities Demonstrated

### 1. SQL Injection
- **Root cause**: Raw string interpolation in SQL queries (`f"SELECT * FROM users WHERE username = '{username}'"`)
- **Detection**: Regex pattern matching for SQL keywords
- **Impact**: Authentication bypass, data extraction

### 2. Cross-Site Scripting (XSS)
- **Root cause**: User input rendered without sanitization
- **Detection**: Pattern matching for `<script>`, `onerror=`, `javascript:`, etc.
- **Impact**: Session hijacking, cookie theft

### 3. Command Injection
- **Root cause**: User input passed to system commands
- **Detection**: Pattern matching for shell operators (`;`, `&`, `|`, `` ` ``)
- **Impact**: Remote code execution

### 4. Cross-Site Request Forgery (CSRF)
- **Root cause**: No CSRF token validation on state-changing endpoints
- **Detection**: Missing/invalid CSRF token header check
- **Impact**: Unauthorized transactions

---

## License

This project is for educational purposes only. All attacks are performed in a controlled, isolated Docker environment. Do not use these techniques against systems you do not own or have explicit permission to test.
