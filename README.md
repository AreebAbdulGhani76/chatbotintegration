# Aureon Sites — AI Chatbot Integration

An intelligent, context-aware AI chatbot assistant (**Cognos**) built for **Aureon Sites**, providing home service contractors (HVAC, Plumbing, Electrical, Roofing, etc.) with real-time answers about website packages, pricing, timelines, and services.

Powered by Google's **Gemini 3.8 Flash** with a rich grounded knowledge base.

---

## 🚀 Features

- **Gemini 3.8 Flash**: Fast, polite, and accurate customer support assistant.
- **Contractor Knowledge Base**: Pre-loaded with comprehensive service details, plans (Foundation, Growth, Scale), FAQs, and consultation booking links.
- **Responsive Floating Chat Widget**: Interactive chat with typing indicators, quick chip prompts, message formatting, and clean UI animations.
- **Python HTTP Server**: Lightweight zero-dependency backend server (`server.py`) handling API requests and serving static assets.
- **Secure Configuration**: `.env` powered credentials handling to prevent exposing API keys.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Python 3.10+
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
GEMINI_MODEL=gemini-3.8-flash
```

### 3. Run the Server
```bash
python server.py
```

Open your browser and visit:
```
http://localhost:8080
```

---

## 📂 Project Structure

```text
├── index.html                  # Landing page & floating chatbot UI
├── styles.css                  # UI styling & animations
├── script.js                   # Client-side chatbot logic & API handler
├── server.py                   # Python server & Gemini API integration
├── company_knowledge_base.md   # Grounding data for Cognos
├── .env.example                # Environment variables template
└── .gitignore                  # Git ignore rules
```
