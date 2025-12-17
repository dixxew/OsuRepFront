# 🖥️ OsuRepFront

**OsuRepFront** is a frontend application for **OsuRussianRep**, providing a web interface for viewing **osu! community statistics**, user activity, and word/message analytics.

The project is built with **React + TypeScript**, designed to work with the OsuRussianRep backend API, and is fully Docker-ready.

---

## Features

- Web UI for osu! statistics and analytics
- User activity and message statistics
- Word frequency and leaderboard views
- Backend API integration
- Production-ready Docker setup
- CI configuration via Jenkins

---

## Tech Stack

- **React**
- **TypeScript**
- **Node.js / npm**
- **Nginx** (production)
- **Docker & Docker Compose**

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dixxew/OsuRepFront.git
cd OsuRepFront
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Run in development mode

```bash
npm start
```

Default dev server:

```
http://localhost:3000
```

---

## Docker

### Build and run

```bash
docker compose up --build
```

The frontend will be served via **Nginx**.

---

## Configuration

- `default.conf` — Nginx configuration
- API base URL is expected to point to **OsuRussianRep**
- Environment-specific settings can be adjusted during build or via Docker

---

## Project Structure

```
OsuRepFront/
├── public/              # Static assets
├── src/                 # React source code
│   ├── components/      # UI components
│   ├── pages/           # Pages / views
│   ├── services/        # API clients
│   └── utils/           # Helpers
├── Dockerfile
├── docker-compose.yml
└── default.conf         # Nginx config
```

---

## Contributing

The project is **actively maintained**.  
Any contribution is welcome and will be reviewed.

Contribution flow:
1. Fork the repository
2. Create a feature or fix branch
3. Open a Pull Request

---

## Related Projects

- **OsuRussianRep** — backend API

---

## License

MIT
