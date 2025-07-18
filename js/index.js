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

    // Skills Section Progress Bar Animation - 增強版本
    (function setupSkillsObserver() {
        const skillsSection = document.querySelector('#skills');
        if (!skillsSection) return;
        
        // 設定各技能的百分比數據
        const skillsData = {
            'Artificial Intelligence': [
                { name: 'Machine Learning', percentage: 85 },
                { name: 'Deep Learning', percentage: 80 },
                { name: 'Computer Vision', percentage: 75 },
                { name: 'Natural Language Processing', percentage: 70 }
            ],
            'Internet of Things': [
                { name: 'Embedded Systems', percentage: 90 },
                { name: 'Sensor Networks', percentage: 85 },
                { name: 'Edge Computing', percentage: 80 },
                { name: 'Real-time Systems', percentage: 75 }
            ],
            'Design & Innovation': [
                { name: 'Design Thinking', percentage: 88 },
                { name: 'User Experience Design', percentage: 75 },
                { name: 'Innovation Management', percentage: 82 },
                { name: 'Product Development', percentage: 78 }
            ],
            'Academic Research': [
                { name: 'Research Methodology', percentage: 90 },
                { name: 'Technical Writing', percentage: 85 },
                { name: 'Data Analysis', percentage: 88 },
                { name: 'Publication', percentage: 80 }
            ],
            'Industry Collaboration': [
                { name: 'Project Management', percentage: 85 },
                { name: 'Technology Transfer', percentage: 78 },
                { name: 'Industry Partnerships', percentage: 82 },
                { name: 'Business Development', percentage: 75 }
            ],
            'Teaching & Leadership': [
                { name: 'Technical Mentoring', percentage: 90 },
                { name: 'Team Leadership', percentage: 85 },
                { name: 'Knowledge Transfer', percentage: 88 },
                { name: 'Student Guidance', percentage: 92 }
            ]
        };

        // 初始化技能數據到 HTML 元素
        function initializeSkillsData() {
            const skillCards = skillsSection.querySelectorAll('.skill-card');
            
            skillCards.forEach((card, cardIndex) => {
                const skillTitle = card.querySelector('.skill-title').textContent.trim();
                const skillItems = card.querySelectorAll('.skill-item');
                const data = skillsData[skillTitle];
                
                if (data && skillItems.length >= data.length) {
                    skillItems.forEach((item, itemIndex) => {
                        if (data[itemIndex]) {
                            const nameSpan = item.querySelector('.fw-medium');
                            const percentageSpan = item.querySelector('.text-muted');
                            const progressBar = item.querySelector('.progress-bar');
                            
                            if (nameSpan && percentageSpan && progressBar) {
                                nameSpan.textContent = data[itemIndex].name;
                                percentageSpan.textContent = '0%'; // 初始設為 0%
                                progressBar.dataset.width = `${data[itemIndex].percentage}%`;
                                progressBar.style.width = '0%'; // 初始寬度為 0
                            }
                        }
                    });
                }
            });
        }

        // 動畫效果函數
        function animateProgressBars() {
            const progressBars = skillsSection.querySelectorAll('.progress-bar');
            
            progressBars.forEach((bar, index) => {
                const targetWidth = parseInt(bar.dataset.width);
                const skillItem = bar.closest('.skill-item');
                const textSpan = skillItem ? skillItem.querySelector('.text-muted') : null;
                
                // 延遲動畫，讓每個進度條依序出現
                setTimeout(() => {
                    // 設定過渡效果
                    bar.style.transition = 'width 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    bar.style.width = `${targetWidth}%`;
                    
                    // 同時動畫化數字
                    if (textSpan) {
                        animatePercentageText(textSpan, targetWidth);
                    }
                }, index * 100); // 每個進度條延遲 100ms
            });
        }

        // 百分比數字動畫
        function animatePercentageText(element, targetValue) {
            let currentValue = 0;
            const duration = 1500; // 1.5 秒
            const startTime = performance.now();
            
            function updateText(timestamp) {
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // 使用 easeOutCubic 緩動函數
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                currentValue = Math.round(targetValue * easedProgress);
                
                element.textContent = `${currentValue}%`;
                
                if (progress < 1) {
                    requestAnimationFrame(updateText);
                }
            }
            
            requestAnimationFrame(updateText);
        }
        
        const observerOptions = {
            root: null,
            rootMargin: '-50px 0px', // 進入視窗 50px 後觸發
            threshold: 0.3 // 30% 可見時觸發
        };
        
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 添加一個小延遲讓用戶能看到動畫開始
                    setTimeout(() => {
                        animateProgressBars();
                    }, 200);
                    observer.unobserve(skillsSection);
                }
            });
        }, observerOptions);
        
        // 初始化數據並開始觀察
        initializeSkillsData();
        observer.observe(skillsSection);
    })();

    // Recent Events Carousel - 修正版本
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
        let isAutoplayActive = true; // 追蹤自動播放狀態
        
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
                // 顯示控制按鈕，但根據當前狀態決定顯示哪個
                updateControlButtonsVisibility();
                
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
            
            // 滑鼠懸停時暫停自動播放，離開時恢復（如果之前是啟用狀態）
            card.addEventListener('mouseenter', () => {
                if (isAutoplayActive) {
                    pauseAutoplayTemporarily();
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (isAutoplayActive) {
                    startAutoplay();
                }
            });
            
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
        
        // 更新控制按鈕的顯示狀態
        function updateControlButtonsVisibility() {
            if (isAutoplayActive) {
                // 自動播放啟用狀態，顯示暫停按鈕
                pauseBtn.style.display = 'flex';
                playBtn.style.display = 'none';
            } else {
                // 自動播放停止狀態，顯示播放按鈕
                pauseBtn.style.display = 'none';
                playBtn.style.display = 'flex';
            }
        }
        
        // 開始自動播放
        function startAutoplay() {
            const visibleCards = getVisibleCards();
            if (eventsData.length <= visibleCards) return;
            if (autoplayInterval) return; // 避免重複設定
            
            isAutoplayActive = true;
            autoplayInterval = setInterval(showNext, AUTOPLAY_SPEED);
            updateControlButtonsVisibility();
        }

        // 完全暫停自動播放（用戶主動點擊暫停）
        function pauseAutoplay() {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
            isAutoplayActive = false;
            updateControlButtonsVisibility();
        }
        
        // 臨時暫停自動播放（滑鼠懸停時）
        function pauseAutoplayTemporarily() {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
            // 不改變 isAutoplayActive 狀態，這樣離開時可以恢復
            // 暫時不更新按鈕顯示，保持原本的狀態
        }
        
        // 重新啟動自動播放（用戶點擊播放或操作後重置）
        function resetAutoplay() {
            if (isAutoplayActive) {
                pauseAutoplayTemporarily(); // 先清除現有的
                startAutoplay(); // 重新開始
            }
        }

        // 事件監聽器
        nextBtn.addEventListener('click', () => { 
            showNext(); 
            resetAutoplay(); 
        });
        
        prevBtn.addEventListener('click', () => { 
            showPrev(); 
            resetAutoplay(); 
        });
        
        // 用戶主動點擊暫停按鈕
        pauseBtn.addEventListener('click', () => {
            pauseAutoplay();
        });
        
        // 用戶主動點擊播放按鈕
        playBtn.addEventListener('click', () => {
            startAutoplay();
        });

        // 視窗大小改變時重新渲染
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                renderAllCards();
                if (isAutoplayActive) {
                    resetAutoplay();
                }
            }, 250);
        });

        // 初始化
        renderAllCards();
        startAutoplay(); // 預設開始自動播放
    })();
    
});