const fs = require('fs');
const path = require('path');

// Fallback knowledge base in case file bundling is isolated
const FALLBACK_KNOWLEDGE_BASE = `
# Aureon Sites — Company Overview
- Tagline: Done-For-You Websites for Local Service Businesses (HVAC, Plumbing, Electrical, Roofing, Landscaping, Cleaning, Pest Control, Garage Doors).
- Primary Website: https://www.aureonsites.com
- Contact Email: hello@aureon.com | Direct Phone: (505) 555-0199
- Fit Call Booking: https://cal.com/wesley-webbert-w6lbm1/60-min

## Core Plans (Month-to-month, strictly no 12-month lock-in):
1. Foundation: $197/mo (+$497 setup) — Up to 3 edits/mo, SSD cloud hosting, SSL, daily backups, direct email support.
2. Growth (Most Popular): $497/mo (+$997 setup) — Unlimited edits (<24h turnaround), seasonal specials, local SEO & Google Business Profile sync, monthly ROI report.
3. Scale: $997/mo (+custom setup) — For fleets/multi-location, dedicated PPC landing pages, priority same-day edits, CRM integration (Jobber, ServiceTitan).

## Guarantees & Ownership:
- 100% Client Ownership: Client owns domain, content, design. No hostage fees.
- 30-Day Money-Back Guarantee: Full refund if not completely satisfied in first 30 days.
- Turnaround: Live in 7 business days following a 10-minute intake. Edits under 24 hours.
`;

function getKnowledgeBase() {
  try {
    const filePath = path.join(process.cwd(), 'company_knowledge_base.md');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content && content.length > 100) return content;
    }
  } catch (err) {
    console.warn('Failed to read company_knowledge_base.md from disk:', err);
  }
  return FALLBACK_KNOWLEDGE_BASE;
}

const SYSTEM_INSTRUCTION = `You are Cognos, the polite, courteous, and articulate AI Assistant for Aureon Sites (www.aureonsites.com).
You assist home service business owners (HVAC, Plumbing, Electrical, Roofing, Landscaping, Cleaning, Pest Control, Garage Doors, etc.) in understanding Aureon's done-for-you website services.

TONE & BEHAVIOR (COGNOS):
- Name: Cognos.
- Demeanor: Warm, polite, respectful, and articulate.
- CRITICAL LENGTH & COMPLETION RULE: Keep answers concise, digestible, and scannable (around 150-250 words with clean bullet points). Always finish all sentences, thoughts, and closing links completely. Never stop abruptly or leave an unfinished sentence.
- Respect the contractor's busy time: answer their specific question directly first, with just the essential details they need.

KNOWLEDGE BASE:
${getKnowledgeBase()}

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
`;

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    body = body || {};
    const userMessage = (body.message || '').trim();
    const history = body.history || [];

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Missing GEMINI_API_KEY environment variable. Please configure it in your Vercel Project Settings (Settings -> Environment Variables).'
      });
    }
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

    // Format history
    const contents = [];
    for (const item of history) {
      const role = item.sender === 'user' ? 'user' : 'model';
      contents.push({
        role: role,
        parts: [{ text: item.text || '' }]
      });
    }

    // Append latest user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const payload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2048,
        topP: 0.95
      }
    };

    const modelsToTry = [
      process.env.GEMINI_MODEL,
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest'
    ].filter(Boolean);
    const uniqueModels = [...new Set(modelsToTry)];

    let replyText = '';
    let lastError = null;

    for (const m of uniqueModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!geminiRes.ok) {
          const errText = await geminiRes.text();
          console.warn(`Model ${m} returned HTTP ${geminiRes.status}: ${errText.slice(0, 150)}`);
          lastError = errText;
          continue;
        }

        const data = await geminiRes.json();
        const candidates = data.candidates || [];
        if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
          replyText = candidates[0].content.parts.map(p => p.text).join('\n');
          break;
        }
      } catch (err) {
        console.warn(`Error connecting to model ${m}:`, err.message);
        lastError = err.message;
      }
    }

    if (!replyText) {
      if (lastError) {
        return res.status(500).json({
          error: 'Failed to communicate with AI',
          details: lastError
        });
      }
      replyText = "I'm here to help, but I couldn't generate a response. Please feel free to book a call with our team at https://cal.com/wesley-webbert-w6lbm1/60-min.";
    }

    return res.status(200).json({ reply: replyText });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      details: err.message
    });
  }
};
