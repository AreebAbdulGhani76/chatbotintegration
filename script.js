/**
 * Aureon Sites — Interactive Engine
 * Handles preview switcher, interactive ROI calculator, booking modal, mobile drawer, and form submissions.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Header Scroll Shadow
  // --------------------------------------------------------------------------
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // --------------------------------------------------------------------------
  // 2. Mobile Drawer Navigation
  // --------------------------------------------------------------------------
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      menuToggle.classList.toggle('active');
      mobileDrawer.classList.toggle('open');
      mobileDrawer.setAttribute('aria-hidden', isExpanded);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 3. Hero Interactive Preview Switcher
  // --------------------------------------------------------------------------
  const previewData = {
    hvac: {
      url: 'yourhvacpros.com',
      rating: '★★★★★ 4.9 · 312 reviews',
      tag: 'Licensed & Insured',
      headline: 'Same-Day HVAC Repair in Albuquerque',
      desc: 'Licensed master technicians. Upfront flat-rate pricing. Call before 3pm for guaranteed same-day dispatch.',
      phone: '(505) 555-0199',
      status: '⚡ Tech on duty now'
    },
    plumbing: {
      url: 'rapidplumbingnm.com',
      rating: '★★★★★ 5.0 · 284 reviews',
      tag: '24/7 Emergency Service',
      headline: 'Emergency Plumbing & Rapid Drain Clearing',
      desc: 'Zero overtime rates on weekends. Guaranteed 45-minute response for active water leaks and backups.',
      phone: '(505) 555-0144',
      status: '💧 3 service trucks active'
    },
    roofing: {
      url: 'highdesertroofs.com',
      rating: '★★★★★ 4.9 · 198 reviews',
      tag: '50-Yr Warranty Certified',
      headline: 'Free Drone Roof & Hail Damage Inspections',
      desc: 'Local insurance restoration pros. Direct insurance claim billing with zero upfront out-of-pocket hassle.',
      phone: '(505) 555-0177',
      status: '🛡️ Free inspections today'
    },
    electrical: {
      url: 'voltmasterelectric.com',
      rating: '★★★★★ 5.0 · 246 reviews',
      tag: 'Master Electrician',
      headline: 'Electrical Panel Upgrades & EV Chargers',
      desc: 'Upfront estimates on all residential rewire, lighting, and heavy-up electrical panel upgrades.',
      phone: '(505) 555-0122',
      status: '⚡ Free quote in 60 secs'
    }
  };

  const previewTabs = document.querySelectorAll('.preview-tabs .tab-btn');
  const previewUrl = document.getElementById('preview-url');
  const previewHeadline = document.getElementById('preview-headline');
  const previewDesc = document.getElementById('preview-desc');
  const previewCta = document.getElementById('preview-cta');
  const previewScreen = document.getElementById('preview-screen');

  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const industry = tab.getAttribute('data-industry');
      const data = previewData[industry];
      if (!data) return;

      // Update active state
      previewTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Subtle fade animation
      previewScreen.style.opacity = '0.3';
      previewScreen.style.transform = 'scale(0.98)';

      setTimeout(() => {
        if (previewUrl) previewUrl.textContent = data.url;
        if (previewHeadline) previewHeadline.textContent = data.headline;
        if (previewDesc) previewDesc.textContent = data.desc;
        if (previewCta) {
          previewCta.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call ${data.phone}
          `;
          previewCta.href = `tel:${data.phone.replace(/[^0-9+]/g, '')}`;
        }
        const dispatchTag = previewScreen.querySelector('.dispatch-tag');
        if (dispatchTag) dispatchTag.textContent = data.status;

        const ratingBadge = previewScreen.querySelector('.rating-badge');
        if (ratingBadge) ratingBadge.textContent = data.rating;

        const licenseBadge = previewScreen.querySelector('.license-badge');
        if (licenseBadge) licenseBadge.textContent = data.tag;

        previewScreen.style.opacity = '1';
        previewScreen.style.transform = 'scale(1)';
      }, 150);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Interactive ROI Calculator
  // --------------------------------------------------------------------------
  const ticketSlider = document.getElementById('ticket-slider');
  const jobsSlider = document.getElementById('jobs-slider');
  const ticketDisplay = document.getElementById('ticket-display');
  const jobsDisplay = document.getElementById('jobs-display');
  const resMonthly = document.getElementById('res-monthly');
  const resAnnual = document.getElementById('res-annual');

  function formatCurrency(num) {
    return '$' + num.toLocaleString();
  }

  function updateCalculator() {
    if (!ticketSlider || !jobsSlider) return;
    const ticketVal = parseInt(ticketSlider.value, 10);
    const jobsVal = parseInt(jobsSlider.value, 10);

    const monthlyTotal = ticketVal * jobsVal;
    const annualTotal = monthlyTotal * 12;

    if (ticketDisplay) ticketDisplay.textContent = formatCurrency(ticketVal);
    if (jobsDisplay) jobsDisplay.textContent = `${jobsVal} ${jobsVal === 1 ? 'job' : 'jobs'}`;
    if (resMonthly) resMonthly.textContent = formatCurrency(monthlyTotal);
    if (resAnnual) resAnnual.textContent = formatCurrency(annualTotal);
  }

  if (ticketSlider && jobsSlider) {
    ticketSlider.addEventListener('input', updateCalculator);
    jobsSlider.addEventListener('input', updateCalculator);
    updateCalculator();
  }

  // --------------------------------------------------------------------------
  // 5. Booking Modal System
  // --------------------------------------------------------------------------
  const bookingModal = document.getElementById('booking-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBookingForm = document.getElementById('modal-booking-form');
  const modalSuccessState = document.getElementById('modal-success-state');
  const modalDoneBtn = document.getElementById('modal-done-btn');
  const selectedPlanInput = document.getElementById('selected-plan-input');
  const openBookingBtns = document.querySelectorAll('.open-booking-btn');

  function openModal(planName = 'General') {
    if (!bookingModal) return;
    if (selectedPlanInput) selectedPlanInput.value = planName;
    if (modalBookingForm) {
      modalBookingForm.style.display = 'grid';
      modalBookingForm.reset();
    }
    if (modalSuccessState) {
      modalSuccessState.style.display = 'none';
    }
    bookingModal.classList.add('open');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!bookingModal) return;
    bookingModal.classList.remove('open');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBookingBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.getAttribute('data-plan') || 'General';
      openModal(plan);
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingModal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  if (modalBookingForm) {
    modalBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      modalBookingForm.style.display = 'none';
      if (modalSuccessState) {
        modalSuccessState.style.display = 'block';
      }
      showToast('✓ Fit call requested! Confirmation email sent.');
    });
  }

  // --------------------------------------------------------------------------
  // 6. Inline Contact / Lead Form Handler
  // --------------------------------------------------------------------------
  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = leadForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending request...</span>';

      setTimeout(() => {
        submitBtn.innerHTML = '<span>✓ Request sent — we\'ll be in touch</span>';
        submitBtn.style.backgroundColor = '#0b6e72';
        showToast('✓ Request sent! Our team will contact you within 1 business day.');
        leadForm.reset();

        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          submitBtn.style.backgroundColor = '';
        }, 5000);
      }, 700);
    });
  }

  // --------------------------------------------------------------------------
  // 7. Toast Notification Helper
  // --------------------------------------------------------------------------
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // --------------------------------------------------------------------------
  // 8. Aureon AI Chatbot (Powered by Gemini 3.8 Flash)
  // --------------------------------------------------------------------------
  const chatLauncher = document.getElementById('chat-launcher');
  const chatWindow = document.getElementById('chat-window');
  const chatCloseBtn = document.getElementById('chat-close-btn');
  const chatResetBtn = document.getElementById('chat-reset-btn');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatTyping = document.getElementById('chat-typing');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatChips = document.querySelectorAll('.chat-chip');

  let conversationHistory = [];

  function openChat() {
    if (!chatWindow) return;
    chatWindow.classList.add('open');
    chatWindow.setAttribute('aria-hidden', 'false');
    chatLauncher.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      if (chatInput) chatInput.focus();
    }, 200);
  }

  function closeChat() {
    if (!chatWindow) return;
    chatWindow.classList.remove('open');
    chatWindow.setAttribute('aria-hidden', 'true');
    chatLauncher.setAttribute('aria-expanded', 'false');
  }

  if (chatLauncher) {
    chatLauncher.addEventListener('click', () => {
      if (chatWindow.classList.contains('open')) {
        closeChat();
      } else {
        openChat();
      }
    });
  }

  if (chatCloseBtn) chatCloseBtn.addEventListener('click', closeChat);

  if (chatResetBtn) {
    chatResetBtn.addEventListener('click', () => {
      conversationHistory = [];
      if (chatMessages) {
        chatMessages.innerHTML = `
          <div class="chat-msg bot">
            <div class="msg-bubble">
              <p>Hello and welcome to <strong>Aureon Sites</strong>! How may I be of service to your business today?</p>
            </div>
            <span class="msg-time">Just now</span>
          </div>
        `;
      }
      showToast('Conversation reset.');
    });
  }

  // Quick Chips
  chatChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt && chatInput) {
        chatInput.value = prompt;
        sendMessage(prompt);
      }
    });
  });

  // Markdown Formatter helper
  function formatMarkdown(text) {
    if (!text) return '';
    let formatted = text
      // Escape HTML tags to prevent XSS
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Markdown links [text](url)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Plain URLs into links if not already linked
      .replace(/(?<!href=")(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Handle bullet points
    const lines = formatted.split('\n');
    let inList = false;
    let result = [];

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        if (!inList) {
          result.push('<ul>');
          inList = true;
        }
        result.push(`<li>${trimmed.substring(2)}</li>`);
      } else {
        if (inList) {
          result.push('</ul>');
          inList = false;
        }
        if (trimmed.length > 0) {
          result.push(`<p>${line}</p>`);
        }
      }
    }
    if (inList) result.push('</ul>');

    return result.join('');
  }

  function appendMessage(sender, text) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    if (sender === 'user') {
      const p = document.createElement('p');
      p.textContent = text;
      bubble.appendChild(p);
    } else {
      bubble.innerHTML = formatMarkdown(text);
    }

    const timeSpan = document.createElement('span');
    timeSpan.className = 'msg-time';
    timeSpan.textContent = timeStr;

    msgDiv.appendChild(bubble);
    msgDiv.appendChild(timeSpan);
    chatMessages.appendChild(msgDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    // Append user message to UI
    appendMessage('user', cleanText);
    if (chatInput) chatInput.value = '';

    // Update conversation history
    conversationHistory.push({ sender: 'user', text: cleanText });

    // Show typing indicator
    if (chatTyping) chatTyping.style.display = 'flex';
    if (chatSendBtn) chatSendBtn.disabled = true;
    if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanText,
          history: conversationHistory.slice(0, -1)
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const resData = await response.json();
      const reply = resData.reply || "I apologize, but I could not formulate a response. Please feel free to book a fit call with our human team.";

      if (chatTyping) chatTyping.style.display = 'none';
      appendMessage('bot', reply);
      conversationHistory.push({ sender: 'bot', text: reply });

    } catch (err) {
      console.error('Chat error:', err);
      if (chatTyping) chatTyping.style.display = 'none';
      appendMessage(
        'bot',
        "I apologize for the inconvenience, but I am momentarily having difficulty connecting to my knowledge server. Please feel free to schedule a complimentary 15-minute consultation directly with our team at [Book Fit Call](https://cal.com/wesley-webbert-w6lbm1/60-min) or call us at (505) 555-0199."
      );
    } finally {
      if (chatSendBtn) chatSendBtn.disabled = false;
      if (chatInput) chatInput.focus();
    }
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (chatInput) {
        sendMessage(chatInput.value);
      }
    });
  }
});
