
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
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0, 0);
} catch (e) {
    console.error("Lenis init failed:", e);
}

// Preloader Logic
const openEnvelopeBtn = document.getElementById('open-envelope');
const loader = document.querySelector('.loader');
const envelopeFlap = document.querySelector('.envelope-flap');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

// Animate Envelope on load
document.addEventListener('DOMContentLoaded', () => {
    try {
        gsap.from('.envelope-wrapper', {
            y: 50,
            opacity: 0,
            duration: 1.5,
            ease: 'power3.out'
        });
    } catch (e) {
        console.error("GSAP Animation error on load", e);
    }
});

// Enter Site
openEnvelopeBtn.addEventListener('click', () => {
    // Open envelope animation
    openEnvelopeBtn.classList.add('opened');
    envelopeFlap.classList.add('opened');

    // Play music
    bgMusic.play().then(() => {
        musicToggle.classList.add('playing');
        document.getElementById('music-text-label').textContent = 'Music On';
    }).catch(e => {
        console.log("Audio play failed: ", e);
        alert("Music could not be played! Please make sure you have added the 'chingamasam-vannu-chernnal.mp3' file into the 'assets' folder.");
    });

    // Hide envelope and show transition heart
    setTimeout(() => {
        gsap.to(['.envelope-wrapper', '.loader-intro-text'], {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                const envWrapper = document.querySelector('.envelope-wrapper');
                const introText = document.querySelector('.loader-intro-text');
                if (envWrapper) envWrapper.style.display = 'none';
                if (introText) introText.style.display = 'none';

                // Show transition heart
                const transitionHeart = document.querySelector('.loader-transition-heart');
                if (transitionHeart) {
                    transitionHeart.style.display = 'block';
                    gsap.fromTo(transitionHeart,
                        { opacity: 0, scale: 0.5 },
                        { opacity: 1, scale: 1, duration: 0.5 }
                    );
                }

                // Wait for heart animation, then hide entire loader
                setTimeout(() => {
                    gsap.to(loader, {
                        opacity: 0,
                        duration: 1.5,
                        ease: 'power4.inOut',
                        onComplete: () => {
                            loader.style.display = 'none';
                            initAnimations(); // Start main animations once loader is gone
                        }
                    });
                }, 1500); // Heart pulses for 1.5s
            }
        });
    }, 800); // Wait for envelope flap animation to complete first
});

// Music Toggle
musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play().then(() => {
            musicToggle.classList.add('playing');
            document.getElementById('music-text-label').textContent = 'Music On';
        }).catch(e => {
            alert("Music could not be played! Please make sure you have added the 'chingamasam-vannu-chernnal.mp3' file into the 'assets' folder.");
        });
    } else {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
        document.getElementById('music-text-label').textContent = 'Music Off';
    }
});


// Main Animations (called after loader)
function initAnimations() {
    try {
        // Trigger Speech Bubbles
        const bubbleContainers = document.querySelectorAll('.speech-bubbles-container');
        bubbleContainers.forEach(container => container.classList.add('start-animation'));
        
        // Split text setup
        const splitTexts = document.querySelectorAll('.split-text');
        splitTexts.forEach(text => {
            try {
                const type = new SplitType(text, { types: 'lines, words' });

                gsap.from(type.words, {
                    scrollTrigger: {
                        trigger: text,
                        start: 'top 90%',
                    },
                    y: 50,
                    opacity: 0,
                    duration: 1,
                    stagger: 0.05,
                    ease: 'power4.out'
                });
            } catch (e) {
                console.error("SplitType error", e);
            }
        });

        // Hero Parallax & Zoom
        gsap.to('.hero-img', {
            scale: 1, // original is 1.1 in css
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        gsap.to('.hero-content', {
            yPercent: -50,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // Parallax for bride & groom hero avatars
        gsap.to(['.hero-img-left', '.hero-img-right'], {
            yPercent: -200,
            rotation: 5,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // Floating Hearts Parallax at the bottom of hero section
        const petalsContainer = document.querySelector('.petals-container');
        if (petalsContainer) {
            for (let i = 0; i < 40; i++) {
                const heart = document.createElement('div');
                heart.innerHTML = '&#x2665;&#xFE0E;';
                heart.className = 'scroll-heart';
                heart.style.left = `${Math.random() * 100}%`; // Span the full width of the screen
                heart.style.bottom = `${-50 + Math.random() * 50}px`; // Start consistently near the bottom edge
                heart.style.fontSize = `${3 + Math.random() * 3}rem`; // Make them significantly bigger (3rem to 6rem)
                // Mix of red and dark red
                heart.style.color = Math.random() > 0.5 ? '#d22329' : '#8f171b';
                heart.style.opacity = 0.5 + Math.random() * 0.5;
                petalsContainer.appendChild(heart);
            }

            gsap.to('.scroll-heart', {
                y: () => -window.innerHeight * (1 + Math.random()), // Move up past the screen
                rotation: () => -100 + Math.random() * 200, // Random rotation
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero',
                    start: 'top top',
                    end: 'bottom -100%', // Animate well past the hero section
                    scrub: true
                }
            });
        }
        // Invitation Section Animation
        const invitationSection = document.querySelector('.invitation-section');
        if (invitationSection) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: '.invitation-section',
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 1
                }
            });

            // Split the bride and groom images apart (along with their backgrounds) using relative vw units so they move at the exact same speed
            tl.to(['.invite-img-left', '.invite-bg-left'], { x: "-=60vw", opacity: 0, duration: 2 }, 0);
            tl.to(['.invite-img-right', '.invite-bg-right'], { x: "+=60vw", opacity: 0, duration: 2 }, 0);

            // Fade in and float up the invitation letter
            tl.to('.invitation-letter', { yPercent: -20, opacity: 1, duration: 2 }, 0.5);

            // Pop in the big hearts at the bottom of the letter
            tl.to('.letter-heart', { y: 0, scale: 1, opacity: 1, duration: 1.5, stagger: 0.2 }, 1.5);
        }

        // Location Cards Reveal
        gsap.from('.location-card', {
            scrollTrigger: {
                trigger: '.location-details',
                start: 'top 70%',
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.2
        });

        // Event Cards Hover (CSS handles hover, GSAP handles entry)
        gsap.from('.event-card', {
            scrollTrigger: {
                trigger: '.events-section',
                start: 'top 70%',
            },
            y: 100,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // Gallery Parallax
        gsap.utils.toArray('.gallery-item').forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 90%',
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });
        });

        // Countdown Logic
        const targetDate = new Date('August 23, 2026 10:00:00').getTime();
        setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance > 0) {
                const d = document.getElementById('days');
                const h = document.getElementById('hours');
                const m = document.getElementById('minutes');
                const s = document.getElementById('seconds');
                if (d) d.innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
                if (h) h.innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
                if (m) m.innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
                if (s) s.innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
            }
        }, 1000);

        // RSVP Couple Image Animation
        gsap.from('.rsvp-couple-img', {
            scrollTrigger: {
                trigger: '.rsvp-section',
                start: 'top 70%',
            },
            x: -50,
            opacity: 0,
            duration: 1.5,
            ease: 'power3.out'
        });

        // Wishes Marquee Infinite Clone
        const marqueeTrack = document.querySelector('.marquee-track');
        if (marqueeTrack) {
            // Clone the content for seamless infinite scrolling
            const content = marqueeTrack.innerHTML;
            marqueeTrack.innerHTML = content + content;

            const marqueeAnim = gsap.to('.marquee-track', {
                xPercent: -50,
                ease: "none",
                duration: 40, // Reduced speed
                repeat: -1
            });

            const wrapper = document.querySelector('.marquee-wrapper');
            wrapper.style.cursor = 'grab';

            // Pause on hover
            wrapper.addEventListener('mouseenter', () => marqueeAnim.pause());
            wrapper.addEventListener('mouseleave', () => {
                if (!isDragging) marqueeAnim.play();
            });

            // Control reel with cursor (drag to scroll)
            let isDragging = false;
            let startX;
            let startProgress;

            const onDragStart = (x) => {
                isDragging = true;
                startX = x;
                startProgress = marqueeAnim.progress();
                wrapper.style.cursor = 'grabbing';
                marqueeAnim.pause();
            };

            const onDragMove = (x) => {
                if (!isDragging) return;
                const dx = x - startX;
                const trackWidth = marqueeTrack.offsetWidth / 2; // Half width because of cloned content
                let newProgress = startProgress - (dx / trackWidth);
                
                // Keep progress wrapped infinitely between 0 and 1
                newProgress = newProgress % 1;
                if (newProgress < 0) newProgress += 1;
                
                marqueeAnim.progress(newProgress);
            };

            const onDragEnd = () => {
                isDragging = false;
                wrapper.style.cursor = 'grab';
                // Only resume playing if not still hovering
                if (!wrapper.matches(':hover')) {
                    marqueeAnim.play();
                }
            };

            // Mouse Events
            wrapper.addEventListener('mousedown', (e) => onDragStart(e.pageX));
            window.addEventListener('mousemove', (e) => onDragMove(e.pageX));
            window.addEventListener('mouseup', onDragEnd);

            // Touch Events for mobile
            wrapper.addEventListener('touchstart', (e) => onDragStart(e.touches[0].pageX));
            window.addEventListener('touchmove', (e) => onDragMove(e.touches[0].pageX));
            window.addEventListener('touchend', onDragEnd);
        }

        // Wishes Form WhatsApp Integration (Two Buttons)
        const wishesForm = document.getElementById('wishesForm');
        const wishSuccessMsg = document.getElementById('wishSuccess');
        const btnSendGroom = document.getElementById('btnSendGroom');
        const btnSendBride = document.getElementById('btnSendBride');

        if (wishesForm) {
            let sentToGroom = false;
            let sentToBride = false;

            const sendWishes = (recipient) => {
                const nameInput = document.getElementById('wishName');
                const messageInput = document.getElementById('wishMessage');

                // Simple validation
                if (!nameInput.value.trim() || !messageInput.value.trim()) {
                    alert("Please enter your name and beautiful wishes before sending!");
                    return;
                }

                // Construct the WhatsApp message
                const rawText = `Hello Jijo & Aleena! I am ${nameInput.value}.\n\n${messageInput.value}`;
                const encodedText = encodeURIComponent(rawText);

                // IMPORTANT: Replace these numbers with the actual WhatsApp numbers (include country code, e.g. 919876543210)
                const groomNumber = "+971568087534"; // Groom's WhatsApp
                const brideNumber = "+971561412591"; // Bride's WhatsApp

                const targetNumber = recipient === 'groom' ? groomNumber : brideNumber;
                const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedText}`;

                // Open WhatsApp in a new tab
                window.open(whatsappUrl, '_blank');

                // Disable the clicked button and update state
                if (recipient === 'groom') {
                    sentToGroom = true;
                    if (btnSendGroom) {
                        btnSendGroom.disabled = true;
                        btnSendGroom.style.opacity = '0.5';
                        btnSendGroom.innerText = 'Sent to Jijo ✓';
                        btnSendGroom.style.cursor = 'not-allowed';
                    }
                } else {
                    sentToBride = true;
                    if (btnSendBride) {
                        btnSendBride.disabled = true;
                        btnSendBride.style.opacity = '0.5';
                        btnSendBride.innerText = 'Sent to Aleena ✓';
                        btnSendBride.style.cursor = 'not-allowed';
                    }
                }

                // Update success message text based on recipient
                const recipientName = recipient === 'groom' ? 'Jijo' : 'Aleena';
                const otherName = recipient === 'groom' ? 'Aleena' : 'Jijo';

                if (wishSuccessMsg) {
                    let msgHTML = `<h3>Thank You!</h3><p>Your beautiful wishes have been sent to ${recipientName}.</p>`;

                    if (sentToGroom && sentToBride) {
                        msgHTML = `<h3>Thank You!</h3><p>Your beautiful wishes have been sent to both Jijo and Aleena.</p>`;
                    } else {
                        msgHTML += `<p style="font-size: 0.95rem; margin-top: 8px; color: var(--c-champagne);">Don't forget to send your wishes to ${otherName} too!</p>`;
                    }

                    wishSuccessMsg.innerHTML = msgHTML;
                    wishSuccessMsg.style.display = 'block';

                    // Simple animation for the success message
                    gsap.fromTo(wishSuccessMsg,
                        { y: 20, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.5 }
                    );

                    // Clear the message input so they can easily write another wish to the other person
                    messageInput.value = '';
                }
            };

            if (btnSendGroom) btnSendGroom.addEventListener('click', () => sendWishes('groom'));
            if (btnSendBride) btnSendBride.addEventListener('click', () => sendWishes('bride'));
        }

        // Floating Petals Animation
        createPetals();
    } catch (err) {
        console.error("Error in initAnimations:", err);
    }
}

function createPetals() {
    const container = document.querySelector('.petals-container');
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.animationDuration = `${Math.random() * 5 + 5}s`;
        petal.style.animationDelay = `${Math.random() * 5}s`;

        // basic petal style inline
        petal.style.position = 'absolute';
        petal.style.top = '-20px';
        petal.style.width = '15px';
        petal.style.height = '15px';
        petal.style.background = 'var(--c-rose)';
        petal.style.opacity = '0.4';
        petal.style.borderRadius = '50% 0 50% 50%';
        petal.style.transform = `rotate(${Math.random() * 360}deg)`;

        container.appendChild(petal);

        gsap.to(petal, {
            y: '100vh',
            x: `+=${Math.random() * 200 - 100}`,
            rotation: '+=360',
            duration: Math.random() * 5 + 5,
            repeat: -1,
            ease: 'linear',
            delay: Math.random() * 5
        });
    }
}
