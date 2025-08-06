// 要輪播的 hashtag 陣列
const hashtags = [
    'Researcher',
    'Teacher',
    'Writer',
    'Creator',
    'Innovator',
    'Developer',
    'Blogger',
    'Master Student',
    
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