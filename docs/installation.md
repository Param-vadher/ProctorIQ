# Installation Guide

ProctorIQ is designed to be easily deployed on any modern hosting environment. You can deploy it using Docker (recommended) or set it up manually on a Node.js server.

## Prerequisites
- Node.js 18.x or 20.x (if not using Docker)
- MongoDB 6.0+
- Docker and Docker Compose (if using Docker)

## Option 1: Docker Deployment (Recommended)

1. Clone the repository and enter the directory.
2. Copy `.env.example` files to `.env` in both `/backend` and `/frontend` and fill in your details.
3. Run the following command:
   ```bash
   docker-compose up -d --build
   ```
4. The frontend will be available at `http://localhost` and the backend at `http://localhost:5000`.

## Option 2: Manual Deployment

### Backend Setup
1. `cd backend`
2. `npm install`
3. `cp .env.example .env` and configure your environment variables.
4. `npm run build`
5. `npm start` (or use PM2: `pm2 start dist/server.js`)

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `cp .env.example .env` and set `VITE_API_URL` to your production backend URL.
4. `npm run build`
5. Serve the `/dist` directory using Nginx, Apache, or any static file host.
