# 🚀 LightIt — AI-Powered Startup-Investor Matchmaking Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" />
  <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io" />
  <img src="https://img.shields.io/badge/Three.js-r170-black?style=for-the-badge&logo=three.js" />
</div>

---

## ✨ What is LightIt?

LightIt is a **premium, production-ready AI-powered platform** that intelligently connects startup founders with the right investors using:

- 🤖 **AI Matching Engine** — weighted scoring across 6 compatibility factors
- ⚡ **Real-time Chat** — Socket.IO with E2E encryption, read receipts, file sharing
- 🎯 **Smart Discovery** — advanced sector/stage/funding filters
- 🏆 **Events Platform** — pitch competitions, demo days, voting
- 📢 **Advertisement System** — multi-type ads with analytics
- 🛡️ **Enterprise Security** — JWT, 2FA, GDPR, NDA management

---

## 📁 Project Structure

```
lightit/
├── apps/
│   ├── web/                    # Next.js 15 Frontend
│   │   ├── src/app/           # App Router pages
│   │   │   ├── page.tsx       # Landing page (3D hero + 12 sections)
│   │   │   ├── auth/          # Founder / Investor auth portals
│   │   │   ├── founder/       # Founder Dashboard
│   │   │   ├── investor/      # Investor Dashboard
│   │   │   └── admin/         # Admin Panel
│   │   └── src/components/    # Reusable components
│   │       └── three/         # Three.js 3D components
│   │
│   └── api/                   # Express.js Backend
│       ├── src/routes/        # All API routes
│       ├── src/services/      # AI Matching Engine
│       ├── src/socket/        # Socket.IO server
│       ├── src/middleware/    # Auth, rate limiting, errors
│       ├── src/lib/           # Prisma, Redis, JWT, Email
│       └── prisma/            # Database schema (20 tables)
│
└── docker/
    ├── docker-compose.yml
    └── nginx/nginx.conf
```

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 22+
- PostgreSQL 16+
- Redis 7+

### 1. Clone & Install

```bash
cd "c:\training project\LightIt"
npm install --workspace=apps/web --legacy-peer-deps
npm install --workspace=apps/api --legacy-peer-deps
```

### 2. Configure Environment

```bash
# API
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your values

# Web
cp apps/web/.env.local.example apps/web/.env.local
```

### 3. Database Setup

```bash
cd apps/api
npm run db:migrate    # Run migrations
npm run db:generate   # Generate Prisma client
npm run db:seed       # Seed demo data
```

### 4. Run Development Servers

```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Web
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Credentials (after seeding)

| Role     | Email                 | Password              |
|----------|-----------------------|-----------------------|
| Admin    | admin@lightit.io      | Admin@LightIt2025!    |
| Founder  | founder@demo.com      | Founder@Demo2025!     |
| Investor | investor@demo.com     | Investor@Demo2025!    |

---

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api
```

Services:
- **Web**: http://localhost:3000
- **API**: http://localhost:4000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

---

## 🧠 AI Matching Algorithm

```
Match Score = (Sector × 35%) + (Funding × 20%) + (Stage × 15%)
            + (Location × 10%) + (Risk × 10%) + (Behavior × 10%)
```

- **Sector**: Jaccard similarity between startup sectors and investor preferences
- **Funding**: Overlap ratio of funding requirement vs investor capacity
- **Stage**: Proximity scoring with ±25% per stage gap
- **Location**: Country-level matching with "Worldwide" support
- **Risk**: Alignment between startup stage and investor risk appetite
- **Behavior**: Platform engagement signals (watchlist, views, events)

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register founder/investor |
| POST | `/api/auth/login` | Login with JWT |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/2fa/setup` | Setup 2FA |
| GET | `/api/investors/recommendations` | AI startup picks |
| GET | `/api/founders/matches` | Investor matches |
| GET | `/api/startups` | Browse startups (with filters) |
| POST | `/api/chats/initiate` | Start a chat |
| GET | `/api/events` | List events |
| POST | `/api/payments/subscribe/stripe` | Create Stripe checkout |
| GET | `/api/admin/dashboard` | Admin KPIs |

---

## 🛡️ Security Features

- ✅ JWT Access + Refresh Token rotation
- ✅ bcrypt password hashing (cost 12)
- ✅ TOTP 2FA (Google Authenticator compatible)
- ✅ AES-256 message encryption
- ✅ Rate limiting (express-rate-limit + Redis)
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Role-based access control (FOUNDER/INVESTOR/ADMIN)
- ✅ Audit logging
- ✅ XSS protection
- ✅ SQL injection prevention (Prisma ORM)

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS 3, Framer Motion |
| 3D | Three.js, React Three Fiber, Drei |
| Backend | Express.js, TypeScript, Node.js 22 |
| Database | PostgreSQL 16, Prisma ORM |
| Cache | Redis 7 |
| Realtime | Socket.IO 4 |
| Auth | JWT, bcrypt, Speakeasy (2FA) |
| Storage | AWS S3 |
| Payments | Stripe, Razorpay |
| Email | Nodemailer |
| Deploy | Docker, Nginx, AWS |

---

## 📧 Contact & Support

Built with ❤️ by the LightIt team. For enterprise licensing and custom deployment, contact: enterprise@lightit.io
