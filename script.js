/**
 * Storm Pros Roofing & Restoration LLC
 * script.js — Main JavaScript
 * Features: Nav, scroll animations, estimator, chatbot, form smart tips
 */

'use strict';

/* ============================================================
   1. NAVIGATION — Sticky + Mobile Hamburger
   ============================================================ */
(function initNav() {
  const header    = document.getElementById('navHeader');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Scrolled state
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav on link click (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Hide chat badge after 4 seconds
  setTimeout(() => {
    const badge = document.getElementById('chatBadge');
    if (badge) badge.style.display = 'none';
  }, 8000);
})();


/* ============================================================
   2. SCROLL REVEAL — Intersection Observer
   ============================================================ */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger based on --delay CSS var if set
        const delay = entry.target.style.getPropertyValue('--delay') || '0s';
        entry.target.style.transitionDelay = delay;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   3. ROOF COST ESTIMATOR — AI-Powered Calculator
   ============================================================ */
(function initEstimator() {
  // Base cost per square foot by type
  const BASE_COST = {
    shingle: { low: 4.5, mid: 6.5, high: 9.5 },
    metal:   { low: 8.0, mid: 11.5, high: 16.0 },
    repair:  { low: 0.4, mid: 0.7, high: 1.1 }
  };

  // Pitch multipliers
  const PITCH_MULT = { low: 1.0, medium: 1.15, steep: 1.35 };

  let currentType  = 'shingle';
  let currentPitch = 'medium';
  let currentStorm = 'no';

  const roofSizeSlider = document.getElementById('roofSize');
  const roofSizeVal    = document.getElementById('roofSizeVal');
  const resultPrice    = document.getElementById('resultPrice');
  const resultNote     = document.getElementById('resultNote');
  const resultInsurance = document.getElementById('resultInsurance');

  function formatNum(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function calcEstimate() {
    const sqft = parseInt(roofSizeSlider.value, 10);
    const costs = BASE_COST[currentType];
    const pitchMult = PITCH_MULT[currentPitch];
    const low  = sqft * costs.low  * pitchMult;
    const high = sqft * costs.high * pitchMult;

    resultPrice.textContent = `${formatNum(low)} – ${formatNum(high)}`;

    const typeLabels = { shingle: 'shingle', metal: 'metal', repair: 'repair-only' };
    const pitchLabels = { low: 'low pitch', medium: 'medium pitch', steep: 'steep pitch' };
    resultNote.textContent =
      `Based on ${sqft.toLocaleString()} sq ft ${typeLabels[currentType]} roof, ${pitchLabels[currentPitch]}`;

    resultInsurance.style.display = currentStorm === 'yes' ? 'flex' : 'none';
  }

  // Slider
  if (roofSizeSlider) {
    roofSizeSlider.addEventListener('input', () => {
      const v = parseInt(roofSizeSlider.value, 10);
      roofSizeVal.textContent = v.toLocaleString() + ' sq ft';
      calcEstimate();
    });
  }

  // Tab buttons handler
  function setupTabs(selector, paramName) {
    document.querySelectorAll(selector).forEach(btn => {
      btn.addEventListener('click', () => {
        // Deactivate siblings
        btn.parentElement.querySelectorAll('.est-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (paramName === 'type')  currentType  = btn.dataset.type;
        if (paramName === 'pitch') currentPitch = btn.dataset.pitch;
        if (paramName === 'storm') currentStorm = btn.dataset.storm;
        calcEstimate();
      });
    });
  }

  setupTabs('[data-type]', 'type');
  setupTabs('[data-pitch]', 'pitch');
  setupTabs('[data-storm]', 'storm');

  calcEstimate(); // initial render
})();


/* ============================================================
   4. SMART FORM — Auto tips + validation
   ============================================================ */
(function initSmartForm() {
  const form      = document.getElementById('contactForm');
  const success   = document.getElementById('formSuccess');
  const smartTip  = document.getElementById('smartTip');
  const tipText   = document.getElementById('smartTipText');
  const serviceEl = document.getElementById('service');
  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const nameHint  = document.getElementById('nameHint');
  const phoneHint = document.getElementById('phoneHint');

  // Smart tips based on service selection
  const TIPS = {
    'free-inspection': '🎉 Great choice! Our free inspection takes about 45 minutes and includes a full damage report. We can usually schedule within 24 hours.',
    'roof-repair': '⚡ Most repairs are completed same-day or next-day. If you have storm damage, your insurance may cover the full cost!',
    'shingle-roof': '🏠 Shingle replacements typically take 1-2 days. We offer a variety of architectural shingles with 30-50 year warranties.',
    'metal-roof': '⚡ Metal roofs last 40-70 years and can reduce energy bills by up to 25%. They\'re the best long-term investment for Texas homes.',
    'insurance-claim': '📋 We\'ve successfully handled hundreds of insurance claims. Most homeowners pay $0 out of pocket. We handle everything!',
    'other': '📞 No problem! One of our roofing experts will call you to discuss your specific needs.'
  };

  serviceEl.addEventListener('change', () => {
    const tip = TIPS[serviceEl.value];
    if (tip) {
      tipText.textContent = tip;
      smartTip.style.display = 'flex';
    } else {
      smartTip.style.display = 'none';
    }
  });

  // Phone formatter
  phoneInput.addEventListener('input', () => {
    let val = phoneInput.value.replace(/\D/g, '');
    if (val.length >= 10) {
      val = `(${val.slice(0,3)}) ${val.slice(3,6)}-${val.slice(6,10)}`;
    }
    phoneInput.value = val;
  });

  // Name capitalization hint
  nameInput.addEventListener('blur', () => {
    const v = nameInput.value.trim();
    if (v && v.length > 1) {
      const capitalized = v.replace(/\b\w/g, c => c.toUpperCase());
      nameInput.value = capitalized;
    }
  });

  // Form validation
  function validateField(input, hint) {
    if (!input.value.trim()) {
      input.style.borderColor = '#ef4444';
      if (hint) hint.textContent = 'This field is required.';
      return false;
    }
    input.style.borderColor = '#22c55e';
    if (hint) hint.textContent = '';
    return true;
  }

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    valid = validateField(nameInput, nameHint) && valid;
    valid = validateField(phoneInput, phoneHint) && valid;

    if (!serviceEl.value) {
      serviceEl.style.borderColor = '#ef4444';
      valid = false;
    } else {
      serviceEl.style.borderColor = '#22c55e';
    }

    if (!valid) return;

    // Simulate form submission (replace with real endpoint)
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.style.display = 'none';
      success.style.display = 'block';

      // Scroll to success
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1200);
  });

  // Real-time validation on blur
  [nameInput, phoneInput].forEach((input, i) => {
    const hints = [nameHint, phoneHint];
    input.addEventListener('blur', () => validateField(input, hints[i]));
  });
})();


/* ============================================================
   5. AI CHATBOT — Smart Response Engine
   ============================================================ */
(function initChatbot() {
  const trigger  = document.getElementById('chatbotTrigger');
  const window_  = document.getElementById('chatbotWindow');
  const closeBtn = document.getElementById('chatClose');
  const messages = document.getElementById('chatMessages');
  const input    = document.getElementById('chatInput');
  const sendBtn  = document.getElementById('chatSend');
  const quickReplies = document.getElementById('quickReplies');

  if (!trigger) return;

  let isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    window_.style.display = isOpen ? 'flex' : 'none';
    window_.style.flexDirection = 'column';
    if (isOpen) input.focus();
  }

  trigger.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  // Knowledge base for the chatbot
  const KB = {
    'free-inspection': {
      keywords: ['inspection', 'inspect', 'free', 'look', 'check', 'assess', 'damage'],
      response: "🔍 **Free Roof Inspection** — We offer completely FREE roof inspections!\n\nOur inspector will:\n• Check for storm/hail damage\n• Assess your roof's condition\n• Provide a detailed report\n• Help with insurance claims\n\nInspections usually take 45-60 minutes. Ready to schedule? Call **(936) 204-0141** or fill out the contact form!"
    },
    'pricing': {
      keywords: ['price', 'cost', 'how much', 'pricing', 'estimate', 'quote', 'charge', 'expensive', 'affordable'],
      response: "💰 **Our Pricing Ranges:**\n\n🔧 Roof Repair: $250 – $5,000\n🏠 Shingle Roof: $5,000 – $100,000\n⚡ Metal Roof: $10,000 – $100,000\n🔍 Inspection: **FREE!**\n\nExact pricing depends on roof size, materials, and damage extent. Use our **Cost Estimator** on this page for a quick estimate, or call us for an accurate free quote!"
    },
    'insurance': {
      keywords: ['insurance', 'claim', 'adjuster', 'deductible', 'covered', 'policy', 'pay', 'hail', 'storm damage'],
      response: "📋 **Insurance Claims — We Handle It All!**\n\nWe specialize in insurance-funded projects:\n\n✅ We document all damage\n✅ Work directly with your adjuster\n✅ Most homeowners pay **$0 out of pocket**\n✅ We've handled hundreds of successful claims\n\nDon't wait — storm damage gets worse. Call us at **(936) 204-0141** today!"
    },
    'schedule': {
      keywords: ['schedule', 'appointment', 'book', 'when', 'availability', 'today', 'tomorrow', 'soon', 'quickly', 'fast'],
      response: "📅 **Scheduling is Easy!**\n\nWe're available:\n🕐 Mon–Fri: 7AM–6PM\n⚡ Emergency: 24/7\n\nFor fastest response:\n📞 Call/Text: **(936) 204-0141)**\n📝 Or fill out the contact form below\n\nWe typically respond within 1 hour and can often do same-day inspections!"
    },
    'shingle': {
      keywords: ['shingle', 'asphalt', 'architectural', '3-tab'],
      response: "🏠 **Shingle Roofing ($5,000 – $100,000)**\n\nWe install premium architectural shingles:\n• Multiple colors and styles\n• 30-50 year manufacturer warranties\n• Full tear-off and disposal\n• Typically completed in 1-2 days\n\nMost shingle replacements after storm damage are **fully covered by insurance**! Get a free inspection to find out."
    },
    'metal': {
      keywords: ['metal', 'standing seam', 'tin', 'steel', 'aluminum'],
      response: "⚡ **Metal Roofing ($10,000 – $100,000)**\n\nMetal roofs are the premium choice:\n• 40-70 year lifespan\n• Withstands 140+ mph winds\n• Reduces energy bills up to 25%\n• Hail and fire resistant\n• Low maintenance\n\nPerfect for Texas weather! We offer standing seam, corrugated, and more."
    },
    'location': {
      keywords: ['where', 'location', 'area', 'serve', 'near', 'woodlands', 'conroe', 'spring', 'houston'],
      response: "📍 **Our Service Area:**\n\nWe proudly serve:\n• The Woodlands\n• Conroe\n• Spring\n• Humble\n• Kingwood\n• Tomball\n• Magnolia\n• North Houston\n\nOffice: 1601 Primrose St, Conroe, TX 77385\n\nNot sure if we serve your area? Just call!"
    },
    'contact': {
      keywords: ['contact', 'call', 'phone', 'number', 'reach', 'talk', 'speak'],
      response: "📞 **Contact Storm Pros:**\n\n📱 Call/Text: **(936) 204-0141**\n📍 1601 Primrose St, Conroe, TX 77385\n⏰ Mon–Fri: 7AM–6PM\n⚡ Emergency: 24/7\n\nOr fill out the contact form on this page and we'll call you back within 1 hour!"
    }
  };

  function matchResponse(text) {
    const lower = text.toLowerCase();
    for (const [, data] of Object.entries(KB)) {
      if (data.keywords.some(kw => lower.includes(kw))) {
        return data.response;
      }
    }
    return null;
  }

  function formatBotMsg(text) {
    // Convert markdown-like syntax to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  function addMsg(text, role = 'bot', isHTML = false) {
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    if (isHTML) {
      bubble.innerHTML = formatBotMsg(text);
    } else {
      bubble.textContent = text;
    }
    div.appendChild(bubble);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot chat-typing';
    div.innerHTML = '<div class="msg-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function handleInput(text) {
    if (!text.trim()) return;
    addMsg(text, 'user');
    input.value = '';

    // Hide quick replies after first interaction
    if (quickReplies) quickReplies.style.display = 'none';

    const typing = showTyping();

    setTimeout(() => {
      typing.remove();
      const matched = matchResponse(text);
      if (matched) {
        addMsg(matched, 'bot', true);
      } else {
        addMsg(
          "Thanks for your message! For the quickest response, please call us at **(936) 204-0141** or fill out the contact form below. Our team responds within 1 hour!",
          'bot', true
        );
      }
    }, 900 + Math.random() * 500);
  }

  // Quick reply buttons
  const QUICK_ANSWERS = {
    'free-inspection': 'Tell me about the free inspection',
    'pricing': 'What are your prices?',
    'insurance': 'How does insurance work?',
    'schedule': 'How do I schedule?'
  };

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('quick-btn')) {
      handleInput(QUICK_ANSWERS[e.target.dataset.q] || e.target.textContent);
    }
  });

  sendBtn.addEventListener('click', () => handleInput(input.value));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleInput(input.value);
  });
})();


/* ============================================================
   6. SMOOTH SCROLL — for all anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = 80; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ============================================================
   7. GALLERY — Simple lightbox effect (keyboard accessible)
   ============================================================ */
(function initGallery() {
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') item.click();
    });
  });
})();


/* ============================================================
   8. LAZY LOADING — images (future-proof when real images added)
   ============================================================ */
(function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
  } else {
    // Fallback IntersectionObserver
    const lazyImages = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.src = entry.target.dataset.src;
          observer.unobserve(entry.target);
        }
      });
    });
    lazyImages.forEach(img => observer.observe(img));
  }
})();


/* ============================================================
   9. COUNTER ANIMATION — Trust bar numbers
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.trust-num');
  const animatedNums = ['4.9★', '81+', '500+', '100%', '$0'];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(10px)';
        entry.target.style.transition = 'opacity .5s ease, transform .5s ease';
        requestAnimationFrame(() => {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, 50);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ============================================================
   10. SERVICE AREA BADGE — Map hint
   ============================================================ */
(function initAreaBadge() {
  // Highlight area pills on hover
  document.querySelectorAll('.area-list span').forEach(span => {
    span.style.cursor = 'default';
    span.addEventListener('mouseenter', () => {
      span.style.background = 'rgba(242,92,0,.2)';
      span.style.borderColor = 'rgba(242,92,0,.4)';
      span.style.color = '#fff';
    });
    span.addEventListener('mouseleave', () => {
      span.style.background = '';
      span.style.borderColor = '';
      span.style.color = '';
    });
  });
})();

/* ── Console branding ── */
console.log('%c🏠 Storm Pros Roofing & Restoration', 'color:#f25c00;font-size:16px;font-weight:bold;');
console.log('%cBuilt with ❤️ for North Houston homeowners', 'color:#0a1628;font-size:12px;');
