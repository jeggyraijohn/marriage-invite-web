// Force page to always start at the top on refresh
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis Smooth Scroll
let lenis;
try {
  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Synchronize Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0, 0);

  // Smooth scroll on all anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, {
            offset: -30,
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    });
  });
} catch (e) {
  console.warn("Lenis smooth scroll initialization fallback:", e);
}

// Preloader & Envelope Logic
const openEnvelopeBtn = document.getElementById('open-envelope');
const preloader = document.getElementById('preloader');
const envelopeFlap = document.querySelector('.envelope-flap');
const envelope = document.querySelector('.envelope');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const musicLabel = document.getElementById('music-text-label');

// Intro animation for preloader
document.addEventListener('DOMContentLoaded', () => {
  try {
    gsap.from('.loader-intro-badge', {
      y: -30,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
    });
    gsap.from('.envelope-wrapper', {
      y: 40,
      opacity: 0,
      duration: 1.4,
      delay: 0.3,
      ease: 'power3.out',
    });
  } catch (err) {
    console.warn("GSAP intro error:", err);
  }

  // Start countdown immediately
  initCountdown();
});

// Open Invitation Envelope & Enter Site
if (openEnvelopeBtn) {
  openEnvelopeBtn.addEventListener('click', () => {
    // 1. Break wax seal & open top flap
    openEnvelopeBtn.classList.add('opened');
    openEnvelopeBtn.style.pointerEvents = 'none';

    if (envelopeFlap) {
      envelopeFlap.classList.add('opened');
    }

    // 2. Shortly after flap starts opening, slide letter card UP out of the envelope
    setTimeout(() => {
      if (envelope) {
        envelope.classList.add('opened');
      }
    }, 280);

    // 3. Play background music
    if (bgMusic) {
      bgMusic.play().then(() => {
        if (musicToggle) musicToggle.classList.add('playing');
        if (musicLabel) musicLabel.textContent = 'Music On';
      }).catch((e) => {
        console.log("Audio playback notice:", e);
      });
    }

    // 4. Give user clear time (1.6s) to see the letter card that just emerged before transitioning
    setTimeout(() => {
      gsap.to(['.envelope-wrapper', '.loader-intro-badge'], {
        opacity: 0,
        y: -25,
        duration: 0.65,
        onComplete: () => {
          const envWrapper = document.querySelector('.envelope-wrapper');
          const introBadge = document.querySelector('.loader-intro-badge');
          if (envWrapper) envWrapper.style.display = 'none';
          if (introBadge) introBadge.style.display = 'none';

          // Show transition lotus blessing
          const transitionBloom = document.querySelector('.loader-transition-heart');
          if (transitionBloom) {
            transitionBloom.style.display = 'block';
            gsap.fromTo(transitionBloom,
              { opacity: 0, scale: 0.6 },
              { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }
            );
          }

          // Fade out preloader completely into site
          setTimeout(() => {
            gsap.to(preloader, {
              opacity: 0,
              duration: 1.1,
              ease: 'power4.inOut',
              onComplete: () => {
                if (preloader) preloader.style.display = 'none';
                initSiteAnimations(); // Trigger hero and scroll reveals
              }
            });
          }, 1300);
        }
      });
    }, 1600);
  });
}

// Background Music Toggle
if (musicToggle && bgMusic) {
  const toggleAudio = () => {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        musicToggle.classList.add('playing');
        if (musicLabel) musicLabel.textContent = 'Music On';
      }).catch((e) => {
        console.warn("Music play blocked:", e);
      });
    } else {
      bgMusic.pause();
      musicToggle.classList.remove('playing');
      if (musicLabel) musicLabel.textContent = 'Music Off';
    }
  };

  musicToggle.addEventListener('click', toggleAudio);
  musicToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAudio();
    }
  });
}

// Site Animations (Initiated after opening envelope)
function initSiteAnimations() {
  try {
    // Split Text animations
    const splitTexts = document.querySelectorAll('.split-text');
    splitTexts.forEach((text) => {
      try {
        const type = new SplitType(text, { types: 'lines, words' });
        gsap.from(type.words, {
          scrollTrigger: {
            trigger: text,
            start: 'top 88%',
          },
          y: 35,
          opacity: 0,
          duration: 0.8,
          stagger: 0.04,
          ease: 'power3.out',
        });
      } catch (e) {
        // Fallback for SplitType
        gsap.from(text, {
          scrollTrigger: {
            trigger: text,
            start: 'top 88%',
          },
          y: 25,
          opacity: 0,
          duration: 0.8,
        });
      }
    });

    // Hero Background Image Parallax
    gsap.to('.hero-bg-img', {
      yPercent: 12,
      scale: 1.12,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-watercolor',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    // Hero Text float up on scroll
    gsap.to('.hero-content', {
      yPercent: -20,
      opacity: 0.85,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-watercolor',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });

    // Traditional Parchment Card Entrance
    gsap.from('.parchment-watercolor-card', {
      scrollTrigger: {
        trigger: '.traditional-invite-section',
        start: 'top 75%',
      },
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
    });

    // Schedule Cards Stagger Entrance
    gsap.from('.schedule-card', {
      scrollTrigger: {
        trigger: '.events-schedule-section',
        start: 'top 75%',
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
    });

    // Floating Solid Love Hearts in Hero
    createHeroPetals();

  } catch (err) {
    console.error("Site animations error:", err);
  }
}

// Hero Floating Solid Love Hearts
function createHeroPetals() {
  const container = document.querySelector('.petals-container');
  if (!container) return;

  const heartColors = ['#e11d48', '#f43f5e', '#fb7185', '#2bb1b9'];

  for (let i = 0; i < 16; i++) {
    const heart = document.createElement('div');
    heart.className = 'floating-hero-heart';
    heart.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    const size = Math.floor(14 + Math.random() * 18);
    heart.style.position = 'absolute';
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.top = `${-30 + Math.random() * 20}px`;
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];
    heart.style.opacity = `${0.35 + Math.random() * 0.4}`;
    heart.style.pointerEvents = 'none';
    heart.style.filter = 'drop-shadow(0 2px 6px rgba(225, 29, 72, 0.3))';

    container.appendChild(heart);

    gsap.to(heart, {
      y: '100vh',
      x: `+=${Math.random() * 160 - 80}`,
      rotation: Math.random() * 180 - 90,
      duration: 9 + Math.random() * 9,
      repeat: -1,
      ease: 'linear',
      delay: Math.random() * 6,
    });
  }
}

// Countdown Logic: October 21, 2026, 10:00:00 IST
function initCountdown() {
  const weddingTime = new Date('2026-10-21T10:00:00+05:30').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = weddingTime - now;

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (distance > 0) {
      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      if (daysEl) daysEl.innerText = d.toString().padStart(2, '0');
      if (hoursEl) hoursEl.innerText = h.toString().padStart(2, '0');
      if (minutesEl) minutesEl.innerText = m.toString().padStart(2, '0');
      if (secondsEl) secondsEl.innerText = s.toString().padStart(2, '0');
    } else {
      if (daysEl) daysEl.innerText = '00';
      if (hoursEl) hoursEl.innerText = '00';
      if (minutesEl) minutesEl.innerText = '00';
      if (secondsEl) secondsEl.innerText = '00';
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Wishes WhatsApp Integration (Dual Buttons for Andrews & Neha)
document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // GOOGLE FIREBASE REAL-TIME WISHES & BLESSINGS (Live Only, No Dummy Data)
  // =========================================================================

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  const LOCAL_WISHES_KEY = 'andrews_neha_wedding_wishes_live';
  
  // Purge any legacy test cache so no old sample wishes linger
  try {
    localStorage.removeItem('andrews_neha_wedding_wishes_v1');
    localStorage.removeItem('andrews_neha_wedding_wishes_local');
  } catch (e) {}

  function getLocalWishes() {
    try {
      const raw = localStorage.getItem(LOCAL_WISHES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocalWish(wish) {
    try {
      const list = getLocalWishes();
      list.unshift(wish);
      localStorage.setItem(LOCAL_WISHES_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  let marqueeAnimation = null;
  let autoScrollId = null;

  function stopMarqueeMotion() {
    if (marqueeAnimation) {
      marqueeAnimation.kill();
      marqueeAnimation = null;
    }
    if (autoScrollId) {
      cancelAnimationFrame(autoScrollId);
      autoScrollId = null;
    }
  }

  function startAutoPan() {
    const marqueeWrapper = document.getElementById('marqueeWrapper');
    if (!marqueeWrapper) return;
    if (autoScrollId) cancelAnimationFrame(autoScrollId);

    const maxScroll = marqueeWrapper.scrollWidth - marqueeWrapper.clientWidth;
    if (maxScroll <= 10) return; // Not overflowing, no motion needed

    let dir = 1;
    let isPaused = false;

    function step() {
      if (!isPaused && !marqueeWrapper.classList.contains('is-dragging')) {
        marqueeWrapper.scrollLeft += 0.6 * dir;
        const current = marqueeWrapper.scrollLeft;
        const max = marqueeWrapper.scrollWidth - marqueeWrapper.clientWidth;

        if (current >= max - 2 && dir === 1) {
          dir = -1;
          isPaused = true;
          setTimeout(() => { isPaused = false; }, 2500);
        } else if (current <= 2 && dir === -1) {
          dir = 1;
          isPaused = true;
          setTimeout(() => { isPaused = false; }, 2500);
        }
      }
      autoScrollId = requestAnimationFrame(step);
    }

    autoScrollId = requestAnimationFrame(step);
  }

  function renderWishesToMarquee(wishesList) {
    const marqueeTrack = document.getElementById('marqueeTrack');
    const marqueeWrapper = document.getElementById('marqueeWrapper');
    const noWishesPlaceholder = document.getElementById('noWishesPlaceholder');
    const marqueeInstruction = document.getElementById('marqueeInstruction');
    if (!marqueeTrack || !marqueeWrapper) return;

    stopMarqueeMotion();
    gsap.set(marqueeTrack, { clearProps: 'all' });

    // If no wishes yet, show "No wishes yet" empty state
    if (!wishesList || wishesList.length === 0) {
      if (noWishesPlaceholder) noWishesPlaceholder.style.display = 'flex';
      marqueeTrack.style.display = 'none';
      marqueeTrack.innerHTML = '';
      if (marqueeInstruction) marqueeInstruction.style.display = 'none';
      return;
    }

    // When real wishes exist, hide placeholder and display track
    if (noWishesPlaceholder) noWishesPlaceholder.style.display = 'none';
    marqueeTrack.style.display = 'flex';

    const isSingleWish = wishesList.length === 1;

    // Render EACH wish strictly ONCE — NO DUPLICATES / NO REPEATS
    const cardsHtml = wishesList.map(w => `
      <div class="wish-card-item ${isSingleWish ? 'is-single' : ''}">
        <span class="quote-sign">“</span>
        <p class="wish-quote">${escapeHtml(w.message)}</p>
        <div class="wish-meta">
          <div>
            <span class="author-name">${escapeHtml(w.name)}</span>
            <span class="author-relation">${escapeHtml(w.relation || 'Guest Blessing')}</span>
          </div>
          ${w.time ? `<span class="wish-meta-time">${escapeHtml(w.time)}</span>` : ''}
        </div>
      </div>
    `).join('');

    // Strict 1-to-1 card rendering: no repeating
    marqueeTrack.innerHTML = cardsHtml;

    // Layout: If single wish, center it gracefully without movement
    if (isSingleWish) {
      marqueeTrack.classList.add('is-centered');
      if (marqueeInstruction) marqueeInstruction.style.display = 'none';
      marqueeWrapper.scrollLeft = 0;
    } else {
      // Multiple wishes: check if content overflows the screen
      requestAnimationFrame(() => {
        const isOverflowing = marqueeTrack.scrollWidth > marqueeWrapper.clientWidth;
        if (isOverflowing) {
          marqueeTrack.classList.remove('is-centered');
          if (marqueeInstruction) {
            marqueeInstruction.style.display = 'block';
            marqueeInstruction.textContent = 'Drag or swipe to read all blessings';
          }
          startAutoPan();
        } else {
          marqueeTrack.classList.add('is-centered');
          if (marqueeInstruction) marqueeInstruction.style.display = 'none';
        }
      });
    }

    // Initialize smooth mouse drag on wrapper once
    if (!marqueeWrapper.dataset.hasDragScroll) {
      marqueeWrapper.dataset.hasDragScroll = 'true';

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      marqueeWrapper.addEventListener('mousedown', (e) => {
        isDown = true;
        marqueeWrapper.classList.add('is-dragging');
        startX = e.pageX - marqueeWrapper.offsetLeft;
        scrollLeft = marqueeWrapper.scrollLeft;
        stopMarqueeMotion();
      });

      window.addEventListener('mouseup', () => {
        if (!isDown) return;
        isDown = false;
        marqueeWrapper.classList.remove('is-dragging');
        if (wishesList && wishesList.length > 1) {
          startAutoPan();
        }
      });

      marqueeWrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - marqueeWrapper.offsetLeft;
        const walk = (x - startX) * 1.4;
        marqueeWrapper.scrollLeft = scrollLeft - walk;
      });

      marqueeWrapper.addEventListener('mouseenter', () => stopMarqueeMotion());
      marqueeWrapper.addEventListener('mouseleave', () => {
        if (!isDown && wishesList && wishesList.length > 1) {
          startAutoPan();
        }
      });
    }
  }

  // Initialize Realtime Listeners
  function initRealtimeWishes() {
    const db = window.weddingFirebase?.db;
    const isFirebaseLive = window.weddingFirebase?.isLive;

    if (isFirebaseLive && db) {
      console.log("📡 Subscribed to Google Firebase Realtime Database for live guestbook updates!");
      const wishesRef = db.ref('wedding_wishes');

      wishesRef.on('value', (snapshot) => {
        const liveData = [];
        snapshot.forEach((child) => {
          liveData.unshift({ id: child.key, ...child.val() });
        });
        renderWishesToMarquee(liveData);
      }, (err) => {
        console.warn("Firebase listener notice:", err);
        renderWishesToMarquee(getLocalWishes());
      });
    } else {
      // Local real-time mode
      renderWishesToMarquee(getLocalWishes());
      window.addEventListener('storage', (e) => {
        if (e.key === LOCAL_WISHES_KEY) {
          renderWishesToMarquee(getLocalWishes());
        }
      });
    }
  }

  initRealtimeWishes();

  // Wish Submission Handler (Saves to Firebase & opens WhatsApp)
  async function handleWishSubmission(recipient) {
    const nameInput = document.getElementById('wishName');
    const messageInput = document.getElementById('wishMessage');
    const wishSuccess = document.getElementById('wishSuccess');
    const wishFeedbackText = document.getElementById('wishFeedbackText');
    const activeBtn = recipient === 'groom' ? document.getElementById('btnSendGroom') : document.getElementById('btnSendBride');

    if (activeBtn && activeBtn.disabled) {
      return;
    }

    const guestName = nameInput ? nameInput.value.trim() : '';
    const guestMessage = messageInput ? messageInput.value.trim() : '';

    if (!guestName || !guestMessage) {
      alert("Please enter both your name and wedding wishes!");
      if (!guestName && nameInput) nameInput.focus();
      else if (messageInput) messageInput.focus();
      return;
    }

    const recipientName = recipient === 'groom' ? 'Andrews' : 'Neha';
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

    const wishPayload = {
      name: guestName,
      relation: 'Guest Blessing',
      message: guestMessage,
      time: timeStr,
      timestamp: Date.now()
    };

    if (activeBtn) activeBtn.style.opacity = '0.7';

    const db = window.weddingFirebase?.db;
    const isFirebaseLive = window.weddingFirebase?.isLive;

    try {
      if (isFirebaseLive && db) {
        // Push directly to Google Firebase Realtime Database
        await db.ref('wedding_wishes').push({
          ...wishPayload,
          timestamp: firebase.database.ServerValue.TIMESTAMP || Date.now()
        });
        console.log("🔥 Wish posted to Google Firebase Realtime Database!");
      } else {
        // Local real-time sync
        saveLocalWish(wishPayload);
        renderWishesToMarquee(getLocalWishes());
      }

      // Disable respective button after wish is submitted
      if (activeBtn) {
        activeBtn.disabled = true;
        activeBtn.classList.add('is-disabled');
        const textSpan = activeBtn.querySelector('.wa-btn-text');
        if (textSpan) {
          textSpan.textContent = `Sent to ${recipientName} ✓`;
        }
      }

      if (wishSuccess) {
        wishSuccess.style.display = 'inline-flex';
        if (wishFeedbackText) {
          wishFeedbackText.textContent = `Thank you ${guestName}! Your blessings are saved and sent to ${recipientName}.`;
        }
        gsap.fromTo(wishSuccess, 
          { y: 8, opacity: 0 }, 
          { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
      }

    } catch (err) {
      console.error("Firebase write error, using fallback:", err);
      saveLocalWish(wishPayload);
      renderWishesToMarquee(getLocalWishes());

      // Disable respective button on fallback as well
      if (activeBtn) {
        activeBtn.disabled = true;
        activeBtn.classList.add('is-disabled');
        const textSpan = activeBtn.querySelector('.wa-btn-text');
        if (textSpan) {
          textSpan.textContent = `Sent to ${recipientName} ✓`;
        }
      }
    } finally {
      if (activeBtn && !activeBtn.disabled) {
        activeBtn.style.opacity = '1';
      }
    }

    // Open WhatsApp for the selected couple member
    const groomWhatsApp = "+919188384257"; // Andrews (+91 91883 84257)
    const brideWhatsApp = "+918921041145"; // Neha (+91 89210 41145)
    const targetNumber = recipient === 'groom' ? groomWhatsApp : brideWhatsApp;

    const messageTemplate = 
`Dear ${recipientName} & ${recipient === 'groom' ? 'Neha' : 'Andrews'}! 💍💐
Warmest congratulations on your wedding!

"${guestMessage}"

With love & prayers,
— ${guestName}`;

    const encodedMsg = encodeURIComponent(messageTemplate);
    const whatsappUrl = `https://wa.me/${targetNumber.replace(/\+/g, '')}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  }

  const btnSendGroom = document.getElementById('btnSendGroom');
  const btnSendBride = document.getElementById('btnSendBride');

  if (btnSendGroom) {
    btnSendGroom.addEventListener('click', () => handleWishSubmission('groom'));
  }
  if (btnSendBride) {
    btnSendBride.addEventListener('click', () => handleWishSubmission('bride'));
  }
});
