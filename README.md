# CareerPath Kenya – Frontend

React + TypeScript + Tailwind CSS frontend for the KCSE Career Guidance System.

## Requirements
- Node.js 18+
- Backend Django server running on `http://localhost:8000`

## Setup

```bash
cd frontend
npm install
npm run dev
```

The app will start at **http://localhost:3000** and proxy API requests to the Django backend.

## Features
- 🔐 JWT Authentication (Login / Register / Logout)
- 👤 Student Profile management
- 📚 KCSE Grades entry & statistics
- 🧠 Psychometric Assessment (RIASEC + Big Five)
- 📊 Cluster Point Calculator
- 💼 Career Paths browser
- 🏫 Courses & Institutions browser

## Environment
Copy `.env` and adjust the API URL if needed:
```
VITE_API_URL=http://localhost:8000
```
