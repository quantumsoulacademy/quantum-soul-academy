document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Navigation Toggle ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });

    // --- Dynamic WhatsApp Button ---
    const whatsappButton = document.createElement('a');
    whatsappButton.href = "https://wa.me/918897800247";
    whatsappButton.target = "_blank";
    whatsappButton.className = "whatsapp-float";
    whatsappButton.innerHTML = '<i class="fab fa-whatsapp"></i>';
    document.body.appendChild(whatsappButton);

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal'); // Add 'reveal' class to HTML elements

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        revealElements.forEach((reveal) => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // --- Hero Typing Effect ---
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        const text = "Understanding the Mind, Awakening the Soul";
        heroSubtitle.textContent = ''; // Clear initial text
        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                heroSubtitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50); // Typing speed
            } else {
                heroSubtitle.style.borderRight = 'none'; // Remove cursor
            }
        }
        // Start typing after a short delay
        setTimeout(typeWriter, 500);
    }


    // --- Testimonial Carousel ---
    const track = document.querySelector('.testimonial-track');
    const slides = Array.from(track ? track.children : []);
    const nextButton = document.querySelector('.carousel-btn.next');
    const prevButton = document.querySelector('.carousel-btn.prev');

    if (track && slides.length > 0) {
        let currentSlideIndex = 0;

        const updateSlidePosition = () => {
            const slideWidth = slides[0].getBoundingClientRect().width;
            track.style.transform = 'translateX(-' + (slideWidth * currentSlideIndex) + 'px)';
        };

        nextButton.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            updateSlidePosition();
        });

        prevButton.addEventListener('click', () => {
            currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
            updateSlidePosition();
        });

        // Touch Swipe for Mobile
        let touchstartX = 0;
        let touchendX = 0;

        track.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        });

        track.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            if (touchendX < touchstartX - 50) {
                // Swiped Left -> Next
                nextButton.click();
            }
            if (touchendX > touchstartX + 50) {
                // Swiped Right -> Prev
                prevButton.click();
            }
        }

        // Handle Resize
        window.addEventListener('resize', updateSlidePosition);
    }







    // --- Dynamic Form Submission (Netlify AJAX) ---
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;

            // Loading State
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    if (response.ok) {
                        // Success State
                        return response.json();
                    } else {
                        return response.json().then(data => {
                            if (Object.hasOwn(data, 'errors')) {
                                const errorMessages = data.errors.map(error => error["message"]).join(", ");
                                throw new Error(errorMessages);
                            } else {
                                throw new Error('Oops! There was a problem submitting your form');
                            }
                        })
                    }
                })
                .then(() => {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                    submitBtn.style.backgroundColor = '#2ecc71'; // Green for success
                    submitBtn.style.color = '#fff';

                    // Redirect to Payment Page after short delay
                    setTimeout(() => {
                        contactForm.reset();
                        // Redirect
                        window.location.href = 'payment.html';
                    }, 1000);
                })
                .catch((error) => {
                    console.error('Submission error:', error);
                    submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
                    submitBtn.style.backgroundColor = '#e74c3c';

                    setTimeout(() => {
                        alert('Error: ' + error.message);
                        submitBtn.disabled = false;
                        submitBtn.style.backgroundColor = '';
                        submitBtn.innerHTML = originalBtnText;
                    }, 2000);
                });
        });
    }


    // --- Impact Carousel (About Page) ---
    const impactTrack = document.querySelector('.impact-track');
    if (impactTrack) {
        const impactSlides = Array.from(impactTrack.children);
        const nextBtn = document.querySelector('.impact-btn.next');
        const prevBtn = document.querySelector('.impact-btn.prev');
        let currentIndex = 0;

        // Function to get visible slides based on screen width
        const getVisibleSlides = () => {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 768) return 2;
            return 1;
        };

        const updateCarousel = () => {
            const visibleSlides = getVisibleSlides();
            // Calculate width of one slide percentage
            const slideWidth = 100 / visibleSlides;

            // Limit index bound
            const maxIndex = impactSlides.length - visibleSlides;
            if (currentIndex > maxIndex) currentIndex = 0;
            if (currentIndex < 0) currentIndex = maxIndex;

            // Move track
            impactTrack.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
        };

        nextBtn.addEventListener('click', () => {
            currentIndex++;
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex--;
            updateCarousel();
        });

        // Auto Scroll
        setInterval(() => {
            const visibleSlides = getVisibleSlides();
            if (currentIndex < impactSlides.length - visibleSlides) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        }, 2000); // Increased speed: 2 seconds

        // Update on resize
        window.addEventListener('resize', updateCarousel);
    }
    // --- FAQ Accordion ---
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;

            // Toggle active class
            question.classList.toggle('active');

            // Toggle max-height
            if (question.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = 0;
            }

            // Optional: Close other FAQs when one is opened
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question && otherQuestion.classList.contains('active')) {
                    otherQuestion.classList.remove('active');
                    otherQuestion.nextElementSibling.style.maxHeight = 0;
                }
            });
        });
    });

    // --- Founder Name Typing Effect ---
    const founderNameElement = document.querySelector('.founder-name');
    if (founderNameElement) {
        const fullText = "V. Raja Sekhar"; // specific text
        founderNameElement.textContent = ""; // Clear initially
        founderNameElement.style.borderRight = "3px solid var(--secondary-color)"; // Create cursor

        let charIndex = 0;
        let isTyping = false;

        const typeFounderName = () => {
            if (charIndex < fullText.length) {
                founderNameElement.textContent += fullText.charAt(charIndex);
                charIndex++;
                setTimeout(typeFounderName, 100); // Typing speed
            } else {
                // Typing finished
                founderNameElement.style.borderRight = "none"; // Remove cursor
            }
        };

        // Use IntersectionObserver to start typing when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !isTyping) {
                    isTyping = true;
                    // Small delay before starting
                    setTimeout(typeFounderName, 300);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(founderNameElement.parentElement); // Observe the H3 or parent
    }
});
