import http.server
import socketserver
import json
import urllib.request
import urllib.error
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Helper to load .env variables without external dependencies
def load_env():
    env_path = os.path.join(BASE_DIR, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")

load_env()

PORT = int(os.environ.get("PORT", 8080))
API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")

# Load company knowledge base
KNOWLEDGE_FILE = os.path.join(BASE_DIR, "company_knowledge_base.md")
knowledge_base_text = ""
if os.path.exists(KNOWLEDGE_FILE):
    with open(KNOWLEDGE_FILE, "r", encoding="utf-8") as f:
        knowledge_base_text = f.read()

SYSTEM_INSTRUCTION = f"""You are Cognos, the polite, courteous, and articulate AI Assistant for Aureon Sites (www.aureonsites.com).
You assist home service business owners (HVAC, Plumbing, Electrical, Roofing, Landscaping, Cleaning, Pest Control, Garage Doors, etc.) in understanding Aureon's done-for-you website services.

TONE & BEHAVIOR (COGNOS):
- Name: Cognos.
- Demeanor: Warm, polite, respectful, and articulate.
- CRITICAL LENGTH & COMPLETION RULE: Keep answers concise, digestible, and scannable (around 150-250 words with clean bullet points). Always finish all sentences, thoughts, and closing links completely. Never stop abruptly or leave an unfinished sentence.
- Respect the contractor's busy time: answer their specific question directly first, with just the essential details they need.

KNOWLEDGE BASE:
{knowledge_base_text}

CORE RULES FOR COMMON QUESTIONS:
1. GREETINGS (e.g. "hi", "hello", "hey"):
   - Respond warmly and concisely:
     "Hello and Welcome to Aureon Sites! I am Cognos, and I am absolutely delighted to assist you today. How may I help you with your website or business?"

2. PRICING & SERVICE QUESTIONS (e.g. "How much does a website cost?" or "How much does plumbing cost?"):
   - If a user asks "how much does plumbing/HVAC/etc. cost?", gently clarify that Aureon builds and manages websites for trade contractors, not the trade work itself.
   - Present the 3 plans concisely:
     • **Foundation**: $197/mo (+$497 setup) — Up to 3 edits/mo, fast SSD hosting, SSL, backups, email support.
     • **Growth** *(Most Popular)*: $497/mo (+$997 setup) — **Unlimited** edits (<24h turnaround), seasonal specials, local SEO, Google Business Profile sync, monthly reporting.
     • **Scale**: $997/mo (+custom setup) — Multi-truck fleets, custom PPC landing pages, priority same-day edits, CRM integration.
   - Highlight: Strictly month-to-month (no 12-month lock-in), 30-day money-back guarantee, and 100% client ownership.
   - End with a polite invitation: "Would you like to schedule a free 15-minute fit call to see what we can do for your business? [Book Fit Call](https://cal.com/wesley-webbert-w6lbm1/60-min) or call (505) 555-0199."

3. SPEED / LAUNCH:
   - Live in 7 business days following a 10-minute intake form.

4. EDITS:
   - Unlimited on Growth/Scale, completed in under 24 hours. Just email or text our team.
"""

class AureonRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_POST(self):
        if self.path == "/api/chat":
            self.handle_chat()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_chat(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode("utf-8"))

            user_message = body.get("message", "").strip()
            history = body.get("history", [])

            if not user_message:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Message is required"}).encode("utf-8"))
                return

            # Format conversation for Gemini API
            contents = []
            for item in history:
                role = "user" if item.get("sender") == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": item.get("text", "")}]
                })
            
            # Append latest user message
            contents.append({
                "role": "user",
                "parts": [{"text": user_message}]
            })

            # Prepare Gemini 3.8 Flash request payload
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"
            payload = {
                "systemInstruction": {
                    "parts": [{"text": SYSTEM_INSTRUCTION}]
                },
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.6,
                    "maxOutputTokens": 2048,
                    "topP": 0.95
                }
            }

            req = urllib.request.Request(
                gemini_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )

            with urllib.request.urlopen(req, timeout=30) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                candidates = res_data.get("candidates", [])
                if candidates:
                    reply_text = candidates[0]["content"]["parts"][0]["text"]
                else:
                    reply_text = "I'm here to help, but I couldn't generate a response. Please feel free to book a call with our team at https://cal.com/wesley-webbert-w6lbm1/60-min."

            # Send back JSON response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"reply": reply_text}).encode("utf-8"))

        except Exception as e:
            print("Chat API Error:", str(e))
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({
                "error": "Failed to communicate with AI",
                "details": str(e)
            }).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AureonRequestHandler) as httpd:
        print(f"Server started on http://localhost:{PORT}")
        print(f"Chatbot powered by {MODEL} loaded with company_knowledge_base.md")
        httpd.serve_forever()
