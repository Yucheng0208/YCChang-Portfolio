// =======================================================
//  首頁專用功能 - index.js
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // 首頁3D旋轉木馬影音視窗
    (function setupVideoWindow() {
        const videoIds = ["4RvHph2q0Hc", "4RvHph2q0Hc", "4RvHph2q0Hc", "4RvHph2q0Hc", "4RvHph2q0Hc"];
        let currentIndex = 0;
        
        const container = document.querySelector('.video-carousel-section');
        if (!container || videoIds.length === 0) return;
        
        const carouselContainer = container.querySelector('.video-carousel-container');
        const prevBtn = container.querySelector('.video-carousel-prev');
        const nextBtn = container.querySelector('.video-carousel-next');
        
        if (!carouselContainer || !prevBtn || !nextBtn) return;
        
        const slides = carouselContainer.querySelectorAll('.video-carousel-slide');
        
        function initializeVideoSlides() {
            slides.forEach((slide, index) => {
                const iframe = slide.querySelector('iframe');
                if (iframe) {
                    const videoIndex = (currentIndex + index) % videoIds.length;
                    iframe.src = `https://www.youtube.com/embed/${videoIds[videoIndex]}`;
                }
            });
        }
        
        function updateCarouselPositions() {
            slides.forEach((slide, slideIndex) => {
                const relativePosition = (slideIndex - 2 + slides.length) % slides.length;
                slide.setAttribute('data-position', relativePosition);
                
                const iframe = slide.querySelector('iframe');
                if (iframe) {
                    const videoIndex = (currentIndex + relativePosition) % videoIds.length;
                    iframe.src = `https://www.youtube.com/embed/${videoIds[videoIndex]}`;
                }
            });
        }
        
        function rotateCarousel(direction) {
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            
            if (direction === 'next') {
                currentIndex = (currentIndex + 1) % videoIds.length;
            } else {
                currentIndex = (currentIndex - 1 + videoIds.length) % videoIds.length;
            }
            
            slides.forEach((slide, slideIndex) => {
                const currentPosition = parseInt(slide.getAttribute('data-position'));
                let newPosition;
                
                if (direction === 'next') {
                    newPosition = (currentPosition - 1 + 5) % 5;
                } else {
                    newPosition = (currentPosition + 1) % 5;
                }
                
                slide.setAttribute('data-position', newPosition);
                
                const iframe = slide.querySelector('iframe');
                if (iframe) {
                    const videoIndex = (currentIndex + newPosition) % videoIds.length;
                    iframe.src = `https://www.youtube.com/embed/${videoIds[videoIndex]}`;
                }
            });
            
            setTimeout(() => {
                prevBtn.disabled = false;
                nextBtn.disabled = false;
            }, 800);
        }
        
        prevBtn.addEventListener('click', () => {
            rotateCarousel('prev');
        });
        
        nextBtn.addEventListener('click', () => {
            rotateCarousel('next');
        });
        
        initializeVideoSlides();
        
        document.addEventListener('keydown', (e) => {
            if (container.querySelector(':hover')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    rotateCarousel('prev');
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    rotateCarousel('next');
                }
            }
        });
    })();

    // Skills Section Progress Bar Animation
    (function setupSkillsObserver() {
        const skillsSection = document.querySelector('#skills');
        if (!skillsSection) return;
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };
        
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBars = skillsSection.querySelectorAll('.progress-bar');
                    progressBars.forEach(bar => {
                        const targetWidth = bar.dataset.width;
                        bar.style.width = targetWidth;
                        const skillItem = bar.closest('.skill-item');
                        if (skillItem) {
                            const textSpan = skillItem.querySelector('.text-muted');
                            if (textSpan) {
                                textSpan.textContent = targetWidth;
                            }
                        }
                    });
                    observer.unobserve(skillsSection);
                }
            });
        }, observerOptions);
        
        observer.observe(skillsSection);
    })();

    // Recent Events Carousel
    (async function setupRecentEventsCarousel() {
        const carouselSection = document.getElementById('recent-events');
        if (!carouselSection) return;

        let eventsData = [];
        try {
            const response = await fetch('./data/yaml/events.yaml');
            if (!response.ok) throw new Error(`Failed to load events.yaml: ${response.status} ${response.statusText}`);
            const yamlText = await response.text();
            eventsData = window.jsyaml.load(yamlText) || [];
        } catch (error) {
            console.error("Could not load recent events data:", error);
            carouselSection.style.display = 'none';
            return;
        }

        if (eventsData.length === 0) {
            console.warn("No event data found in events.yaml. Hiding events section.");
            carouselSection.style.display = 'none';
            return;
        }

        const grid = document.getElementById('events-grid');
        const prevBtn = document.getElementById('prev-event');
        const nextBtn = document.getElementById('next-event');
        const playBtn = document.getElementById('play-event-autoplay');
        const pauseBtn = document.getElementById('pause-event-autoplay');

        if (!grid || !prevBtn || !nextBtn || !playBtn || !pauseBtn) return;
        
        let currentIndex = 0;
        let autoplayInterval = null;
        const AUTOPLAY_SPEED = 2000;
        let resizeTimer;
        
        function getVisibleCards() {
            if (window.innerWidth <= 600) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }

        function adjustDescriptionFontSize() {
            const descriptions = document.querySelectorAll('.event-card .event-info p');
            descriptions.forEach(p => {
                p.classList.remove('text-fit');
                if (p.scrollHeight > p.clientHeight) {
                    p.classList.add('text-fit');
                }
            });
        }

        function renderAllCards() {
            grid.innerHTML = '';
            const visibleCards = getVisibleCards();
            
            if (eventsData.length <= visibleCards) {
                eventsData.forEach(event => grid.appendChild(createCard(event)));
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                playBtn.style.display = 'none';
                pauseBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
                for (let i = 0; i < visibleCards; i++) {
                    grid.appendChild(createCard(eventsData[eventsData.length - 1 - i]));
                }
                eventsData.forEach(event => grid.appendChild(createCard(event)));
                for (let i = 0; i < visibleCards; i++) {
                    grid.appendChild(createCard(eventsData[i]));
                }
            }
            
            setTimeout(adjustDescriptionFontSize, 50);
            updateCarouselPosition(false);
        }

        function createCard(event) {
            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'event-card-wrapper';
            
            const visibleCards = getVisibleCards();
            cardWrapper.style.width = `${100 / visibleCards}%`;

            const card = document.createElement('div');
            card.className = 'event-card';
            card.innerHTML = `
                <div class="event-image-container">
                    <img src="${event.image}" alt="${event.title}">
                </div>
                <div class="event-info">
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                </div>
            `;
            card.addEventListener('mouseenter', pauseAutoplay);
            card.addEventListener('mouseleave', startAutoplay);
            
            cardWrapper.appendChild(card);
            return cardWrapper;
        }
        
        function updateCarouselPosition(animate = true) {
            const visibleCards = getVisibleCards();
            const offset = currentIndex + visibleCards;
            const cardWidthPercentage = 100 / visibleCards;
            
            grid.style.transition = animate ? 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
            grid.style.transform = `translateX(-${offset * cardWidthPercentage}%)`;
        }
        
        function handleSlide(direction) {
            const visibleCards = getVisibleCards();
            if (eventsData.length <= visibleCards) return;
            currentIndex += direction;
            updateCarouselPosition();
            if (currentIndex >= eventsData.length) {
                setTimeout(() => {
                    currentIndex = 0;
                    updateCarouselPosition(false);
                }, 600);
            } else if (currentIndex < 0) {
                setTimeout(() => {
                    currentIndex = eventsData.length - 1;
                    updateCarouselPosition(false);
                }, 600);
            }
        }

        function showNext() { handleSlide(1); }
        function showPrev() { handleSlide(-1); }
        
        function startAutoplay() {
            const visibleCards = getVisibleCards();
            if (eventsData.length <= visibleCards) return;
            if (autoplayInterval) return;
            pauseBtn.classList.remove('hidden');
            playBtn.classList.add('hidden');
            autoplayInterval = setInterval(showNext, AUTOPLAY_SPEED);
        }

        function pauseAutoplay() {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
            pauseBtn.classList.add('hidden');
            playBtn.classList.remove('hidden');
        }
        
        function resetAutoplay() {
            pauseAutoplay();
            startAutoplay();
        }

        nextBtn.addEventListener('click', () => { showNext(); resetAutoplay(); });
        prevBtn.addEventListener('click', () => { showPrev(); resetAutoplay(); });
        pauseBtn.addEventListener('click', pauseAutoplay);
        playBtn.addEventListener('click', startAutoplay);

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                renderAllCards();
                resetAutoplay();
            }, 250);
        });

        renderAllCards();
        startAutoplay();
    })();
    
});