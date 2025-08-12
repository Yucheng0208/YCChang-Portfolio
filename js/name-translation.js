/**
 * 全域名字翻譯處理器
 * 確保 Yu-Cheng Chang 在翻譯時正確顯示為張育丞
 * 支援動態載入的 YAML 內容
 */
(function() {
    'use strict';
    
    const NAME_TRANSLATIONS = {
        'en': 'Yu-Cheng Chang',
        'zh-TW': '張育丞',
        'zh-CN': '张育丞',
        'ja': '張育丞 (Yu-Cheng Chang)',
        'ko': '장육승 (Yu-Cheng Chang)',
        'ms': 'Yu-Cheng Chang (張育丞)',
        'vi': 'Yu-Cheng Chang (張育丞)'
    };

    // 檢測當前語言
    function getCurrentLanguage() {
        // 檢查 GTranslate 設定的語言
        if (window.gt_request_uri && window.gt_request_uri.includes('/')) {
            const langCode = window.gt_request_uri.split('/')[1];
            return langCode || 'en';
        }
        
        // 檢查 HTML lang 屬性
        const htmlLang = document.documentElement.lang;
        if (htmlLang && NAME_TRANSLATIONS[htmlLang]) {
            return htmlLang;
        }
        
        // 檢查瀏覽器語言
        const browserLang = navigator.language || navigator.userLanguage;
        const shortLang = browserLang.split('-')[0];
        
        // 優先檢查完整語言代碼
        if (NAME_TRANSLATIONS[browserLang]) {
            return browserLang;
        }
        
        // 檢查簡化語言代碼
        if (NAME_TRANSLATIONS[shortLang]) {
            return shortLang;
        }
        
        return 'en'; // 默認英文
    }

    // 翻譯名字
    function translateName(text, currentLang) {
        const translatedName = NAME_TRANSLATIONS[currentLang] || NAME_TRANSLATIONS['en'];
        return text.replace(/Yu-Cheng Chang/g, translatedName);
    }

    // 更新所有名字元素
    function updateNameElements() {
        const currentLang = getCurrentLanguage();
        
        console.log('Current language detected:', currentLang);
        console.log('Original title:', document.title);
        
        // 更新 title - 這是最重要的部分
        if (document.title.includes('Yu-Cheng Chang')) {
            const newTitle = translateName(document.title, currentLang);
            document.title = newTitle;
            console.log('Updated title:', newTitle);
        }
        
        // 更新所有 meta 標籤
        document.querySelectorAll('meta[content*="Yu-Cheng Chang"]').forEach(meta => {
            meta.content = translateName(meta.content, currentLang);
        });
        
        // 更新 h1 標籤中的名字
        document.querySelectorAll('h1').forEach(h1 => {
            if (h1.textContent.includes('Yu-Cheng Chang')) {
                h1.textContent = translateName(h1.textContent, currentLang);
            }
        });
        
        // 更新所有標記為 data-name 的元素
        document.querySelectorAll('[data-name="yu-cheng-chang"]').forEach(el => {
            const originalText = el.textContent;
            const newText = translateName(originalText, currentLang);
            el.textContent = newText;
            console.log('Updated element:', originalText, '->', newText);
        });
        
        // 更新 alt 屬性
        document.querySelectorAll('img[alt*="Yu-Cheng Chang"]').forEach(img => {
            img.alt = translateName(img.alt, currentLang);
        });
        
        // 更新 aria-label 屬性
        document.querySelectorAll('[aria-label*="Yu-Cheng Chang"]').forEach(el => {
            el.setAttribute('aria-label', translateName(el.getAttribute('aria-label'), currentLang));
        });
        
        // 更新所有文字節點中包含名字的部分
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    return node.textContent.includes('Yu-Cheng Chang') ? 
                           NodeFilter.FILTER_ACCEPT : 
                           NodeFilter.FILTER_SKIP;
                }
            }
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(textNode => {
            if (textNode.textContent.includes('Yu-Cheng Chang')) {
                textNode.textContent = translateName(textNode.textContent, currentLang);
            }
        });
    }

    // 監聽語言變化
    function initLanguageObserver() {
        // 監聽 GTranslate 的變化
        const observer = new MutationObserver(function(mutations) {
            let shouldUpdate = false;
            
            mutations.forEach(function(mutation) {
                // 檢查新增的節點
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    for (let node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 檢查新增的元素是否包含 Yu-Cheng Chang
                            if (node.textContent && node.textContent.includes('Yu-Cheng Chang')) {
                                shouldUpdate = true;
                                console.log('Detected new content with name:', node.textContent);
                                break;
                            }
                        } else if (node.nodeType === Node.TEXT_NODE) {
                            if (node.textContent.includes('Yu-Cheng Chang')) {
                                shouldUpdate = true;
                                console.log('Detected new text node with name:', node.textContent);
                                break;
                            }
                        }
                    }
                } 
                // 檢查修改的文字內容
                else if (mutation.type === 'characterData') {
                    if (mutation.target.textContent.includes('Yu-Cheng Chang')) {
                        shouldUpdate = true;
                        console.log('Detected character data change with name:', mutation.target.textContent);
                    }
                }
                // 檢查屬性變化
                else if (mutation.type === 'attributes') {
                    shouldUpdate = true;
                }
            });
            
            if (shouldUpdate) {
                console.log('Triggering name update due to DOM changes');
                setTimeout(updateNameElements, 300);
            }
        });
        
        // 觀察整個文檔，包括字符數據變化
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true, // 重要：監聽文字內容變化
            attributeFilter: ['class', 'lang', 'data-lang']
        });
        
        window.addEventListener('languagechange', updateNameElements);
        
        // 監聽 GTranslate 回調
        if (window.gtranslateSettings) {
            const originalCallback = window.gtranslateSettings.onlang || function() {};
            window.gtranslateSettings.onlang = function(lang) {
                originalCallback(lang);
                setTimeout(updateNameElements, 500);
            };
        }
        
        // 額外的 YAML 載入監聽
        // 如果您使用 fetch 或 XMLHttpRequest 載入 YAML
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                if (args[0] && (args[0].includes('.yaml') || args[0].includes('.yml'))) {
                    console.log('YAML file loaded, scheduling name update');
                    setTimeout(updateNameElements, 1000);
                }
                return response;
            });
        };
    }

    // 初始化
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                updateNameElements();
                initLanguageObserver();
            });
        } else {
            updateNameElements();
            initLanguageObserver();
        }
        
        // 增加更多延遲檢查，確保 YAML 內容載入後也能處理
        setTimeout(updateNameElements, 1000);
        setTimeout(updateNameElements, 3000);
        setTimeout(updateNameElements, 5000);
        setTimeout(updateNameElements, 8000); // 額外的長延遲
        setTimeout(updateNameElements, 12000); // 更長的延遲
    }

    // 暴露給全域，方便手動觸發和調試
    window.updateNameTranslation = updateNameElements;
    
    // 暴露一個專門處理新載入內容的函數
    window.processNewContent = function() {
        console.log('Manually processing new content');
        updateNameElements();
    };

    // 啟動
    init();
})();