/*
======================================================================
                    ORGANIZATIONS.JS - 組織頁面交互功能
======================================================================
此檔案包含組織頁面的所有交互功能：
- 從 YAML 動態載入組織資料
- 交錯布局處理
- 動畫效果控制
- 響應式調整
- 圖片載入優化
======================================================================
*/

// 全域變數
let organizationsData = [];
let statusConfig = {};
let pageConfig = {};

// YAML 檔案路徑
const YAML_FILE_PATH = 'data/yaml/organizations.yaml';

// DOM 載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing organizations page...');
    showLoadingIndicator();
    
    // 載入 YAML 資料
    loadYAMLData()
        .then(() => {
            console.log('YAML data loaded successfully');
            initializeOrganizations();
            hideLoadingIndicator();
        })
        .catch(error => {
            console.error('Failed to load YAML data:', error);
            handleError(error, 'YAML loading');
            hideLoadingIndicator();
            // 如果 YAML 載入失敗，使用預設資料
            loadFallbackData();
            initializeOrganizations();
        });
});

// 載入 YAML 資料
async function loadYAMLData() {
    try {
        console.log('Loading YAML data from:', YAML_FILE_PATH);
        
        const response = await fetch(YAML_FILE_PATH);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const yamlText = await response.text();
        
        if (!yamlText.trim()) {
            throw new Error('YAML file is empty');
        }
        
        console.log('YAML text loaded, parsing with js-yaml...');
        
        // 使用 js-yaml 解析 YAML
        if (typeof jsyaml === 'undefined') {
            throw new Error('js-yaml library not loaded');
        }
        
        const data = jsyaml.load(yamlText);
        
        if (!data) {
            throw new Error('Failed to parse YAML data');
        }
        
        // 驗證資料結構
        validateYAMLData(data);
        
        // 設置全域變數
        organizationsData = data.organizations || [];
        statusConfig = data.status_config || getDefaultStatusConfig();
        pageConfig = data.page_config || getDefaultPageConfig();
        
        console.log('YAML data loaded successfully:', {
            organizations: organizationsData.length,
            statusConfig: Object.keys(statusConfig).length,
            pageConfig: Object.keys(pageConfig).length
        });
        
        // 更新頁面標題和副標題
        updatePageContent();
        
        return data;
    } catch (error) {
        console.error('Error loading YAML:', error);
        throw error;
    }
}

// 驗證 YAML 資料結構
function validateYAMLData(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid YAML structure: root must be an object');
    }

    if (!data.organizations || !Array.isArray(data.organizations)) {
        throw new Error('Invalid YAML structure: "organizations" must be an array');
    }

    // 驗證每個組織項目
    data.organizations.forEach((org, index) => {
        validateOrganization(org, index);
    });

    return true;
}

// 驗證單個組織
function validateOrganization(org, index) {
    const requiredFields = ['id', 'title', 'subtitle', 'description', 'status'];
    
    requiredFields.forEach(field => {
        if (!org[field]) {
            throw new Error(`Organization ${index}: missing required field "${field}"`);
        }
    });

    // 驗證狀態值
    const validStatuses = ['current', 'alumni', 'member', 'collaborator'];
    if (!validStatuses.includes(org.status)) {
        console.warn(`Organization ${index}: invalid status "${org.status}"`);
    }

    // 驗證連結結構
    if (org.links && !Array.isArray(org.links)) {
        throw new Error(`Organization ${index}: "links" must be an array`);
    }

    return true;
}

// 更新頁面內容
function updatePageContent() {
    if (pageConfig.title) {
        const titleElement = document.querySelector('.organizations-header h1');
        if (titleElement) {
            titleElement.innerHTML = `<i class="fas fa-university"></i> ${pageConfig.title}`;
        }
    }
    
    if (pageConfig.subtitle) {
        const subtitleElement = document.querySelector('.organizations-subtitle');
        if (subtitleElement) {
            subtitleElement.textContent = pageConfig.subtitle;
        }
    }
}

// 預設配置
function getDefaultStatusConfig() {
    return {
        current: { text: 'Current', class: 'status-current' },
        alumni: { text: 'Alumni', class: 'status-alumni' },
        member: { text: 'Member', class: 'status-member' },
        collaborator: { text: 'Collaborator', class: 'status-collaborator' }
    };
}

function getDefaultPageConfig() {
    return {
        title: 'Organizations',
        subtitle: 'Academic institutions and organizations that have shaped my journey in research and innovation.',
        loading_text: 'Loading organizations...',
        error_text: 'Sorry, there was an error loading the organizations. Please try refreshing the page.'
    };
}

// 預備資料（當 YAML 載入失敗時使用）
function loadFallbackData() {
    console.log('Loading fallback data...');
    
    organizationsData = [
        {
            id: 'ntut',
            title: 'National Taipei University of Technology',
            titleZh: '國立臺北科技大學',
            subtitle: 'Department of Computer Science and Information Engineering',
            description: 'Currently pursuing Master\'s degree with a focus on AIoT, embedded systems, and computer vision.',
            image: 'images/organizations/ntut.png',
            status: 'current',
            period: 'September 2024 - Present',
            gpa: '4.0/4.0',
            location: 'Taipei, Taiwan',
            role: 'Graduate Student',
            icon: 'fas fa-graduation-cap',
            links: [
                { text: 'Official Website', url: 'https://www.ntut.edu.tw/', icon: 'fas fa-external-link-alt' }
            ]
        }
    ];
    
    statusConfig = getDefaultStatusConfig();
    pageConfig = getDefaultPageConfig();
}

// 初始化組織頁面
function initializeOrganizations() {
    console.log('Initializing organizations page...');
    
    const organizationsList = document.getElementById('organizationsList');
    if (!organizationsList) {
        console.error('Organizations list container not found');
        return;
    }

    // 載入組織資料
    loadOrganizations();
    
    // 設置滾動動畫
    setupScrollAnimations();
    
    // 設置圖片懶載入
    setupImageLazyLoading();
    
    // 更新年份
    updateCurrentYear();
    
    console.log('Organizations page initialized successfully');
}

// 載入組織資料
function loadOrganizations() {
    const organizationsList = document.getElementById('organizationsList');
    
    // 清空現有內容
    organizationsList.innerHTML = '';
    
    if (!organizationsData || organizationsData.length === 0) {
        organizationsList.innerHTML = `
            <div class="no-organizations" style="text-align: center; padding: 3rem; color: var(--text-color);">
                <i class="fas fa-university" style="font-size: 3rem; opacity: 0.5; margin-bottom: 1rem;"></i>
                <p>No organizations data available.</p>
            </div>
        `;
        return;
    }
    
    // 為每個組織創建 HTML
    organizationsData.forEach((org, index) => {
        const organizationElement = createOrganizationElement(org, index);
        organizationsList.appendChild(organizationElement);
    });
    
    // 啟動載入動畫
    setTimeout(() => {
        triggerLoadAnimations();
    }, 100);
}

// 創建組織元素
function createOrganizationElement(org, index) {
    const isReverse = index % 2 === 1; // 交錯布局
    const statusInfo = statusConfig[org.status] || statusConfig.member || { text: 'Unknown', class: 'status-member' };
    
    const organizationDiv = document.createElement('div');
    organizationDiv.className = `organization-item ${isReverse ? 'reverse' : ''}`;
    organizationDiv.setAttribute('data-org-id', org.id);
    
    // 組織圖片
    const imageHtml = `
        <div class="organization-image">
            <img src="${org.image}" alt="${org.title}" loading="lazy"
                 onerror="handleImageError(this, '${org.id}')">
        </div>
    `;
    
    // 組織詳細資訊
    const detailsHtml = createDetailsHtml(org);
    
    // 組織連結
    const linksHtml = createLinksHtml(org.links);
    
    // 組織內容
    const contentHtml = `
        <div class="organization-content">
            <h2 class="organization-title">
                <i class="${org.icon || 'fas fa-university'}"></i>
                ${org.title}
                <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
            </h2>
            ${org.subtitle !== undefined ? `<p class="organization-subtitle-text">${org.subtitle}</p>` : ''}
            <p class="organization-description">${org.description}</p>
            ${detailsHtml}
            ${linksHtml}
        </div>
    `;
    
    // 根據是否反向排列來決定內容順序
    if (isReverse) {
        organizationDiv.innerHTML = contentHtml + imageHtml;
    } else {
        organizationDiv.innerHTML = imageHtml + contentHtml;
    }
    
    return organizationDiv;
}

// 創建詳細資訊 HTML
function createDetailsHtml(org) {
    const details = [
        { icon: 'fas fa-calendar', text: org.period },
        { icon: 'fas fa-map-marker-alt', text: org.location },
        { icon: 'fas fa-users', text: org.role }
    ];
    
    // 如果有 GPA 資訊，添加到詳細資訊中
    if (org.gpa) {
        details.splice(1, 0, { icon: 'fas fa-medal', text: `GPA: ${org.gpa}` });
    }
    
    const detailItems = details.map(detail => `
        <div class="detail-item">
            <i class="${detail.icon}"></i>
            <span>${detail.text}</span>
        </div>
    `).join('');
    
    return `
        <div class="organization-details">
            ${detailItems}
        </div>
    `;
}

// 創建連結 HTML
function createLinksHtml(links) {
    if (!links || links.length === 0) return '';
    
    const linkItems = links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="org-link">
            <i class="${link.icon || 'fas fa-external-link-alt'}"></i>
            ${link.text}
        </a>
    `).join('');
    
    return `
        <div class="organization-links">
            ${linkItems}
        </div>
    `;
}

// 觸發載入動畫
function triggerLoadAnimations() {
    const organizationItems = document.querySelectorAll('.organization-item');
    
    organizationItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, index * 150);
    });
}

// 設置滾動動畫
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 觀察所有組織項目
    const organizationItems = document.querySelectorAll('.organization-item');
    organizationItems.forEach(item => {
        observer.observe(item);
    });
}

// 設置圖片懶載入
function setupImageLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// 處理圖片載入錯誤
function handleImageError(img, orgId) {
    console.warn(`Failed to load image for organization: ${orgId}`);
    
    // 隱藏失效的圖片
    img.style.display = 'none';
    
    // 顯示預設圖片容器
    const container = img.closest('.organization-image');
    if (container && !container.querySelector('.image-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = `
            <i class="fas fa-university" style="font-size: 3rem; color: var(--tech-cyan); opacity: 0.5;"></i>
            <p style="margin-top: 1rem; color: var(--text-color); opacity: 0.7; font-size: 0.9rem;">Logo not available</p>
        `;
        placeholder.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
        `;
        container.appendChild(placeholder);
    }
}

// 更新年份
function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// 初始化組織頁面
function initializeOrganizations() {
    console.log('Initializing organizations page...');
    
    const organizationsList = document.getElementById('organizationsList');
    if (!organizationsList) {
        console.error('Organizations list container not found');
        return;
    }

    // 載入組織資料
    loadOrganizations();
    
    // 設置滾動動畫
    setupScrollAnimations();
    
    // 設置圖片懶載入
    setupImageLazyLoading();
    
    // 更新年份
    updateCurrentYear();
    
    console.log('Organizations page initialized successfully');
}

// 載入組織資料
function loadOrganizations() {
    const organizationsList = document.getElementById('organizationsList');
    
    // 清空現有內容
    organizationsList.innerHTML = '';
    
    // 為每個組織創建 HTML
    organizationsData.forEach((org, index) => {
        const organizationElement = createOrganizationElement(org, index);
        organizationsList.appendChild(organizationElement);
    });
    
    // 啟動載入動畫
    setTimeout(() => {
        triggerLoadAnimations();
    }, 100);
}

// 創建組織元素
function createOrganizationElement(org, index) {
    const isReverse = index % 2 === 1; // 交錯布局
    const statusInfo = statusConfig[org.status] || statusConfig.member;
    
    const organizationDiv = document.createElement('div');
    organizationDiv.className = `organization-item ${isReverse ? 'reverse' : ''}`;
    organizationDiv.setAttribute('data-org-id', org.id);
    
    // 組織圖片
    const imageHtml = `
        <div class="organization-image">
            <img src="${org.image}" alt="${org.title}" loading="lazy"
                 onerror="handleImageError(this, '${org.id}')">
        </div>
    `;
    
    // 組織詳細資訊
    const detailsHtml = createDetailsHtml(org);
    
    // 組織連結
    const linksHtml = createLinksHtml(org.links);
    
    // 組織內容
    const contentHtml = `
        <div class="organization-content">
            <h2 class="organization-title">
                <i class="${org.icon}"></i>
                ${org.title}
                <span class="status-badge ${statusInfo.class}">${statusInfo.text}</span>
            </h2>
            <p class="organization-subtitle-text">${org.subtitle}</p>
            <p class="organization-description">${org.description}</p>
            ${detailsHtml}
            ${linksHtml}
        </div>
    `;
    
    // 根據是否反向排列來決定內容順序
    if (isReverse) {
        organizationDiv.innerHTML = contentHtml + imageHtml;
    } else {
        organizationDiv.innerHTML = imageHtml + contentHtml;
    }
    
    return organizationDiv;
}

// 創建詳細資訊 HTML
function createDetailsHtml(org) {
    const details = [
        { icon: 'fas fa-calendar', text: org.period },
        { icon: 'fas fa-map-marker-alt', text: org.location },
        { icon: 'fas fa-users', text: org.role }
    ];
    
    // 如果有 GPA 資訊，添加到詳細資訊中
    if (org.gpa) {
        details.splice(1, 0, { icon: 'fas fa-medal', text: `GPA: ${org.gpa}` });
    }
    
    const detailItems = details.map(detail => `
        <div class="detail-item">
            <i class="${detail.icon}"></i>
            <span>${detail.text}</span>
        </div>
    `).join('');
    
    return `
        <div class="organization-details">
            ${detailItems}
        </div>
    `;
}

// 創建連結 HTML
function createLinksHtml(links) {
    if (!links || links.length === 0) return '';
    
    const linkItems = links.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="org-link">
            <i class="${link.icon}"></i>
            ${link.text}
        </a>
    `).join('');
    
    return `
        <div class="organization-links">
            ${linkItems}
        </div>
    `;
}

// 觸發載入動畫
function triggerLoadAnimations() {
    const organizationItems = document.querySelectorAll('.organization-item');
    
    organizationItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('fade-in');
        }, index * 100);
    });
}

// 設置滾動動畫
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // 觀察所有組織項目
    const organizationItems = document.querySelectorAll('.organization-item');
    organizationItems.forEach(item => {
        observer.observe(item);
    });
}

// 設置圖片懶載入
function setupImageLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// 處理圖片載入錯誤
function handleImageError(img, orgId) {
    console.warn(`Failed to load image for organization: ${orgId}`);
    
    // 設置預設圖片或隱藏圖片容器
    img.style.display = 'none';
    
    // 可以設置預設圖片
    // img.src = 'images/organizations/default.png';
    
    // 或者顯示文字替代
    const container = img.closest('.organization-image');
    if (container && !container.querySelector('.image-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.innerHTML = `
            <i class="fas fa-university" style="font-size: 3rem; color: var(--tech-cyan); opacity: 0.5;"></i>
            <p style="margin-top: 1rem; color: var(--text-color); opacity: 0.7;">Image not available</p>
        `;
        placeholder.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            text-align: center;
        `;
        container.appendChild(placeholder);
    }
}

// 更新年份
function updateCurrentYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// 滾動到頂部功能
function setupBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (!backToTopBtn) return;

    // 監聽滾動事件
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('is-visible');
        } else {
            backToTopBtn.classList.remove('is-visible');
        }
    });

    // 點擊回到頂部
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 響應式布局調整
function handleResponsiveLayout() {
    const organizationItems = document.querySelectorAll('.organization-item');
    const isMobile = window.innerWidth <= 768;
    
    organizationItems.forEach(item => {
        if (isMobile) {
            item.classList.remove('reverse');
        } else {
            // 重新應用交錯布局
            const index = Array.from(item.parentNode.children).indexOf(item);
            if (index % 2 === 1) {
                item.classList.add('reverse');
            }
        }
    });
}

// 搜索組織功能（可選）
function searchOrganizations(query) {
    const organizationItems = document.querySelectorAll('.organization-item');
    const searchTerm = query.toLowerCase();
    
    organizationItems.forEach(item => {
        const title = item.querySelector('.organization-title').textContent.toLowerCase();
        const description = item.querySelector('.organization-description').textContent.toLowerCase();
        const subtitle = item.querySelector('.organization-subtitle-text').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm) || subtitle.includes(searchTerm)) {
            item.style.display = 'flex';
            item.classList.add('fade-in');
        } else {
            item.style.display = 'none';
            item.classList.remove('fade-in');
        }
    });
}

// 組織過濾功能（按狀態）
function filterOrganizations(status) {
    const organizationItems = document.querySelectorAll('.organization-item');
    
    organizationItems.forEach(item => {
        const statusBadge = item.querySelector('.status-badge');
        const itemStatus = getStatusFromBadge(statusBadge);
        
        if (status === 'all' || itemStatus === status) {
            item.style.display = 'flex';
            setTimeout(() => item.classList.add('fade-in'), 50);
        } else {
            item.classList.remove('fade-in');
            setTimeout(() => item.style.display = 'none', 300);
        }
    });
}

// 從狀態標籤獲取狀態
function getStatusFromBadge(badge) {
    if (badge.classList.contains('status-current')) return 'current';
    if (badge.classList.contains('status-alumni')) return 'alumni';
    if (badge.classList.contains('status-member')) return 'member';
    if (badge.classList.contains('status-collaborator')) return 'collaborator';
    return 'unknown';
}

// 性能優化：防抖函數
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

// 性能優化：節流函數
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// 視窗大小改變時的處理
const debouncedResize = debounce(() => {
    handleResponsiveLayout();
}, 250);

// 滾動事件的節流處理
const throttledScroll = throttle(() => {
    // 可以在這裡添加滾動相關的處理
}, 100);

// 事件監聽器設置
function setupEventListeners() {
    // 視窗大小改變
    window.addEventListener('resize', debouncedResize);
    
    // 滾動事件
    window.addEventListener('scroll', throttledScroll);
    
    // 鍵盤導航支持
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // 設置回到頂部按鈕
    setupBackToTop();
}

// 鍵盤導航處理
function handleKeyboardNavigation(e) {
    // ESC 鍵回到頂部
    if (e.key === 'Escape') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 方向鍵導航組織項目
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const organizationItems = document.querySelectorAll('.organization-item:not([style*="display: none"])');
        const currentFocused = document.activeElement;
        let currentIndex = -1;
        
        // 找到當前焦點項目的索引
        organizationItems.forEach((item, index) => {
            if (item.contains(currentFocused)) {
                currentIndex = index;
            }
        });
        
        if (e.key === 'ArrowDown' && currentIndex < organizationItems.length - 1) {
            organizationItems[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            organizationItems[currentIndex + 1].focus();
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
            organizationItems[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            organizationItems[currentIndex - 1].focus();
        }
    }
}

// 無障礙功能增強
function enhanceAccessibility() {
    const organizationItems = document.querySelectorAll('.organization-item');
    
    organizationItems.forEach((item, index) => {
        // 添加 tabindex 使項目可聚焦
        item.setAttribute('tabindex', '0');
        
        // 添加 ARIA 標籤
        item.setAttribute('aria-label', `Organization ${index + 1}`);
        
        // 添加焦點樣式
        item.addEventListener('focus', function() {
            this.style.outline = '2px solid var(--tech-cyan)';
            this.style.outlineOffset = '4px';
        });
        
        item.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });
}

// 錯誤處理
function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    
    const errorText = pageConfig.error_text || 'Sorry, there was an error loading the organizations. Please try refreshing the page.';
    
    // 可以在這裡添加用戶友好的錯誤提示
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>${errorText}</p>
        <button onclick="location.reload()" class="retry-btn">Retry</button>
    `;
    errorMessage.style.cssText = `
        text-align: center;
        padding: 2rem;
        color: #dc3545;
        background: rgba(220, 53, 69, 0.1);
        border: 1px solid rgba(220, 53, 69, 0.3);
        border-radius: 8px;
        margin: 2rem 0;
    `;
    
    const retryBtn = errorMessage.querySelector('.retry-btn');
    if (retryBtn) {
        retryBtn.style.cssText = `
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background 0.3s ease;
        `;
        retryBtn.onmouseover = () => retryBtn.style.background = '#c82333';
        retryBtn.onmouseout = () => retryBtn.style.background = '#dc3545';
    }
    
    const organizationsList = document.getElementById('organizationsList');
    if (organizationsList) {
        organizationsList.innerHTML = '';
        organizationsList.appendChild(errorMessage);
    }
}

// 載入狀態指示器
function showLoadingIndicator() {
    const organizationsList = document.getElementById('organizationsList');
    if (organizationsList) {
        const loadingText = pageConfig.loading_text || 'Loading organizations...';
        organizationsList.innerHTML = `
            <div class="loading-indicator" style="text-align: center; padding: 3rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--tech-cyan); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-color);">${loadingText}</p>
            </div>
        `;
    }
}

// 隱藏載入指示器
function hideLoadingIndicator() {
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// 頁面完全載入後的最終設置
window.addEventListener('load', function() {
    // 確保所有圖片都已載入
    const images = document.querySelectorAll('.organization-image img');
    let loadedImages = 0;
    
    if (images.length === 0) {
        finalizePageSetup();
        return;
    }
    
    images.forEach(img => {
        if (img.complete) {
            loadedImages++;
        } else {
            img.addEventListener('load', () => {
                loadedImages++;
                if (loadedImages === images.length) {
                    finalizePageSetup();
                }
            });
            
            img.addEventListener('error', () => {
                loadedImages++;
                if (loadedImages === images.length) {
                    finalizePageSetup();
                }
            });
        }
    });
    
    if (loadedImages === images.length) {
        finalizePageSetup();
    }
});

// 最終頁面設置
function finalizePageSetup() {
    // 設置事件監聽器
    setupEventListeners();
    
    // 增強無障礙功能
    enhanceAccessibility();
    
    // 隱藏載入指示器
    hideLoadingIndicator();
    
    // 觸發最終動畫
    setTimeout(() => {
        document.body.classList.add('page-loaded');
    }, 100);
    
    console.log('Organizations page fully loaded and ready');
}

// 導出函數供外部使用（如果需要）
if (typeof window !== 'undefined') {
    window.OrganizationsPage = {
        searchOrganizations,
        filterOrganizations,
        loadOrganizations,
        handleError
    };
}