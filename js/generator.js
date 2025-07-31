// =======================================================
//  密碼產生器頁面專用功能 - generator.js
// =======================================================

document.addEventListener('DOMContentLoaded', function() {

    fetch('navbar.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('navbar-container').innerHTML = html;
    });

    // 共用功能
    const currentYearSpan = document.getElementById('current-year');
    const backToTopBtn = document.getElementById('back-to-top-btn');

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
                errorMessageDiv.innerHTML = 'Please enter a valid number between 1 and 1000.';
                errorMessageDiv.style.display = 'block';
                resultsContainer.style.display = 'none';
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
                
                // 添加點擊事件來複製單一密碼
                listItem.addEventListener('click', function() {
                    const codeValue = this.querySelector('.code-value').textContent;
                    
                    navigator.clipboard.writeText(codeValue).then(() => {
                        // 顯示複製成功訊息
                        const codeContainer = this.querySelector('.code-container');
                        const originalHTML = codeContainer.innerHTML;
                        codeContainer.innerHTML = `<span class="code-index">${this.querySelector('.code-index').textContent}</span> <span class="code-value">Copied!</span>`;
                        
                        setTimeout(() => {
                            codeContainer.innerHTML = originalHTML;
                        }, 1500);
                        
                    }).catch(err => {
                        console.error('Failed to copy code: ', err);
                        alert('Could not copy code to clipboard.');
                    });
                });
                
                // 添加 CSS 游標樣式提示可點擊
                listItem.style.cursor = 'pointer';
                
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
                const originalText = copyAllBtn.textContent;
                copyAllBtn.textContent = 'Copied!';
                
                setTimeout(() => {
                    copyAllBtn.textContent = originalText;
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
    // 在生成密碼的部分修改如下：

    for (let i = 0; i < numCodes; i++) {
        const code = generateRandomCode(6);
        generatedCodes.push(code);
        const listItem = document.createElement('li');
        listItem.innerHTML = `<div class="code-container"><span class="code-index">${i+1}.</span> <span class="code-value">${code}</span></div>`;
        
        // 添加點擊事件來複製單一密碼
        listItem.addEventListener('click', function() {
            const codeValue = this.querySelector('.code-value').textContent;
            
            navigator.clipboard.writeText(codeValue).then(() => {
                // 視覺回饋 - 暫時改變樣式
                const originalStyle = this.style.backgroundColor;
                this.style.backgroundColor = '#d4edda';
                this.style.transition = 'background-color 0.3s';
                
                setTimeout(() => {
                    this.style.backgroundColor = originalStyle;
                }, 1000);
                
            }).catch(err => {
                console.error('Failed to copy code: ', err);
                alert('Could not copy code to clipboard.');
            });
        });
        
        // 添加 CSS 游標樣式提示可點擊
        listItem.style.cursor = 'pointer';
        
        codeList.appendChild(listItem);
    }
});

