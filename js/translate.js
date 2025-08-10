document.addEventListener('DOMContentLoaded', function() {
    // --- Custom Language Switcher Logic ---

    const switcher = document.querySelector('.custom-lang-switcher');
    const langBall = document.querySelector('.lang-ball');
    const langMenu = document.querySelector('.lang-menu');

    if (!switcher || !langBall || !langMenu) {
        console.error('Language switcher elements not found.');
        return;
    }

    // 控制自訂語言選單的開關
    langBall.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止點擊穿透到 document
        switcher.classList.toggle('active');
    });

    // 點擊頁面其他地方時關閉選單
    document.addEventListener('click', () => {
        if (switcher.classList.contains('active')) {
            switcher.classList.remove('active');
        }
    });

    // 為語言選單中的按鈕綁定事件
    langMenu.addEventListener('click', function(e) {
        // 確保點擊的是按鈕
        if (e.target.tagName === 'BUTTON' && e.target.dataset.lang) {
            const targetLanguage = e.target.dataset.lang;

            // 直接呼叫 GTranslate 的翻譯函數
            // `doGTranslate` 是由 gtranslate 的 float.js 腳本加到 window 物件上的
            if (typeof doGTranslate === 'function') {
                doGTranslate(getCurrentLang() + '|' + targetLanguage);
            } else {
                console.error('GTranslate function `doGTranslate` is not available.');
            }
            
            // 更新無障礙閱讀器狀態
            const selectedText = e.target.textContent;
            const statusAnnouncer = document.getElementById('translation-status');
            if (statusAnnouncer) {
                statusAnnouncer.textContent = 'Website has been translated to ' + selectedText;
            }
            
            // 點擊後關閉選單
            switcher.classList.remove('active');
        }
    });

    // 輔助函數：從 cookie 中獲取當前語言
    function getCurrentLang() {
        const cookieValue = document.cookie.match('(^|;) ?googtrans=([^;]*)(;|$)');
        return cookieValue ? cookieValue[2].split('/')[2] : 'en'; // 預設為 en
    }

    // --- Style Injection to hide original GTranslate elements ---
    // 確保 GTranslate 的原始 UI 被隱藏
    const style = document.createElement('style');
    style.textContent = `
        #goog-gt-tt, .goog-te-banner-frame, .skiptranslate { 
            display: none !important; 
        } 
        body { 
            top: 0 !important; 
        }
        .gtranslate_wrapper {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
});