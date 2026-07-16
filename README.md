# Sanab E-commerce Platform (Jewellery & Cosmetics)

A modular, high-scale, enterprise-ready e-commerce solution featuring a Next.js App Router frontend and a Node.js + Express backend built with Clean Architecture principles.

---

## 🚀 Docker Compose Setup (Recommended)

You can launch the entire stack—including the Next.js frontend, Express backend, and a Redis job worker—using a single command. 

Ensure **Docker Desktop** is running, then run:

```bash
# Build and run the containers in detached mode
docker compose up --build -d

# View container logs
docker compose logs -f
```

### Port Mapping & Gateway Setup
* **Next.js Frontend**: http://localhost:10002
* **Express Backend**: http://localhost:10001
* **Redis Store**: Port 6379

---

## 🛠️ Local Development Setup

If you prefer to run the services outside Docker, configure the environments as follows:

### 1. Backend Setup & Run
Navigate to the `backend` folder, configure your `PORT=10001` in `.env`, and start the API:
```bash
cd backend
npm install
npm run dev
```
* **Development URL**: http://localhost:10001
* **Memory DB**: Automatically spins up an in-memory MongoDB fallback database if local MongoDB is offline.

### 2. Frontend Setup & Run
Navigate to the `frontend` folder, configure `NEXT_PUBLIC_API_URL=http://localhost:10001/api/public` in `.env.local`, and run:
```bash
cd frontend
npm install
npx next dev -p 10002
```
* **Development URL**: http://localhost:10002

---

## 🌟 Enterprise-Grade Architecture Highlights

This project includes advanced enterprise-level integrations:
1. **Bcrypt Security**: Password storage is secured using Bcrypt with 10 salt rounds instead of legacy SHA-256 hashes.
2. **Active Device Session Auditing**: Logs IP address, OS, and browser metadata on user login. Exposes API routes to inspect and revoke active devices/sessions.
3. **Queue Processing (BullMQ/Redis)**: Pushes OTP dispatch and notifications to background workers. Dynamically falls back to an in-memory queue if Redis is offline.
4. **Complete Wishlist Integration**: Full backend model/routes synced with a premium responsive frontend grid and Redux cart slice.
5. **Database Ledger Systems**:
   - `InventoryLedger` model to log restocks and purchases for auditability.
   - `WebhookLog` model to track Stripe and Razorpay webhook processing states.
