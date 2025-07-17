// =======================================================
//  密碼產生器頁面專用功能 - generator.js
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    // 共用語言功能
    const langToggleBtn = document.getElementById('lang-toggle');
    const currentYearSpan = document.getElementById('current-year');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    
    let currentLang = localStorage.getItem('preferredLang') || 'en';

    // 語言切換功能
    const setLanguage = (lang) => {
        document.querySelectorAll('.lang-en, .lang-zh').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll(`.lang-${lang}`).forEach(el => {
            el.style.display = 'inline';
        });
        
        // 更新佔位符
        document.querySelectorAll('[data-placeholder-en]').forEach(input => {
            if (lang === 'zh') {
                input.placeholder = input.getAttribute('data-placeholder-zh');
            } else {
                input.placeholder = input.getAttribute('data-placeholder-en');
            }
        });
        
        document.documentElement.lang = lang;
        localStorage.setItem('preferredLang', lang);
        currentLang = lang;
    };

    // 語言切換事件
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'zh' : 'en';
            setLanguage(newLang);
        });
    }

    // 設定初始語言
    setLanguage(currentLang);

    // 設定頁腳年份
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    
    // 回到頂部按鈕
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    // 密碼產生器頁面邏輯
    if (document.body.classList.contains('code-generator-page')) {
        const generateBtn = document.getElementById('generate-btn');
        const numCodesInput = document.getElementById('num-codes-input');
        const resultsContainer = document.getElementById('results-container');
        const codeList = document.getElementById('code-list');
        const errorMessageDiv = document.getElementById('error-message');
        const copyAllBtn = document.getElementById('copy-all-btn');
        const downloadCsvBtn = document.getElementById('download-csv-btn');

        // 生成單個隨機密碼
        const generateRandomCode = (length) => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        };
        
        // 生成按鈕事件監聽
        generateBtn.addEventListener('click', () => {
            const numCodes = parseInt(numCodesInput.value, 10);

            // 輸入驗證
            if (isNaN(numCodes) || numCodes < 1 || numCodes > 1000) {
                let errorTextEn = 'Please enter a valid number between 1 and 1000.';
                let errorTextZh = '請輸入一個介於 1 到 1000 之間的有效數字。';
                errorMessageDiv.innerHTML = `<span class="lang-en">${errorTextEn}</span><span class="lang-zh">${errorTextZh}</span>`;
                errorMessageDiv.style.display = 'block';
                resultsContainer.style.display = 'none';
                setLanguage(currentLang);
                return;
            }

            // 生成並顯示密碼
            errorMessageDiv.style.display = 'none';
            codeList.innerHTML = '';
            let generatedCodes = [];

            for (let i = 0; i < numCodes; i++) {
                const code = generateRandomCode(6);
                generatedCodes.push(code);
                const listItem = document.createElement('li');
                listItem.innerHTML = `<div class="code-container"><span class="code-index">${i+1}.</span> <span class="code-value">${code}</span></div>`;
                codeList.appendChild(listItem);
            }
            
            resultsContainer.style.display = 'block';
        });
        
        // 複製全部按鈕邏輯
        copyAllBtn.addEventListener('click', () => {
            const codes = Array.from(codeList.querySelectorAll('li .code-value')).map(span => span.textContent);
            const textToCopy = codes.join('\n');

            navigator.clipboard.writeText(textToCopy).then(() => {
                // 成功回饋
                const originalTextEn = copyAllBtn.querySelector('.lang-en').textContent;
                const originalTextZh = copyAllBtn.querySelector('.lang-zh').textContent;
                copyAllBtn.querySelector('.lang-en').textContent = 'Copied!';
                copyAllBtn.querySelector('.lang-zh').textContent = '已複製！';
                
                setTimeout(() => {
                    copyAllBtn.querySelector('.lang-en').textContent = originalTextEn;
                    copyAllBtn.querySelector('.lang-zh').textContent = originalTextZh;
                }, 2000);

            }).catch(err => {
                console.error('Failed to copy codes: ', err);
                alert('Could not copy codes to clipboard.');
            });
        });
        
        // 下載 CSV 按鈕邏輯
        downloadCsvBtn.addEventListener('click', () => {
            const codes = Array.from(codeList.querySelectorAll('li .code-value')).map(span => span.textContent);
            let csvContent = 'data:text/csv;charset=utf-8,';
            csvContent += 'Index,Code\n';

            codes.forEach((code, index) => {
                csvContent += `${index + 1},${code}\n`;
            });
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'student_codes.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
});