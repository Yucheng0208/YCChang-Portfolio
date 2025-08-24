// 要輪播的 hashtag 陣列
const hashtags = [
    'Researcher',
    'Lecturer',
    'Teacher',
    'Writer',
    'Blogger',
    
];

let currentIndex = 0;
const hashtagElement = document.getElementById('hashtag-text');

// 打字效果函數
function typeText(text, speed = 100) {
    return new Promise((resolve) => {
        let i = 0;
        hashtagElement.textContent = '';
        
        function type() {
            if (i < text.length) {
                hashtagElement.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// 刪除效果函數
function deleteText(speed = 50) {
    return new Promise((resolve) => {
        const text = hashtagElement.textContent;
        let i = text.length;
        
        function deleteChar() {
            if (i > 0) {
                hashtagElement.textContent = text.substring(0, i - 1);
                i--;
                setTimeout(deleteChar, speed);
            } else {
                resolve();
            }
        }
        deleteChar();
    });
}

// 主要輪播函數
async function startHashtagRotation() {
    while (true) {
        const currentHashtag = hashtags[currentIndex];
        
        // 打字效果
        await typeText(currentHashtag, 120);
        
        // 暫停顯示
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 刪除效果
        await deleteText(80);
        
        // 短暫暫停
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 切換到下一個 hashtag
        currentIndex = (currentIndex + 1) % hashtags.length;
    }
}

// 頁面載入後開始動畫
window.addEventListener('load', () => {
    startHashtagRotation();
});

/**
 * Motto Carousel Script
 * 動態輪播名言文字效果
 * 基於現有的 HTML 結構進行改造
 */

// 在 JavaScript 中定義所有輪播文字
const mottoTexts = [
    "Fear pushes success away, but with faith, everything seems within reach.",
    "Only with absolute honesty can lasting cooperation and trust be established.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Stay hungry, Stay foolish.",
];

// 輪播變數
let currentMotto = 0;
let mottos = [];
let autoSlideInterval;
const slideInterval = 3000; // 3秒切換

// 初始化函數
function initMottoCarousel() {
    const mottoSection = document.querySelector('.motto-section');
    const existingMotto = document.querySelector('.motto');
    const scrollArrow = document.querySelector('.motto-scroll-arrow');
    
    if (!mottoSection || !existingMotto) {
        console.warn('Motto section or motto element not found.');
        return;
    }
    
    // 清空現有內容，但保留滾動按鈕
    mottoSection.innerHTML = '';
    
    // 創建容器
    const container = document.createElement('div');
    container.className = 'motto-container';
    
    // 動態創建所有 motto 元素
    mottoTexts.forEach((text, index) => {
        const mottoElement = document.createElement('p');
        mottoElement.className = 'motto';
        mottoElement.innerHTML = `<i class="fa-solid fa-quote-left"></i> ${text} <i class="fa-solid fa-quote-right"></i>`;
        
        // 第一個設為 active
        if (index === 0) {
            mottoElement.classList.add('active');
        }
        
        container.appendChild(mottoElement);
    });
    
    // 將容器添加到 motto-section
    mottoSection.appendChild(container);
    
    // 重新添加滾動按鈕
    if (scrollArrow) {
        mottoSection.appendChild(scrollArrow);
    } else {
        // 如果沒有找到滾動按鈕，創建一個新的
        const newScrollArrow = document.createElement('button');
        newScrollArrow.className = 'motto-scroll-arrow';
        newScrollArrow.setAttribute('onclick', 'scrollToNextSection()');
        newScrollArrow.setAttribute('aria-label', 'Scroll to next section');
        newScrollArrow.innerHTML = '<i class="fas fa-chevron-down"></i>';
        mottoSection.appendChild(newScrollArrow);
    }
    
    // 取得所有創建的元素
    mottos = document.querySelectorAll('.motto');
    
    // 開始自動輪播
    startAutoSlide();
    
    // 添加事件監聽
    addEventListeners();
}

function updateMotto(index) {
    if (!mottos.length) return;
    
    // 移除當前活躍狀態
    mottos[currentMotto].classList.remove('active');
    mottos[currentMotto].classList.add('fade-out');

    // 更新索引
    currentMotto = index;

    // 添加新的活躍狀態
    setTimeout(() => {
        mottos.forEach(motto => motto.classList.remove('fade-out'));
        mottos[currentMotto].classList.add('active');
    }, 200);

    resetAutoSlide();
}

function nextMotto() {
    if (!mottos.length) return;
    const nextIndex = (currentMotto + 1) % mottos.length;
    updateMotto(nextIndex);
}

function startAutoSlide() {
    autoSlideInterval = setInterval(nextMotto, slideInterval);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

function resetAutoSlide() {
    stopAutoSlide();
    startAutoSlide();
}

function addEventListeners() {
    const mottoSection = document.querySelector('.motto-section');
    
    if (mottoSection) {
        // 滑鼠懸停時暫停輪播
        mottoSection.addEventListener('mouseenter', stopAutoSlide);
        mottoSection.addEventListener('mouseleave', startAutoSlide);
    }
}

// 頁面載入完成後自動初始化
document.addEventListener('DOMContentLoaded', initMottoCarousel);

// 如果需要手動控制，可以調用這些函數
window.mottoCarousel = {
    init: initMottoCarousel,
    next: nextMotto,
    start: startAutoSlide,
    stop: stopAutoSlide,
    goTo: updateMotto
};