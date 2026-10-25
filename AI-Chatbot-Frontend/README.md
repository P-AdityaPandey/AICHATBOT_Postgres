# AI Chatbot Frontend

React + Vite frontend for the AI-Powered Chatbot Application.

## Requirements
- Node.js 20+ (Node 22 LTS recommended)
- Backend running at `http://localhost:8080`

## Run locally
```bash
npm install
copy .env.example .env
npm run dev
```
Open http://localhost:5173.

Set `VITE_API_BASE_URL` in `.env` if your backend API has a different base URL. Never put OpenAI or Gemini API keys in frontend environment variables.

## Features
- OpenAI GPT / Google Gemini provider selector
- Conversation sidebar, create/select/delete sessions
- Persistent chat messages through backend REST APIs
- Loading state, errors, starter prompts, responsive UI

The UI expects the API contract documented in the backend README.
