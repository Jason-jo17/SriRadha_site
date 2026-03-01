// main.js

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.querySelector('i').classList.toggle('fa-bars');
            hamburger.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Active Nav Link
    const currentPath = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(link => {
        // Basic match
        if (link.getAttribute('href') === currentPath || (currentPath === '/' && link.getAttribute('href') === '/index.html')) {
            link.classList.add('active');
        }
    });

    // Image Error Fallback
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function () {
            const fallback = document.createElement('div');
            fallback.classList.add('img-fallback');
            fallback.textContent = 'Image not available';
            this.replaceWith(fallback);
        });
    });

    // Hero Slider
    const slides = document.querySelectorAll('.h-slide');
    if (slides.length > 0) {
        const dots = document.querySelectorAll('.h-dots .dot');
        const prevBtn = document.querySelector('.slider-arrows .prev');
        const nextBtn = document.querySelector('.slider-arrows .next');
        let currentSlide = 0;
        let slideInterval;

        const showSlide = (n) => {
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));

            currentSlide = (n + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        };

        const nextSlide = () => showSlide(currentSlide + 1);
        const prevSlide = () => showSlide(currentSlide - 1);

        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => { showSlide(index); resetInterval(); });
        });

        const startInterval = () => { slideInterval = setInterval(nextSlide, 5000); };
        const resetInterval = () => { clearInterval(slideInterval); startInterval(); };

        // Touch Swipe for Hero
        let touchStartX = 0;
        const sliderContainer = document.querySelector('.hero-custom');
        if (sliderContainer) {
            sliderContainer.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
            sliderContainer.addEventListener('touchend', e => {
                let touchEndX = e.changedTouches[0].screenX;
                if (touchEndX < touchStartX - 50) nextSlide(), resetInterval();
                if (touchEndX > touchStartX + 50) prevSlide(), resetInterval();
            }, { passive: true });
        }

        startInterval();
    }

    // Testimonial Slider
    const testSlides = document.querySelectorAll('.testimonial-slide');
    if (testSlides.length > 0) {
        const testDots = document.querySelectorAll('.testimonial-dots .dot');
        let currentTest = 0;

        const showTestimonial = (n) => {
            testSlides.forEach(s => s.classList.remove('active'));
            if (testDots.length) testDots.forEach(d => d.classList.remove('active'));

            currentTest = (n + testSlides.length) % testSlides.length;
            testSlides[currentTest].classList.add('active');
            if (testDots[currentTest]) testDots[currentTest].classList.add('active');
        };

        testDots.forEach((dot, index) => {
            dot.addEventListener('click', () => { showTestimonial(index); });
        });

        setInterval(() => showTestimonial(currentTest + 1), 6000);
    }

    // Counters
    const counters = document.querySelectorAll('.counter-val');
    if (counters.length > 0) {
        const runCounter = (el) => {
            const target = +el.getAttribute('data-target');
            const duration = 2000;
            const stepTime = 20;
            const steps = Math.ceil(duration / stepTime);
            const inc = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += inc;
                if (current >= target) {
                    el.innerText = target;
                    clearInterval(timer);
                } else {
                    el.innerText = Math.ceil(current);
                }
            }, stepTime);
        };

        const counterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    // Projects Filter
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    if (filterBtns.length > 0 && projectCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-status') === filterValue) {
                        card.style.display = 'block';
                        setTimeout(() => card.style.opacity = '1', 50);
                    } else {
                        card.style.opacity = '0';
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // Scroll to Top
    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const statusDiv = document.getElementById('formStatus');
            const submitBtn = contactForm.querySelector('button[type="submit"]');

            const formData = {
                name: contactForm.name.value,
                phone: contactForm.phone.value,
                email: contactForm.email.value,
                message: contactForm.message.value
            };

            // Basic client validation
            if (formData.name.trim().length < 2 || formData.message.trim().length < 10) {
                showStatus(statusDiv, 'error', 'Please fill out all fields correctly.');
                return;
            }

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    showStatus(statusDiv, 'success', data.message || 'Message sent successfully!');
                    contactForm.reset();
                } else {
                    showStatus(statusDiv, 'error', data.error || 'Failed to send message.');
                }
            } catch (err) {
                showStatus(statusDiv, 'error', 'Network error. Please try again.');
                console.error('Submit error:', err);
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });

        function showStatus(el, type, msg) {
            el.className = `form-status ${type}`;
            el.textContent = msg;
            setTimeout(() => { el.style.display = 'none'; }, 5000);
        }
    }

    // Chatbot Logic
    const chatBtn = document.getElementById('chatBtn');
    const chatWindow = document.getElementById('chatWindow');
    const closeChat = document.getElementById('closeChat');
    const chatBody = document.getElementById('chatBody');
    const chatInput = document.getElementById('chatInput');
    const sendChat = document.getElementById('sendChat');
    const chatBadge = document.getElementById('chatBadge');
    const typingIndicator = document.getElementById('typingIndicator');

    let chatHistory = [];
    let chatOpen = false;

    if (chatBtn && chatWindow) {
        // Show badge after 3s
        setTimeout(() => {
            if (!chatOpen && chatHistory.length === 0) chatBadge.classList.add('visible');
        }, 3000);

        chatBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('open');
            chatBadge.classList.remove('visible');
            chatOpen = chatWindow.classList.contains('open');
            if (chatOpen && chatHistory.length === 0) {
                addMessage('bot', "Hello! I'm your digital assistant for Sai Radha Developers. How can I help you find your dream home today?");
            }
        });

        closeChat.addEventListener('click', () => {
            chatWindow.classList.remove('open');
            chatOpen = false;
        });

        const sendMessage = async (text) => {
            if (!text.trim()) return;

            addMessage('user', text);
            chatInput.value = '';

            typingIndicator.classList.add('visible');
            chatBody.scrollTop = chatBody.scrollHeight;

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: chatHistory })
                });
                const data = await response.json();

                typingIndicator.classList.remove('visible');

                if (response.ok && data.reply) {
                    addMessage('bot', data.reply);
                } else {
                    addMessage('bot', "I'm sorry, I'm having trouble connecting right now. Please try calling us!");
                }
            } catch (err) {
                typingIndicator.classList.remove('visible');
                addMessage('bot', "Network error. Please try again or use the contact form.");
            }
        };

        sendChat.addEventListener('click', () => sendMessage(chatInput.value));
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage(chatInput.value);
        });

        // Quick replies delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('chip')) {
                sendMessage(e.target.textContent);
                // Remove chips container after click
                const chipsContainer = e.target.closest('.chat-chips');
                if (chipsContainer) chipsContainer.remove();
            }
        });

        function addMessage(role, text) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-msg msg-${role}`;
            msgDiv.innerHTML = text.replace(/\n/g, '<br>'); // Simple Markdown-ish line break parse

            chatBody.insertBefore(msgDiv, typingIndicator);

            // Save to history for context
            chatHistory.push({ role: role === 'bot' ? 'assistant' : 'user', content: text });

            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }

    // --- Lightbox Functionality ---
    const lightboxImgs = document.querySelectorAll('.lightbox-img');
    if (lightboxImgs.length > 0) {
        // Create Lightbox DOM Elements
        const overlay = document.createElement('div');
        overlay.className = 'lb-overlay';

        const lbContent = document.createElement('img');
        lbContent.className = 'lb-content';

        const closeBtn = document.createElement('div');
        closeBtn.className = 'lb-close';
        closeBtn.innerHTML = '&times;';

        const prevArrow = document.createElement('div');
        prevArrow.className = 'lb-prev';
        prevArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';

        const nextArrow = document.createElement('div');
        nextArrow.className = 'lb-next';
        nextArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';

        overlay.appendChild(lbContent);
        overlay.appendChild(closeBtn);
        overlay.appendChild(prevArrow);
        overlay.appendChild(nextArrow);
        document.body.appendChild(overlay);

        let currentLbGroup = [];
        let currentLbIndex = 0;

        lightboxImgs.forEach(img => {
            img.addEventListener('click', (e) => {
                const groupName = img.getAttribute('data-lb-group') || 'default';
                currentLbGroup = Array.from(document.querySelectorAll(`.lightbox-img[data-lb-group="${groupName}"]`));
                currentLbIndex = currentLbGroup.indexOf(img);

                openLightbox(img.src);
            });
        });

        const openLightbox = (src) => {
            lbContent.src = src;
            overlay.classList.add('visible');
            document.body.style.overflow = 'hidden';
            updateArrows();
        };

        const closeLightbox = () => {
            overlay.classList.remove('visible');
            document.body.style.overflow = '';
        };

        const updateArrows = () => {
            if (currentLbGroup.length > 1) {
                prevArrow.style.display = 'flex';
                nextArrow.style.display = 'flex';
            } else {
                prevArrow.style.display = 'none';
                nextArrow.style.display = 'none';
            }
        };

        const lbPrev = () => {
            if (currentLbGroup.length <= 1) return;
            currentLbIndex = (currentLbIndex - 1 + currentLbGroup.length) % currentLbGroup.length;
            lbContent.src = currentLbGroup[currentLbIndex].src;
        };

        const lbNext = () => {
            if (currentLbGroup.length <= 1) return;
            currentLbIndex = (currentLbIndex + 1) % currentLbGroup.length;
            lbContent.src = currentLbGroup[currentLbIndex].src;
        };

        closeBtn.addEventListener('click', closeLightbox);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeLightbox();
        });
        prevArrow.addEventListener('click', lbPrev);
        nextArrow.addEventListener('click', lbNext);

        document.addEventListener('keydown', (e) => {
            if (!overlay.classList.contains('visible')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') lbPrev();
            if (e.key === 'ArrowRight') lbNext();
        });
    }

    // --- Brochure Modal Functionality ---
    const brochureBtns = document.querySelectorAll('.brochure-btn');
    if (brochureBtns.length > 0) {
        // Create Brochure DOM
        const bOverlay = document.createElement('div');
        bOverlay.className = 'bm-overlay';

        bOverlay.innerHTML = `
            <div class="bm-modal">
                <div class="bm-close">&times;</div>
                <h3>Download Brochure</h3>
                <p>Please provide your details to receive the e-brochure.</p>
                <div id="bmStatus" class="form-status" style="display:none; margin-bottom:15px;"></div>
                <form id="brochureForm">
                    <div class="form-group">
                        <input type="text" id="bmName" class="form-control" placeholder="Your Name *" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" id="bmPhone" class="form-control" placeholder="Phone Number *" required>
                    </div>
                    <div class="form-group">
                        <input type="email" id="bmEmail" class="form-control" placeholder="Email Address *" required>
                    </div>
                    <input type="hidden" id="bmProject" value="">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Download Now</button>
                </form>
            </div>
        `;
        document.body.appendChild(bOverlay);

        const bmClose = bOverlay.querySelector('.bm-close');
        const bForm = document.getElementById('brochureForm');
        const bmStatus = document.getElementById('bmStatus');

        const closeBrochureModal = () => {
            bOverlay.classList.remove('visible');
            bForm.reset();
            bmStatus.style.display = 'none';
        };

        brochureBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const focusProject = btn.getAttribute('data-project') || 'Generic Project';
                document.getElementById('bmProject').value = focusProject;
                bOverlay.classList.add('visible');
            });
        });

        bmClose.addEventListener('click', closeBrochureModal);
        bOverlay.addEventListener('click', (e) => {
            if (e.target === bOverlay) closeBrochureModal();
        });

        // Handle Brochure Submit
        bForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = bForm.querySelector('button[type="submit"]');

            const formData = {
                name: document.getElementById('bmName').value,
                phone: document.getElementById('bmPhone').value,
                email: document.getElementById('bmEmail').value,
                message: `Requesting Brochure for: ${document.getElementById('bmProject').value}`
            };

            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (response.ok) {
                    bmStatus.className = 'form-status success';
                    bmStatus.textContent = '✓ Thank you! Our team will contact you with the brochure shortly.';
                    bmStatus.style.display = 'block';
                    bForm.style.display = 'none'; // Hide form inputs after success

                    // Reset modal state after 5 seconds automatically closing
                    setTimeout(() => {
                        closeBrochureModal();
                        bForm.style.display = 'block';
                    }, 5000);
                } else {
                    bmStatus.className = 'form-status error';
                    bmStatus.textContent = data.error || 'Failed to request brochure.';
                    bmStatus.style.display = 'block';
                }
            } catch (err) {
                bmStatus.className = 'form-status error';
                bmStatus.textContent = 'Network error. Please try again.';
                bmStatus.style.display = 'block';
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});
