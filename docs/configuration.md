# Configuration Guide

ProctorIQ uses environment variables for configuration. Below is a detailed explanation of each required setting.

## Backend Configuration (`backend/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | The port the backend server runs on | No | `5000` |
| `FRONTEND_URL` | The URL of the deployed frontend (used for CORS) | Yes | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens. Must be long and random. | Yes | - |
| `GEMINI_API_KEY` | Your Google Gemini AI API key for cheat detection | Yes | - |
| `ADMIN_EMAIL` | Email used to seed the initial admin account | Yes | - |
| `ADMIN_PASSWORD` | Password for the initial admin account | Yes | - |

## Frontend Configuration (`frontend/.env`)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | The URL of the deployed backend API | Yes | `http://localhost:5000/api` |
