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

    // Skills Section Progress Bar Animation - 修正手機版問題
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
                const skillTitle = card.querySelector('.skill-title');
                if (!skillTitle) return;
                
                const skillTitleText = skillTitle.textContent.trim();
                const skillItems = card.querySelectorAll('.skill-item');
                const data = skillsData[skillTitleText];
                
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
                
                if (!targetWidth || !textSpan) return;
                
                // 延遲動畫，讓每個進度條依序出現
                setTimeout(() => {
                    // 設定過渡效果
                    bar.style.transition = 'width 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    bar.style.width = `${targetWidth}%`;
                    
                    // 同時動畫化數字
                    animatePercentageText(textSpan, targetWidth);
                }, index * 150); // 每個進度條延遲 150ms
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
        
        // 強制觸發動畫（用於手機版）
        function forceAnimateSkills() {
            console.log('Force animating skills...');
            setTimeout(() => {
                animateProgressBars();
            }, 500);
        }
        
        // 檢查是否在視窗中
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
        
        // 滾動監聽器（備用方案）
        function handleScroll() {
            if (isElementInViewport(skillsSection)) {
                console.log('Skills section is in viewport, animating...');
                animateProgressBars();
                window.removeEventListener('scroll', handleScroll);
            }
        }
        
        // 設定觀察器選項
        const observerOptions = {
            root: null,
            rootMargin: '-20px 0px', // 減少 margin
            threshold: 0.2 // 降低 threshold
        };
        
        // 創建觀察器
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                console.log('Intersection observed:', entry.isIntersecting, entry.intersectionRatio);
                if (entry.isIntersecting) {
                    console.log('Skills section entered viewport, starting animation...');
                    setTimeout(() => {
                        animateProgressBars();
                    }, 300);
                    observer.unobserve(skillsSection);
                }
            });
        }, observerOptions);
        
        // 初始化
        initializeSkillsData();
        
        // 檢查瀏覽器支援
        if ('IntersectionObserver' in window) {
            console.log('Using IntersectionObserver');
            observer.observe(skillsSection);
            
            // 備用方案：如果 3 秒後還沒動畫，強制執行
            setTimeout(() => {
                const progressBars = skillsSection.querySelectorAll('.progress-bar');
                const firstBar = progressBars[0];
                if (firstBar && firstBar.style.width === '0%') {
                    console.log('Fallback: Force animating after 3 seconds');
                    forceAnimateSkills();
                }
            }, 3000);
        } else {
            console.log('IntersectionObserver not supported, using scroll listener');
            // 如果不支援 IntersectionObserver，使用滾動監聽器
            window.addEventListener('scroll', handleScroll);
            
            // 立即檢查是否已經在視窗中
            if (isElementInViewport(skillsSection)) {
                forceAnimateSkills();
            }
        }
        
        // 頁面載入完成後的備用檢查
        window.addEventListener('load', () => {
            setTimeout(() => {
                const progressBars = skillsSection.querySelectorAll('.progress-bar');
                const firstBar = progressBars[0];
                if (firstBar && firstBar.style.width === '0%') {
                    console.log('Page loaded, force animating skills');
                    forceAnimateSkills();
                }
            }, 1000);
        });
        
        // 手機版觸摸事件檢測
        let touchStartTime = 0;
        document.addEventListener('touchstart', () => {
            touchStartTime = Date.now();
        });
        
        document.addEventListener('touchend', () => {
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < 300) { // 短觸摸
                setTimeout(() => {
                    if (isElementInViewport(skillsSection)) {
                        const progressBars = skillsSection.querySelectorAll('.progress-bar');
                        const firstBar = progressBars[0];
                        if (firstBar && firstBar.style.width === '0%') {
                            console.log('Touch detected, force animating skills');
                            forceAnimateSkills();
                        }
                    }
                }, 100);
            }
        });
        
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

    // 將這個函數添加到你的 index.js 文件中，放在 DOMContentLoaded 事件監聽器內部

    // Partnerships Carousel - 簡單直接的懸停提示實現
    (function setupPartnershipsCarousel() {
        const carouselContainer = document.querySelector('.partner-carousel-container');
        if (!carouselContainer) return;

        const track = document.querySelector('.partner-carousel-track');
        const prevBtn = document.querySelector('.partner-prev');
        const nextBtn = document.querySelector('.partner-next');
        const originalLogos = document.querySelectorAll('.partner-logo');
        
        if (!track || !prevBtn || !nextBtn || originalLogos.length === 0) return;

        let currentIndex = 0;
        let autoplayInterval = null;
        let isAnimating = false;
        const AUTOPLAY_SPEED = 3000; // 3秒
        const VISIBLE_LOGOS = 5; // 固定顯示5個
        const totalLogos = originalLogos.length;
        
        // 創建全局懸停提示元素
        let globalTooltip = null;
        
        function createGlobalTooltip() {
            if (globalTooltip) return;
            
            globalTooltip = document.createElement('div');
            globalTooltip.id = 'partnership-tooltip';
            globalTooltip.style.cssText = `
                position: fixed;
                background: rgba(13, 26, 46, 0.95);
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                font-size: 14px;
                pointer-events: none;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(127, 175, 224, 0.3);
                text-align: center;
                line-height: 1.4;
                max-width: 250px;
            `;
            document.body.appendChild(globalTooltip);
        }
        
        function showTooltip(event, zhName, enName) {
            if (!globalTooltip || !zhName || !enName) return;
            
            globalTooltip.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 4px;">${zhName}</div>
                <div style="font-size: 12px; opacity: 0.9;">${enName}</div>
            `;
            
            const rect = event.target.closest('.partner-logo').getBoundingClientRect();
            globalTooltip.style.left = (rect.left + rect.width / 2 - globalTooltip.offsetWidth / 2) + 'px';
            globalTooltip.style.top = (rect.top - globalTooltip.offsetHeight - 10) + 'px';
            globalTooltip.style.opacity = '1';
        }
        
        function hideTooltip() {
            if (globalTooltip) {
                globalTooltip.style.opacity = '0';
            }
        }
        
        // 計算單個LOGO的寬度（包含gap）
        function getLogoWidth() {
            const screenWidth = window.innerWidth;
            if (screenWidth <= 600) {
                return 110 + 16;
            } else if (screenWidth <= 768) {
                return 130 + 24;
            } else if (screenWidth <= 1024) {
                return 150 + 24;
            } else if (screenWidth <= 1200) {
                return 170 + 24;
            } else {
                return 200 + 24;
            }
        }
        
        // 為LOGO添加事件監聽器
        function addLogoEvents(logoElement) {
            const zhName = logoElement.getAttribute('data-zh-name');
            const enName = logoElement.getAttribute('data-en-name');
            
            // 測試：在console中顯示
            console.log('Adding events to:', zhName, enName);
            
            logoElement.addEventListener('mouseenter', (e) => {
                console.log('Mouse enter:', zhName, enName);
                stopAutoplay();
                showTooltip(e, zhName, enName);
            });
            
            logoElement.addEventListener('mouseleave', () => {
                console.log('Mouse leave');
                startAutoplay();
                hideTooltip();
            });
            
            logoElement.addEventListener('mousemove', (e) => {
                if (globalTooltip && globalTooltip.style.opacity === '1') {
                    const rect = e.target.closest('.partner-logo').getBoundingClientRect();
                    globalTooltip.style.left = (rect.left + rect.width / 2 - globalTooltip.offsetWidth / 2) + 'px';
                    globalTooltip.style.top = (rect.top - globalTooltip.offsetHeight - 10) + 'px';
                }
            });
            
            // 觸摸設備支援
            logoElement.addEventListener('touchstart', (e) => {
                console.log('Touch start:', zhName, enName);
                stopAutoplay();
                showTooltip(e, zhName, enName);
                
                // 觸摸3秒後自動隱藏
                setTimeout(() => {
                    hideTooltip();
                    startAutoplay();
                }, 3000);
            });
        }
        
        // 創建LOGO元素
        function createLogoElement(originalLogo) {
            const logoClone = originalLogo.cloneNode(true);
            
            // 確保所有屬性都被複製
            logoClone.href = originalLogo.href;
            logoClone.target = originalLogo.target;
            logoClone.rel = originalLogo.rel;
            logoClone.className = originalLogo.className;
            
            const zhName = originalLogo.getAttribute('data-zh-name');
            const enName = originalLogo.getAttribute('data-en-name');
            
            if (zhName) logoClone.setAttribute('data-zh-name', zhName);
            if (enName) logoClone.setAttribute('data-en-name', enName);
            
            // 添加事件監聽器
            addLogoEvents(logoClone);
            
            return logoClone;
        }
        
        // 創建無縫循環的LOGO序列
        function createSeamlessLoop() {
            hideTooltip();
            track.innerHTML = '';
            
            const totalNeeded = totalLogos + VISIBLE_LOGOS;
            
            for (let i = 0; i < totalNeeded; i++) {
                const originalIndex = i % totalLogos;
                const logoElement = createLogoElement(originalLogos[originalIndex]);
                track.appendChild(logoElement);
            }
        }
        
        // 更新輪播位置
        function updateCarouselPosition(animate = true) {
            const logoWidth = getLogoWidth();
            const offset = currentIndex * logoWidth;
            
            if (animate) {
                track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            } else {
                track.style.transition = 'none';
            }
            
            track.style.transform = `translateX(-${offset}px)`;
        }
        
        // 移動到下一個
        function moveNext() {
            if (isAnimating) return;
            
            hideTooltip();
            isAnimating = true;
            currentIndex++;
            updateCarouselPosition(true);
            
            setTimeout(() => {
                if (currentIndex >= totalLogos) {
                    currentIndex = 0;
                    updateCarouselPosition(false);
                }
                isAnimating = false;
            }, 500);
        }
        
        // 移動到上一個
        function movePrev() {
            if (isAnimating) return;
            
            hideTooltip();
            isAnimating = true;
            
            if (currentIndex === 0) {
                currentIndex = totalLogos;
                updateCarouselPosition(false);
                setTimeout(() => {
                    currentIndex--;
                    updateCarouselPosition(true);
                    setTimeout(() => {
                        isAnimating = false;
                    }, 500);
                }, 10);
            } else {
                currentIndex--;
                updateCarouselPosition(true);
                setTimeout(() => {
                    isAnimating = false;
                }, 500);
            }
        }
        
        // 自動播放控制
        function startAutoplay() {
            if (autoplayInterval) return;
            autoplayInterval = setInterval(moveNext, AUTOPLAY_SPEED);
        }
        
        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
                autoplayInterval = null;
            }
        }
        
        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }
        
        // 初始化
        function initialize() {
            createGlobalTooltip();
            createSeamlessLoop();
            updateCarouselPosition(false);
            startAutoplay();
        }
        
        // 事件監聽器
        nextBtn.addEventListener('click', () => {
            moveNext();
            restartAutoplay();
        });
        
        prevBtn.addEventListener('click', () => {
            movePrev();
            restartAutoplay();
        });
        
        // 響應式處理
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                hideTooltip();
                updateCarouselPosition(false);
            }, 250);
        });
        
        // 初始化
        initialize();
    })();

    // Contact Form Handler - 聯絡表單處理功能
    (function setupContactForm() {
        const form = document.getElementById('contactForm');
        const submitBtn = form?.querySelector('.contact-submit-btn');
        const btnText = submitBtn?.querySelector('.btn-text');
        const btnLoading = submitBtn?.querySelector('.btn-loading');
        const formMessage = document.getElementById('formMessage');
        
        if (!form || !submitBtn || !btnText || !btnLoading || !formMessage) return;

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 禁用提交按鈕並顯示載入狀態
            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            formMessage.classList.add('hidden');
            
            // 收集表單資料
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };
            
            try {
                // 模擬 API 請求（你可以替換成實際的後端 API）
                await simulateEmailSend(data);
                
                // 成功處理
                showMessage('Thank you for your message! I\'ll get back to you soon.', 'success');
                form.reset();
                
            } catch (error) {
                // 錯誤處理
                showMessage('Sorry, something went wrong. Please try again or contact me directly.', 'error');
            } finally {
                // 恢復按鈕狀態
                submitBtn.disabled = false;
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
            }
        });
        
        // 顯示訊息函數
        function showMessage(message, type) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type}`;
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // 5秒後自動隱藏訊息
            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 5000);
        }
        
    // 替換 simulateEmailSend 函數
    async function sendEmailViaEmailJS(data) {
        // 初始化 EmailJS（需要先註冊 EmailJS 獲得這些 ID）
        emailjs.init("J-UdifHZeqCLC6e2Z");
        
        return emailjs.send(
            "service_13p1trj",    // 郵件服務 ID
            "template_2wy6r9m",   // 模板 ID  
            {
                from_name: data.name,
                from_email: data.email,
                subject: data.subject,
                message: data.message,
                to_email: "yucheng208@outlook.com" // 你的收件信箱
            }
        );
    }
        
        // 表單驗證增強
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
        
        function validateField(field) {
            const value = field.value.trim();
            let isValid = true;
            
            // 移除之前的錯誤樣式
            field.style.borderColor = '';
            
            if (field.hasAttribute('required') && !value) {
                isValid = false;
            } else if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(value);
            }
            
            // 添加視覺回饋
            if (!isValid) {
                field.style.borderColor = '#dc3545';
            } else if (value) {
                field.style.borderColor = '#28a745';
            }
            
            return isValid;
        }
    })();
    
});