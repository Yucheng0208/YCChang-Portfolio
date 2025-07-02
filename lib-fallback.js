// =======================================================
//  本地函式庫備用方案 - 當 CDN 無法載入時使用
// =======================================================

// 簡單的 YAML 解析器 (僅支援基本的陣列和物件結構)
window.jsyaml = window.jsyaml || {
    load: function(yamlText) {
        try {
            // 移除註解
            const lines = yamlText.split('\n').map(line => {
                const commentIndex = line.indexOf('#');
                return commentIndex >= 0 ? line.substring(0, commentIndex) : line;
            });
            
            const result = [];
            let currentItem = null;
            let currentKey = null;
            let indentLevel = 0;
            
            for (let line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                
                const leadingSpaces = line.length - line.trimStart().length;
                
                // 新的頂層項目 (以 - 開始)
                if (trimmed.startsWith('- ')) {
                    if (currentItem) {
                        result.push(currentItem);
                    }
                    currentItem = {};
                    indentLevel = leadingSpaces;
                    
                    // 處理同一行的鍵值對
                    const content = trimmed.substring(2);
                    if (content.includes(':')) {
                        const [key, value] = content.split(':').map(s => s.trim());
                        currentItem[key] = value || '';
                    }
                }
                // 鍵值對
                else if (trimmed.includes(':')) {
                    const [key, value] = trimmed.split(':').map(s => s.trim());
                    
                    if (leadingSpaces > indentLevel) {
                        // 嵌套物件
                        if (!currentItem[currentKey]) {
                            currentItem[currentKey] = {};
                        }
                        currentItem[currentKey][key] = value || '';
                    } else {
                        // 頂層鍵
                        currentKey = key;
                        if (value) {
                            currentItem[key] = value;
                        }
                    }
                }
            }
            
            if (currentItem) {
                result.push(currentItem);
            }
            
            return result;
        } catch (error) {
            console.error('YAML parsing error:', error);
            return [];
        }
    }
};

// 簡單的 CSV 解析器
window.Papa = window.Papa || {
    parse: function(csvText, options = {}) {
        try {
            const lines = csvText.trim().split('\n');
            const result = [];
            
            if (lines.length === 0) {
                if (options.complete) {
                    options.complete({ data: [] });
                }
                return { data: [] };
            }
            
            // 解析標頭
            const headers = lines[0].split(',').map(h => h.trim());
            
            // 如果有 header 選項，將每一行都解析為物件
            if (options.header) {
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    const values = line.split(',').map(v => v.trim());
                    const row = {};
                    
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    
                    result.push(row);
                }
            } else {
                // 不使用 header 模式，解析資料行
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    const values = line.split(',').map(v => v.trim());
                    result.push(values);
                }
            }
            
            const parseResult = { data: result };
            
            // 呼叫回調函式
            if (options.complete) {
                setTimeout(() => options.complete(parseResult), 0);
            }
            
            return parseResult;
        } catch (error) {
            console.error('CSV parsing error:', error);
            if (options.error) {
                options.error(error);
            }
            return { data: [] };
        }
    }
};

console.log('Local fallback libraries loaded successfully!');
