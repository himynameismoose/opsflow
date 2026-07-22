# OpsFlow — Internal Workflow Automation Suite

A full-stack internal tooling application for managing operational workflow requests with role-based access control.

**Live Demo:** https://opsflow-client.onrender.com

> Note: The server runs on Render's free tier and may take 30-60 seconds to wake up on first request.

## Features

- User authentication with JWT and bcrypt password hashing
- Role-based access control (Admin, Manager, Requester)
- Create and track workflow requests
- Admins and managers can approve, reject, or update request status
- Requesters only see their own submissions
- Persistent data with PostgreSQL via Supabase

## Tech Stack

**Frontend**
- React + TypeScript
- Tailwind CSS
- React Router
- Axios

**Backend**
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Authentication
- bcryptjs

**Deployment**
- Render (server + static site)
- Supabase (managed PostgreSQL)

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account and project

### Installation

1. Clone the repo
```bash
   git clone https://github.com/himynameismoose/opsflow.git
   cd opsflow
```

2. Set up the server
```bash
   cd server
   npm install
```

3. Create `server/.env`:
```
DATABASE_URL=your_supabase_pooler_url
DIRECT_URL=your_supabase_direct_url
JWT_SECRET=your_jwt_secret
PORT=8080
CLIENT_URL=http://localhost:5173
```

4. Run database migrations
```bash
   npx prisma migrate dev
```

5. Start the server
```bash
   npm run dev
```

6. Set up the client
```bash
   cd ../client
   npm install
```

7. Create `client/.env`:
```
VITE_API_URL=http://localhost:8080
```

8. Start the client
```bash
   npm run dev
```

9. Open `http://localhost:5173`

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@opsflow.com | password123 |
| Requester | test@opsflow.com | password123 |

## Project Structure

```text
opsflow/
├── client/                  # React + TypeScript frontend
│   └── src/
│       ├── context/         # Auth context
│       ├── lib/             # Axios instance
│       └── pages/           # Login, Register, Dashboard
└── server/                  # Node.js + Express backend
    └── src/
        ├── controllers/
        ├── middleware/
        ├── routes/
        └── lib/
