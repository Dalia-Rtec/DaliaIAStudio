document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. INTERACTIVE CURSOR GLOW (Desktop Only)
       ========================================================================== */
    const cursorGlow = document.getElementById('cursorGlow');
    
    if (cursorGlow) {
        let mouseX = 0;
        let mouseY = 0;
        let currentX = 0;
        let currentY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth interpolation for the cursor follow effect
        const tick = () => {
            currentX += (mouseX - currentX) * 0.15;
            currentY += (mouseY - currentY) * 0.15;
            cursorGlow.style.left = `${currentX}px`;
            cursorGlow.style.top = `${currentY}px`;
            requestAnimationFrame(tick);
        };
        tick();
    }

    /* ==========================================================================
       2. SCROLL EVENTS: PROGRESS BAR, SCROLLED CLASS, AND DARK/LIGHT DETECT
       ========================================================================== */
    const header = document.getElementById('mainHeader');
    const progressBar = document.getElementById('progressBar');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const sideDots = document.querySelectorAll('.side-dot');
    const sideNav = document.getElementById('sideNav');

    const handleScrollEffects = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Update Scroll Progress Bar
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (progressBar) {
            progressBar.style.width = `${scrollPercent}%`;
        }

        // Header scrolled class
        if (header) {
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Active Section Tracking & Color Contrast Switching
        let currentActiveSectionId = '';
        let activeSectionType = 'light'; // Default

        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Trigger slightly before half of the section is scrolled into view
            if (scrollTop >= sectionTop - 120) {
                currentActiveSectionId = section.getAttribute('id');
                if (section.classList.contains('dark-section')) {
                    activeSectionType = 'dark';
                } else {
                    activeSectionType = 'light';
                }
            }
        });

        // Update nav links active class
        if (currentActiveSectionId) {
            navLinks.forEach((link) => {
                const targetId = link.getAttribute('href').substring(1);
                if (targetId === currentActiveSectionId || 
                    (currentActiveSectionId === 'politicas' && targetId === 'cobertura') ||
                    (currentActiveSectionId === 'lineamientos' && targetId === 'proceso')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Update side dots active class
            sideDots.forEach((dot) => {
                const targetId = dot.getAttribute('href').substring(1);
                if (targetId === currentActiveSectionId) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Apply contrast styling to Header & Side Navigation based on active section
        if (activeSectionType === 'dark') {
            if (header) header.classList.add('dark-header');
            if (sideNav) {
                sideNav.classList.add('dark-section-active');
                sideNav.classList.remove('light-section-active');
            }
        } else {
            if (header) header.classList.remove('dark-header');
            if (sideNav) {
                sideNav.classList.add('light-section-active');
                sideNav.classList.remove('dark-section-active');
            }
        }
    };

    window.addEventListener('scroll', handleScrollEffects);
    handleScrollEffects(); // Run on load

    /* ==========================================================================
       3. INTERSECTION OBSERVER FOR SCROLL REVEAL ANIMATIONS
       ========================================================================== */
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const revealObserverOptions = {
        root: null,
        threshold: 0.12, // Element is 12% visible
        rootMargin: '0px 0px -40px 0px' // Trigger slightly before screen edge
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                // Stagger bullet lists and child elements automatically if they have delays
                if (entry.target.classList.contains('glass-card') || entry.target.classList.contains('guide-card')) {
                    const children = entry.target.querySelectorAll('.bullet-list li, .guide-content *');
                    children.forEach((child, index) => {
                        child.style.transitionDelay = `${index * 0.08}s`;
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    });
                }
                observer.unobserve(entry.target); // Animates once
            }
        });
    }, revealObserverOptions);

    animatedElements.forEach((el) => {
        revealObserver.observe(el);
    });

    /* ==========================================================================
       4. MOBILE HAMBURGER MENU ACTIONS
       ========================================================================== */
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navItems = document.querySelectorAll('.nav-menu a, .nav-menu .btn-cta');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking a link
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    /* ==========================================================================
       5. INTERACTIVE BUDGET CALCULATOR & ESTIMATOR
       ========================================================================== */
    const radioCards = document.querySelectorAll('.radio-card');
    const extraVoiceOver = document.getElementById('extraVoiceOver');
    const extraExpress = document.getElementById('extraExpress');
    const extraFormat = document.getElementById('extraFormat');
    const btnMinus = document.getElementById('btnMinus');
    const btnPlus = document.getElementById('btnPlus');
    const counterVal = document.getElementById('counterVal');
    
    // UI Output elements
    const summaryBasePrice = document.getElementById('summaryBasePrice');
    const summaryExtrasPrice = document.getElementById('summaryExtrasPrice');
    const summaryExtrasRow = document.getElementById('summaryExtrasRow');
    const summaryTotalPrice = document.getElementById('summaryTotalPrice');
    const priceDisplay = document.getElementById('priceDisplay');
    const emailCtaLink = document.getElementById('emailCtaLink');

    let basePrice = 850; // default to Cinematic
    let voiceOverPrice = 100;
    let expressPrice = 350;
    let formatPrice = 350;
    let changesRate = 150;
    let extraChangesCount = 0;

    // Handle plan selection card clicks
    radioCards.forEach(card => {
        card.addEventListener('click', () => {
            radioCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const radioInput = card.querySelector('input[type="radio"]');
            if (radioInput) {
                radioInput.checked = true;
                const planType = card.getAttribute('data-type');
                if (planType === 'express') {
                    basePrice = 350;
                } else if (planType === 'automatizado') {
                    basePrice = 550;
                } else {
                    basePrice = 850;
                }
                
                if (priceDisplay) {
                    priceDisplay.textContent = `$${basePrice}`;
                }
                calculateTotal();
            }
        });
    });

    // Counter controls for extra changes
    if (btnMinus && btnPlus && counterVal) {
        btnMinus.addEventListener('click', (e) => {
            e.stopPropagation();
            if (extraChangesCount > 0) {
                extraChangesCount--;
                counterVal.textContent = extraChangesCount;
                calculateTotal();
            }
        });

        btnPlus.addEventListener('click', (e) => {
            e.stopPropagation();
            extraChangesCount++;
            counterVal.textContent = extraChangesCount;
            calculateTotal();
        });
    }

    // Checkboxes change events
    if (extraVoiceOver) extraVoiceOver.addEventListener('change', calculateTotal);
    if (extraExpress) extraExpress.addEventListener('change', calculateTotal);
    if (extraFormat) extraFormat.addEventListener('change', calculateTotal);

    // Calculate sum logic
    function calculateTotal() {
        let extrasSum = 0;
        
        // Voice Over
        const isVoiceOver = extraVoiceOver && extraVoiceOver.checked;
        if (isVoiceOver) {
            extrasSum += voiceOverPrice;
        }

        // Express delivery
        const isExpress = extraExpress && extraExpress.checked;
        if (isExpress) {
            extrasSum += expressPrice;
        }

        // Format adaptation
        const isFormat = extraFormat && extraFormat.checked;
        if (isFormat) {
            extrasSum += formatPrice;
        }

        // Extra changes
        extrasSum += extraChangesCount * changesRate;

        const total = basePrice + extrasSum;

        // Update UI
        if (summaryBasePrice) summaryBasePrice.textContent = `$${basePrice.toLocaleString()}.00 MXN`;
        
        if (summaryExtrasPrice && summaryExtrasRow) {
            if (extrasSum > 0) {
                summaryExtrasPrice.textContent = `+$${extrasSum.toLocaleString()}.00 MXN`;
                summaryExtrasRow.style.display = 'flex';
            } else {
                summaryExtrasRow.style.display = 'none';
            }
        }

        if (summaryTotalPrice) {
            summaryTotalPrice.textContent = `$${total.toLocaleString()}.00 MXN`;
        }

        // Update Email Subject/Body dynamically
        updateEmailLink(total, isExpress, isFormat, isVoiceOver);
    }

    function updateEmailLink(total, isExpress, isFormat, isVoiceOver) {
        if (!emailCtaLink) return;

        let planName = 'Paquete Pro ($850 MXN)';
        if (basePrice === 350) {
            planName = 'Paquete Básico ($350 MXN)';
        } else if (basePrice === 550) {
            planName = 'Paquete Intermedio ($550 MXN)';
        }

        const voiceOverText = isVoiceOver ? "Sí (+ $100)" : "No";
        const expressText = isExpress ? "Sí (+ $350)" : "No";
        const formatText = isFormat ? "Sí (+ $350)" : "No";
        const changesText = extraChangesCount > 0 ? `${extraChangesCount} rondas (+ $${extraChangesCount * 150})` : "Ninguna";
        
        const subject = encodeURIComponent("Cotización de Video - Dalia AI Studio");
        
        const body = encodeURIComponent(
            `Hola Dalia AI Studio,\n\n` +
            `Me interesa contratar sus servicios de producción de video con IA.\n` +
            `He realizado una cotización en su sitio web con el siguiente detalle:\n\n` +
            `- Plan base: ${planName}\n` +
            `- Voz en off con IA (Hasta 30 palabras): ${voiceOverText}\n` +
            `- Entrega Express (12h): ${expressText}\n` +
            `- Adaptación de formato (9:16 y 16:9): ${formatText}\n` +
            `- Rondas de cambios extra: ${changesText}\n\n` +
            `Total estimado de inversión: $${total.toLocaleString()}.00 MXN\n\n` +
            `Por favor, póngase en contacto conmigo para validar los detalles e iniciar el proceso.\n\n` +
            `¡Saludos!`
        );

        emailCtaLink.setAttribute('href', `mailto:dalia.y.rea@gmail.com?subject=${subject}&body=${body}`);
    }

    // Scroll to contact when clicking "Solicitar Presupuesto"
    const btnApplyQuote = document.getElementById('btnApplyQuote');
    if (btnApplyQuote) {
        btnApplyQuote.addEventListener('click', (e) => {
            e.preventDefault();
            const contactSection = document.getElementById('contacto');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                
                // Add a subtle flash animation to email link to guide the user's eye
                setTimeout(() => {
                    if (emailCtaLink) {
                        emailCtaLink.style.transform = 'scale(1.03)';
                        emailCtaLink.style.transition = 'transform 0.3s ease';
                        setTimeout(() => {
                            emailCtaLink.style.transform = 'scale(1)';
                        }, 300);
                    }
                }, 800);
            }
        });
    }

    // Initial run to configure email link right away
    calculateTotal();

    /* ==========================================================================
       6. CONTACT SECTION CLIPBOARD COPY
       ========================================================================== */
    const copyCards = document.querySelectorAll('.contact-method-card');

    copyCards.forEach(card => {
        const btn = card.querySelector('.btn-copy');
        const copyText = card.getAttribute('data-copy');
        
        if (btn && copyText) {
            const handleCopy = (e) => {
                e.stopPropagation(); // Avoid triggering parent actions if any
                
                navigator.clipboard.writeText(copyText).then(() => {
                    const textSpan = btn.querySelector('.copy-text');
                    btn.classList.add('copied');
                    if (textSpan) textSpan.textContent = '¡Copiado!';
                    
                    // Reset back to copy in 2.5 seconds
                    setTimeout(() => {
                        btn.classList.remove('copied');
                        if (textSpan) textSpan.textContent = 'Copiar';
                    }, 2500);
                }).catch(err => {
                    console.error('Error al copiar texto: ', err);
                });
            };
            
            btn.addEventListener('click', handleCopy);
            card.addEventListener('click', handleCopy); // Clicking card also copies
        }
    });
});
