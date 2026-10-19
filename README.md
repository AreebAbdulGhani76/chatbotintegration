# Aureon Sites — AI Chatbot Integration

An intelligent, context-aware AI chatbot assistant (**Cognos**) built for **Aureon Sites**, providing home service contractors (HVAC, Plumbing, Electrical, Roofing, etc.) with real-time answers about website packages, pricing, timelines, and services.

Powered by Google's **Gemini AI (with multi-model automatic fallback)** and a rich grounded knowledge base.

🌐 **Live Demo:** [https://chatbotintegration.vercel.app/](https://chatbotintegration.vercel.app/)

---

## 🚀 Features

- **Gemini Flash Engine**: Fast, polite, and accurate customer support assistant with auto-failover against high demand spikes.
- **Contractor Knowledge Base**: Pre-loaded with comprehensive service details, plans (Foundation, Growth, Scale), FAQs, and consultation booking links.
- **Responsive Floating Chat Widget**: Interactive chat with typing indicators, quick chip prompts, Markdown formatting, and modern UI animations.
- **Dual Deployment Ready**:
  - **Local Development**: Zero-dependency Python server (`server.py`) with static file serving and API routing.
  - **Cloud Serverless (Vercel)**: Zero-config Node.js Serverless Function (`api/chat.js`) designed for high availability and instant scale.
- **Secure Configuration**: Environment variables handling to protect API keys both locally and in production.

---

## 🛠️ Local Development

### 1. Prerequisites
- Python 3.10+ (or Node.js 18+)
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 2. Environment Setup
Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```ini
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8080
GEMINI_MODEL=gemini-3.5-flash
```

### 3. Run Locally
```bash
python server.py
```

Open your browser and visit:
```text
http://localhost:8080
```

---

## ☁️ Deployment on Vercel

The project is pre-configured with Vercel Serverless Functions (`api/chat.js`) and `vercel.json`.

### Steps to Deploy:
1. Push this repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Under **Project Settings > Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API Key)*
   - `GEMINI_MODEL`: `gemini-3.8-flash` *(Optional, defaults to gemini-3.8-flash)*
4. Click **Deploy** (or **Redeploy** if already connected).

---

## 📂 Project Structure

```text
├── api/
│   └── chat.js                 # Vercel Serverless Function for /api/chat
├── index.html                  # Landing page & floating chatbot UI
├── styles.css                  # UI styling & animations
├── script.js                   # Client-side chatbot logic & API handler
├── server.py                   # Local Python server & Gemini API integration
├── company_knowledge_base.md   # Grounding knowledge base for Cognos
├── vercel.json                 # Vercel deployment configuration
├── .env.example                # Environment variables template
└── .gitignore                  # Git ignore rules
```

---

## 📄 License
MIT License. Created for Aureon Sites.
