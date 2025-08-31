// =======================================================
//  404錯誤頁面專用功能 - 404.js
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    
    // 防止其他腳本自動跳轉
    console.log('404 page loaded, preventing auto-redirects');
    
    // 載入導航列
    loadNavbar();
    
    // 設定當前年份
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // 回到頂部按鈕功能
    initBackToTopButton();
    
    // 頁面載入動畫
    initPageLoadAnimation();
    
    // 創建額外的背景球球
    createAdditionalFloatingBalls();
    
    // Easter Egg - 控制台訊息
    displayConsoleMessages();
    
    // 鍵盤快捷鍵支援
    initKeyboardShortcuts();
    
    // 404數字互動效果
    init404NumberInteraction();
    
    // 按鈕點擊追蹤（可選）
    initButtonTracking();
    
});

// 載入導航列功能
async function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.warn('Navbar container not found');
        return;
    }

    try {
        const response = await fetch('navbar.html');
        if (!response.ok) {
            throw new Error(`Failed to load navbar: ${response.status}`);
        }
        const navbarHTML = await response.text();
        navbarContainer.innerHTML = navbarHTML;
        
        // 初始化導航列功能
        initNavbarFeatures();
    } catch (error) {
        console.error('Error loading navbar:', error);
        // 如果載入失敗，隱藏容器避免佈局問題
        navbarContainer.style.display = 'none';
    }
}

// 初始化導航列功能
function initNavbarFeatures() {
    // 漢堡選單切換
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navLinks = document.querySelector('.nav-links');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            document.body.classList.toggle('menu-open');
            hamburgerBtn.classList.toggle('is-active');
            navLinks.classList.toggle('is-active');
        });
    }

    // 下拉選單處理
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            const parentLi = toggle.closest('.nav-item-dropdown');
            const isSubmenuToggle = parentLi && parentLi.closest('.dropdown-menu') !== null;
            
            if (hamburgerBtn && window.getComputedStyle(hamburgerBtn).display !== 'none') {
                event.preventDefault();
                if (parentLi) {
                    parentLi.classList.toggle('is-open');
                    if (isSubmenuToggle) {
                        event.stopPropagation();
                    }
                }
            } else if (isSubmenuToggle) {
                event.preventDefault();
                event.stopPropagation();
                
                const siblingItems = parentLi.parentElement.querySelectorAll('.nav-item-dropdown.is-open');
                siblingItems.forEach(sibling => {
                    if (sibling !== parentLi) sibling.classList.remove('is-open');
                });
                
                parentLi.classList.toggle('is-open');
            }
        });
    });
    
    // 點擊外部關閉下拉選單
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown-menu')) {
            document.querySelectorAll('.dropdown-menu .nav-item-dropdown.is-open').forEach(item => {
                item.classList.remove('is-open');
            });
        }
    });
}
function initBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (!backToTopBtn) return;
    
    // 監聽滾動事件
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('is-visible');
        } else {
            backToTopBtn.classList.remove('is-visible');
        }
    });
    
    // 點擊事件
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 頁面載入動畫初始化
function initPageLoadAnimation() {
    // 添加載入完成的類名以觸發動畫
    document.body.classList.add('loaded');
    
    // 延遲顯示內容以確保動畫效果
    const errorContent = document.querySelector('.error-content');
    if (errorContent) {
        errorContent.style.opacity = '0';
        errorContent.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            errorContent.style.opacity = '1';
            errorContent.style.transform = 'translateY(0)';
            errorContent.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        }, 100);
    }
}

// 控制台訊息顯示
function displayConsoleMessages() {
    const styles = {
        title: 'color: #64d2ff; font-size: 1.2rem; font-weight: bold; font-family: monospace;',
        body: 'color: #c9d1d9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
        link: 'color: #64d2ff; text-decoration: underline; font-family: monospace;',
        highlight: 'background: #161b22; color: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace;'
    };

    console.log('%c404 - But you found the console! 🎯', styles.title);
    console.log('%cLooks like you\'re exploring beyond the usual paths. I like that! 🚀', styles.body);
    console.log('%cHere are some keyboard shortcuts you can try:', styles.body);
    console.log('%cPress "H" to go Home | Press "B" to go Back', styles.highlight);
    
    // 額外的彩蛋訊息
    setTimeout(() => {
        console.log('%cPsst... Click on the big 404 number for a surprise! ✨', 'color: #feca57; font-style: italic;');
    }, 2000);
}

// 鍵盤快捷鍵初始化
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // 確保不在輸入欄位中
        const activeElement = document.activeElement;
        const isInputField = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.contentEditable === 'true'
        );
        
        if (isInputField) return;
        
        const key = e.key.toLowerCase();
        
        // 按H鍵回到首頁
        if (key === 'h' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            showNavigationHint('Navigating to Home...', () => {
                window.location.href = 'index.html';
            });
        }
        
        // 按B鍵返回上一頁
        if (key === 'b' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            showNavigationHint('Going back...', () => {
                history.back();
            });
        }
        
        // 按P鍵前往作品集頁面
        if (key === 'p' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            showNavigationHint('Opening Projects...', () => {
                window.location.href = 'projects.html';
            });
        }
        
        // 按R鍵重新載入頁面
        if (key === 'r' && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            showNavigationHint('Refreshing page...', () => {
                window.location.reload();
            });
        }
    });
}

// 導航提示顯示
function showNavigationHint(message, callback) {
    // 創建提示元素
    const hint = document.createElement('div');
    hint.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(13, 17, 23, 0.95);
        color: #64d2ff;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 9999;
        border: 1px solid rgba(100, 210, 255, 0.3);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        transform: translateY(-20px);
        opacity: 0;
        transition: all 0.3s ease;
    `;
    hint.textContent = message;
    document.body.appendChild(hint);
    
    // 觸發動畫
    setTimeout(() => {
        hint.style.transform = 'translateY(0)';
        hint.style.opacity = '1';
    }, 10);
    
    // 執行回調並移除提示
    setTimeout(() => {
        hint.style.transform = 'translateY(-20px)';
        hint.style.opacity = '0';
        setTimeout(() => {
            if (hint.parentNode) {
                hint.parentNode.removeChild(hint);
            }
            if (callback) callback();
        }, 300);
    }, 1200);
}

// 404數字互動效果初始化
function init404NumberInteraction() {
    const errorCode = document.querySelector('.error-code');
    if (!errorCode) return;
    
    let clickCount = 0;
    const messages = [
        'Still 404! 🤷‍♂️',
        'Nope, still lost! 🗺️',
        'The wave dance continues! 🌊',
        'Maybe try the buttons below? 👇',
        'You\'re persistent! I like that! 💪'
    ];
    
    errorCode.addEventListener('click', function() {
        // 暫停所有數字的動畫然後重啟
        const digits = this.querySelectorAll('.digit');
        digits.forEach(digit => {
            digit.style.animationPlayState = 'paused';
            setTimeout(() => {
                digit.style.animationPlayState = 'running';
            }, 100);
        });
        
        // 添加額外的脈衝效果
        this.style.animation = 'pulse 0.6s ease-out';
        
        // 增加點擊計數
        clickCount++;
        
        // 顯示彩蛋訊息
        if (clickCount <= messages.length) {
            showClickMessage(messages[clickCount - 1]);
        }
        
        // 特殊效果：第5次點擊後的驚喜
        if (clickCount === 5) {
            triggerSpecialWaveEffect();
        }
    });
    
    // 重置動畫結束時的狀態
    errorCode.addEventListener('animationend', function() {
        this.style.animation = '';
    });
}

// 特殊波浪效果觸發
function triggerSpecialWaveEffect() {
    const digits = document.querySelectorAll('.digit');
    
    digits.forEach((digit, index) => {
        digit.style.animation = `wave-dance 0.05s ease-in-out infinite`;  // 從 0.1s 改為 0.05s，更快的波浪效果
        digit.style.animationDelay = `${index * 0.005}s`;  // 也可以縮短延遲時間從 0.01s 到 0.005s
    });

    // 1秒後恢復正常 (也可以縮短恢復時間)
    setTimeout(() => {
        digits.forEach((digit, index) => {
            digit.style.animation = `wave-dance 0.05s ease-in-out infinite`;  // 保持快速
            digit.style.animationDelay = `${index * 0.005}s`;
        });
    }, 500);  // 從 1000ms 改為 500ms，更快恢復
    
    // 創建彩色粒子效果
    for (let i = 0; i < 2000; i++) {
        createParticle();
    }
    
    // 在控制台顯示特殊訊息
    console.log('%c🌊 Wave Dance Master! 🌊', 'color: #ffd700; font-size: 1.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
    console.log('%cYou made the 404 dance even wilder! 💃', 'color: #64d2ff; font-size: 1rem;');
}

// 顯示點擊訊息
function showClickMessage(message) {
    const existingMessage = document.querySelector('.click-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = 'click-message';
    messageElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: #64d2ff;
        padding: 15px 25px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: 600;
        z-index: 10000;
        border: 2px solid rgba(100, 210, 255, 0.5);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
        animation: messagePopup 2s ease-out forwards;
        pointer-events: none;
    `;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    
    // 2秒後移除訊息
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.remove();
        }
    }, 2000);
}

// 特殊效果觸發
function triggerSpecialEffect() {
    // 創建彩色粒子效果
    for (let i = 0; i < 20; i++) {
        createParticle();
    }
    
    // 在控制台顯示特殊訊息
    console.log('%c🎉 Congratulations! You found the Easter Egg! 🎉', 'color: #ffd700; font-size: 1.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);');
    console.log('%cYou\'re clearly someone who pays attention to details. That\'s exactly the kind of curiosity that drives great discoveries! 🚀', 'color: #64d2ff; font-size: 1rem;');
}

// 創建粒子效果
function createParticle() {
    const particle = document.createElement('div');
    const colors = ['#64d2ff', '#0a84ff', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${randomColor};
        border-radius: 50%;
        pointer-events: none;
        z-index: 10001;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        animation: particleFloat 3s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    // 3秒後移除粒子
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
        }
    }, 3000);
}

// 按鈕點擊追蹤初始化
function initButtonTracking() {
    const buttons = document.querySelectorAll('.error-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.querySelector('span')?.textContent || 'Unknown';
            
            // 簡單的點擊追蹤（可以替換為 Google Analytics 或其他分析工具）
            console.log(`404 Page - Button clicked: ${buttonText}`);
            
            // 添加點擊反饋效果
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// 添加必要的 CSS 動畫到頁面
addDynamicStyles();

// 視窗大小改變時的處理
window.addEventListener('resize', handleWindowResize);

// 處理瀏覽器前進/後退按鈕
window.addEventListener('popstate', handlePopState);

// 頁面可見性變化處理
document.addEventListener('visibilitychange', handleVisibilityChange);

// 添加動態樣式
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes messagePopup {
            0% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.5);
            }
            20% {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.1);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
            }
        }
        
        @keyframes particleFloat {
            0% {
                opacity: 1;
                transform: translateY(0) rotate(0deg);
            }
            100% {
                opacity: 0;
                transform: translateY(-200px) rotate(360deg);
            }
        }
        
        .click-message {
            animation: messagePopup 2s ease-out forwards;
        }
    `;
    document.head.appendChild(style);
}

// 處理視窗大小改變
function handleWindowResize() {
    // 清除之前的粒子效果以避免性能問題
    const particles = document.querySelectorAll('[style*="particleFloat"]');
    particles.forEach(particle => {
        if (particle.parentNode) {
            particle.remove();
        }
    });
}

// 處理瀏覽器前進/後退按鈕
function handlePopState(event) {
    // 可以在這裡添加自定義邏輯
    console.log('Navigation detected via browser buttons');
}

// 處理頁面可見性變化
function handleVisibilityChange() {
    if (document.hidden) {
        // 頁面被隱藏時暫停動畫
        const floatingElements = document.querySelectorAll('.floating-elements::before, .floating-elements::after');
        floatingElements.forEach(element => {
            element.style.animationPlayState = 'paused';
        });
    } else {
        // 頁面重新可見時恢復動畫
        const floatingElements = document.querySelectorAll('.floating-elements::before, .floating-elements::after');
        floatingElements.forEach(element => {
            element.style.animationPlayState = 'running';
        });
    }
}

// 工具函數：防抖處理
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 工具函數：節流處理
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// 檢測用戶的偏好設置
function detectUserPreferences() {
    // 檢測是否偏好減少動畫
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduce-motion');
    }
    
    // 檢測是否偏好暗色主題
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('prefer-dark');
    }
    
    // 檢測是否偏好高對比度
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
}

// 初始化用戶偏好檢測
detectUserPreferences();

// 監聽偏好設置變化
window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    if (e.matches) {
        document.body.classList.add('reduce-motion');
    } else {
        document.body.classList.remove('reduce-motion');
    }
});

// 錯誤處理
window.addEventListener('error', function(e) {
    console.warn('404 Page Error:', e.error);
    // 可以在這裡添加錯誤報告邏輯
});

// 未捕獲的 Promise 錯誤處理
window.addEventListener('unhandledrejection', function(e) {
    console.warn('404 Page Promise Rejection:', e.reason);
    e.preventDefault();
});