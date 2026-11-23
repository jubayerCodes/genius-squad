# Genius Squad — Vercel Production Deployment Guide

This guide outlines how to deploy both the **Frontend (`Client/`)** and **Backend (`Server/`)** of Genius Squad to **Vercel** with full Neon PostgreSQL database integration.

---

## 🏗️ Architecture & Deployment Strategy

Genius Squad uses a decoupled architecture:
* **Frontend (`Client/`):** Next.js 16 (App Router), Tailwind CSS v4, Turbopack.
* **Backend (`Server/`):** Node.js Express Modular API, Prisma ORM (v6.4.1), Neon Cloud PostgreSQL.

### Recommended Vercel Setup (Industry Standard)
Deploy **two separate projects** in Vercel from the same Git repository:
1. **`genius-squad-api` (Backend):** Root Directory set to `Server`. Runs as a high-performance Vercel Serverless Function via `api/index.ts`.
2. **`genius-squad-web` (Frontend):** Root Directory set to `Client`. Runs natively on Vercel's Next.js edge/serverless platform with built-in API proxy rewrites.

---

## 🚀 Step 1: Deploy the Backend (`Server/`)

### 1. Create a New Project on Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your **Genius Squad** repository.

### 2. Configure Project Settings
* **Project Name:** `genius-squad-api` (or your chosen backend name)
* **Framework Preset:** **Other**
* **Root Directory:** Click **Edit** and select `Server`.
* **Build Command:** Automatically detected from `package.json`: `prisma generate && tsc`
* **Output Directory:** Automatically handled by Vercel serverless functions.
* **Install Command:** `npm install` (will automatically trigger `postinstall: prisma generate`)

### 3. Add Environment Variables
Under the **Environment Variables** section, add the following:

| Variable Name | Example / Format | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-...-pooler.aws.neon.tech/genius_squad?sslmode=require&pgbouncer=true` | Neon Pooled connection string (port 6543) |
| `DIRECT_URL` | `postgresql://user:pass@ep-...aws.neon.tech/genius_squad?sslmode=require` | Neon Direct connection string (port 5432) |
| `JWT_SECRET` | Strong 64-character random string | Secret key for JWT session signing |
| `JWT_EXPIRES_IN` | `7d` | Token expiration duration |
| `NODE_ENV` | `production` | Production environment flag |
| `CLIENT_URL` | `https://your-frontend-project.vercel.app` | Allowed CORS origin (Frontend URL) |

> [!TIP]
> Always use Neon's **Pooled** connection string (`-pooler` on port 6543) for `DATABASE_URL`. This allows PgBouncer to manage database connections efficiently across Vercel serverless function invocations without exhausting connection limits.

### 4. Deploy and Verify
1. Click **Deploy**.
2. Once the deployment finishes, open your backend URL in the browser:
   * **Root check:** `https://your-backend-project.vercel.app/`
     * Expected Response: `{"success":true,"message":"Genius Squad API Server is live and operational."}`
   * **Health check:** `https://your-backend-project.vercel.app/api/v1/health`
     * Expected Response: `{"status":"healthy","message":"Genius Squad Modular API Server (v1) is up and running!"}`

---

## 🌐 Step 2: Deploy the Frontend (`Client/`)

### 1. Create a Second Project on Vercel
1. In your [Vercel Dashboard](https://vercel.com), click **Add New...** > **Project**.
2. Import the **same Genius Squad repository** again.

### 2. Configure Project Settings
* **Project Name:** `genius-squad-web` (or `genius-squad`)
* **Framework Preset:** **Next.js** (detected automatically)
* **Root Directory:** Click **Edit** and select `Client`.
* **Build Command:** `next build` (default)
* **Output Directory:** `.next` (default)

### 3. Add Environment Variables
Under **Environment Variables**, add:

| Variable Name | Value | Purpose |
|---|---|---|
| `BACKEND_URL` | `https://your-backend-project.vercel.app` | Deployed backend URL (used by Next.js server-side rewrites for `/api/*` and `/uploads/*`) |

> [!NOTE]
> `BACKEND_URL` allows Next.js to proxy `/api/*` requests on the server side. Because requests stay same-origin from the browser's perspective, this eliminates CORS issues and simplifies authentication cookie/token handling.

### 4. Deploy and Verify
1. Click **Deploy**.
2. Visit your frontend URL (e.g., `https://genius-squad-web.vercel.app`).
3. Verify that course listings load, login/registration functions work, and the admin panel is accessible.

---

## 🗄️ Step 3: Database Migration & Initial Super Admin Seed

Once your Neon PostgreSQL database is linked, ensure your database schema and seed data are initialized.

From your local machine or terminal:
```bash
# Navigate to the Server directory
cd Server

# Push Prisma schema to Neon PostgreSQL
npx prisma db push

# Seed default courses and root Super Admin
npx tsx prisma/seed.ts
```

Default seeded credentials:
* **Email:** `admin@geniussquad.com`
* **Password:** `admin123`
* **Role:** `SUPER_ADMIN` (Protected root owner)

---

## 🖼️ Media & Image Uploads in Serverless Environments

* **Vercel Serverless Read-Only Filesystem:**
  * Vercel Serverless Functions run in an ephemeral container with a read-only filesystem (except `/tmp`).
  * The backend is defensively configured to fallback to `/tmp/uploads/courses` to avoid runtime crashes (`EROFS`).
* **Production Best Practice:**
  * In the Course Management admin UI, courses support direct **Image URLs** (e.g. Cloudinary, ImgBB, Supabase Storage, or external CDN URLs).
  * For long-term user image storage in serverless production, use external image hosting or cloud storage (e.g. Cloudinary or AWS S3).

---

## 🔍 Pre-Flight Deployment Checklist

- [x] `Server/vercel.json` configured with `/api/index` catch-all rewrites.
- [x] `Server/api/index.ts` serverless function entrypoint created.
- [x] `Server/package.json` contains `postinstall: prisma generate` and `vercel-build: prisma generate && tsc`.
- [x] `Server/src/app.ts` provides `GET /` operational status and CORS headers for preview and production domains.
- [x] `Server/src/lib/prisma.ts` preserves global Prisma client singleton across serverless warm invocations.
- [x] `Client/next.config.mjs` properly trims and proxies `BACKEND_URL` for `/api/*` and `/uploads/*`.
- [x] `Client/src/lib/apiClient.ts` handles sanitized endpoints with direct or proxied requests.
- [x] Both `Client` (`npm run build`) and `Server` (`npm run build`) pass with zero TypeScript or lint errors.
