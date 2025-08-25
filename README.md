# Event Discovery & Social Platform

A full-stack application for discovering and creating events, with authentication, role-based access, and an admin dashboard.

---

## ⚡ Quick Start

### 1. Clone Repos

```bash
git clone https://github.com/biooids/events-app-biooids.git

# Backend
cd server

# Frontend
cd client
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

#### Backend (`.env`)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/mydb
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info

ACCESS_TOKEN_SECRET=xyz
ACCESS_TOKEN_EXPIRES_IN_SECONDS=900
REFRESH_TOKEN_SECRET=xyz
REFRESH_TOKEN_EXPIRES_IN_DAYS=7

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api/v1
```

### 4. Run Servers

```bash
# Backend
cd server
pnpm run dev

# Frontend
cd client
pnpm run dev
```

- Backend: [http://localhost:5000](http://localhost:3001)
- Frontend: [http://localhost:3000](http://localhost:3000)

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js, TypeScript, MongoDB, Mongoose, Zod, JWT, Cloudinary, Pino
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit, React Hook Form + Zod

---

## 🚀 Features

- Secure authentication (JWT) with access & refresh tokens
- Role-based permissions: `USER`, `ADMIN`, `SUPER_ADMIN`
- Event creation & moderation flow (admin approval)
- Admin dashboard for users, events, categories
- Cloudinary image uploads

---

## 📜 Common Scripts

```bash
pnpm install        # Install dependencies
pnpm run dev        # Run dev server
pnpm run build      # Build for production
pnpm run start      # Start production build
```
