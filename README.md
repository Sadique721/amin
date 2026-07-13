# Sanab E-commerce Platform (Jewellery & Cosmetics)

A clean, modular e-commerce solution featuring a Next.js frontend and a Node.js + Express backend built with Clean Architecture principles.

---

## Prerequisites
* **Node.js**: `v18.x` or later
* **MongoDB**: A running local instance or MongoDB Atlas cluster connection

---

## 1. Backend Setup & Run

Navigate to the `backend` folder to configure and start the API:

```bash
cd backend

# Install dependencies
npm install

# Start development server (runs with hot reloading)
npm run dev

# Build TypeScript to production JavaScript
npm run build

# Start production server
npm run start
```

* **Development Port**: Running on `http://localhost:5000` (controlled by `.env`)

---

## 2. Frontend Setup & Run

Navigate to the `frontend` folder to configure and start the client application:

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Build Next.js application for production
npm run build

# Start Next.js production server
npm run start
```

* **Development Port**: Running on `http://localhost:3000` (controlled by `.env.local`)
