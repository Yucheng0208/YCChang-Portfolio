// =======================================================
//  共用核心功能 - common.js
// =======================================================

// 🔧 改進的 YAML 解析器 - 修正引號問題
window.jsyaml = window.jsyaml || {
    load: function(yamlText) {
        try {
            const lines = yamlText.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('#');
            });
            
            const result = [];
            let currentItem = null;
            let currentObject = null;
            
            for (let line of lines) {
                const trimmed = line.trim();
                const leadingSpaces = line.length - line.trimStart().length;
                
                if (trimmed.startsWith('- ')) {
                    if (currentItem) {
                        result.push(currentItem);
                    }
                    currentItem = {};
                    currentObject = null;
                    
                    const content = trimmed.substring(2);
                    if (content.includes(':')) {
                        const colonIndex = content.indexOf(':');
                        const key = content.substring(0, colonIndex).trim();
                        let value = content.substring(colonIndex + 1).trim();
                        
                        const commentIndex = value.indexOf('#');
                        if (commentIndex >= 0) {
                            value = value.substring(0, commentIndex).trim();
                        }
                        
                        // 🔧 去除引號
                        value = this.cleanValue(value);
                        currentItem[key] = value;
                    }
                } else if (trimmed.includes(':')) {
                    const colonIndex = trimmed.indexOf(':');
                    const key = trimmed.substring(0, colonIndex).trim();
                    let value = trimmed.substring(colonIndex + 1).trim();
                    
                    const commentIndex = value.indexOf('#');
                    if (commentIndex >= 0) {
                        value = value.substring(0, commentIndex).trim();
                    }
                    
                    // 🔧 去除引號
                    value = this.cleanValue(value);
                    
                    if (leadingSpaces === 2) {
                        if (value) {
                            currentItem[key] = value;
                        } else {
                            currentItem[key] = {};
                            currentObject = key;
                        }
                    } else if (leadingSpaces === 4 && currentObject) {
                        currentItem[currentObject][key] = value;
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
    },
    
    // 🆕 清理值的函數
    cleanValue: function(value) {
        if (!value) return '';
        
        // 轉換為字符串
        value = String(value);
        
        // 去除前後的雙引號或單引號
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        
        return value;
    }
};

// 本地 CSV 解析器
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
            
            const headers = lines[0].split(',').map(h => h.trim());
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const values = line.split(',').map(v => v.trim());
                const row = {};
                
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                
                result.push(row);
            }
            
            const parseResult = { data: result };
            
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

// Easter Egg 訊息
(function() {
    const styles = {
        logo: 'font-family: monospace; color: #64d2ff; font-weight: bold;',
        header: 'font-size: 1.2rem; font-weight: bold; color: #fff; padding: 5px 0;',
        body: 'color: #c9d1d9; line-height: 1.5;',
        link: 'color: #64d2ff; text-decoration: underline; font-family: monospace;',
        highlight: 'background-color: #161b22; color: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace;',
        EasterEgg: 'color: #64d2ff; font-family: monospace; font-size: 1.1rem;'
    };

    console.log('%cPsst... You found a little Easter egg! 🥚\nCurious minds like yours make the web more fun. 🚀', styles.EasterEgg);
    console.log('%cWelcome to my digital playground!', styles.header);
    console.log(
        `%cCurious how this website was built? Feel free to dive into the source code right here:\n` +
        `%chttps://github.com/Yucheng0208/YCChang-Portfolio`,
        styles.body,
        styles.link
    );
    console.log(
        `%cIf you dig what I do, consider dropping a star ⭐ or a follow on my main GitHub profile. I'm always open to new ideas and collaborations!\n` +
        `%chttps://github.com/Yucheng0208`,
        styles.body,
        styles.link
    );
    console.log('%cHappy coding!', styles.body);
})();

// 共用工具函數
window.CommonUtils = {
    // 日期解析函數
    parseWorkDate: function(dateString) {
        if (!dateString) return { startDate: new Date(0), isPresent: false };
        
        const str = dateString.toLowerCase().trim();
        const isPresent = str.includes('present');
        
        let startDateStr = str;
        if (str.includes('~')) {
            startDateStr = str.split('~')[0].trim();
        }
        
        const monthYearMatch = startDateStr.match(/(\w+),?\s*(\d{4})/);
        if (monthYearMatch) {
            const [, month, year] = monthYearMatch;
            const monthMap = {
                'january': 0, 'february': 1, 'march': 2, 'april': 3,
                'may': 4, 'june': 5, 'july': 6, 'august': 7,
                'september': 8, 'october': 9, 'november': 10, 'december': 11
            };
            const monthIndex = monthMap[month.toLowerCase()] ?? 0;
            return { 
                startDate: new Date(parseInt(year), monthIndex), 
                isPresent: isPresent 
            };
        }
        
        return { startDate: new Date(0), isPresent: isPresent };
    },

    parsePublicationDate: function(dateString) {
        if (!dateString) return new Date(0);
        
        const str = dateString.trim();
        
        const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (isoMatch) {
            const [, year, month, day] = isoMatch;
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
        
        const monthYearMatch = str.match(/(\w+)\s+(\d{1,2})(?:-\d{1,2})?,?\s*(\d{4})|(\d{1,2})(?:-\d{1,2})?\s+(\w+),?\s*(\d{4})/);
        if (monthYearMatch) {
            let month, year, day;
            if (monthYearMatch[1]) {
                month = monthYearMatch[1];
                day = monthYearMatch[2];
                year = monthYearMatch[3];
            } else {
                day = monthYearMatch[4];
                month = monthYearMatch[5];
                year = monthYearMatch[6];
            }
            
            const monthMap = {
                'january': 0, 'february': 1, 'march': 2, 'april': 3,
                'may': 4, 'june': 5, 'july': 6, 'august': 7,
                'september': 8, 'october': 9, 'november': 10, 'december': 11
            };
            const monthIndex = monthMap[month.toLowerCase()] ?? 0;
            return new Date(parseInt(year), monthIndex, parseInt(day) || 1);
        }
        
        const dayMonthYearMatch = str.match(/(\d{1,2})(?:-\d{1,2})?\s+(\w+),?\s*(\d{4})/);
        if (dayMonthYearMatch) {
            const [, day, month, year] = dayMonthYearMatch;
            const monthMap = {
                'january': 0, 'february': 1, 'march': 2, 'april': 3,
                'may': 4, 'june': 5, 'july': 6, 'august': 7,
                'september': 8, 'october': 9, 'november': 10, 'december': 11
            };
            const monthIndex = monthMap[month.toLowerCase()] ?? 0;
            return new Date(parseInt(year), monthIndex, parseInt(day) || 1);
        }
        
        const fallbackDate = new Date(str);
        return isNaN(fallbackDate.getTime()) ? new Date(0) : fallbackDate;
    },

    parseProjectDate: function(dateString) {
        if (!dateString) return new Date(0);
        
        const str = dateString.trim();
        
        const rangeMatch = str.match(/.*?~\s*(.+)$/);
        if (rangeMatch) {
            const endDateStr = rangeMatch[1].trim();
            return CommonUtils.parsePublicationDate(endDateStr);
        }
        
        return CommonUtils.parsePublicationDate(str);
    },

    // 作者名稱高亮
    highlightAuthorName: function(text) {
        if (!text) return text;
        const namePatterns = [
            'Yu-Cheng Chang\\*?', 'Chang Yu-Cheng\\*?', 'Chang, Yu-Cheng\\*?',
            'Yu-Cheng Chang', 'Chang Yu-Cheng', '張育丞\\*?',
            'Ryan Chang\\*?', 'Ryan Chang', 'Chang Ryan\\*?', 'Chang Ryan',
            'Yu-Cheng (Ryan) Chang\\*?', 'Yu-Cheng (Ryan) Chang',
            'Ryan Yu-Cheng Chang\\*?', 'Ryan Yu-Cheng Chang',
            '張育丞\\*?', '張育丞', '育丞 張\\*?', '育丞 張'
        ];
        let highlightedText = text;
        namePatterns.forEach(pattern => {
            const regex = new RegExp(`(${pattern})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="author-highlight">$1</mark>');
        });
        return highlightedText;
    }
};

// 導航列載入和通用功能初始化
async function initializeCommonFeatures() {
    // Swiper 初始化
    const swiperElement = document.querySelector('.swiper');
    if (swiperElement) {
        new Swiper('.swiper', {
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
        });
    }

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

    // 當前頁面導航高亮
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLi = document.querySelectorAll('nav .nav-links li:not(.desktop-search)');
    navLi.forEach(li => {
        const link = li.querySelector('a');
        if (link && link.getAttribute('href')) {
            const linkPath = link.getAttribute('href').split('/').pop();
            if (currentPath === linkPath) {
                li.classList.add('active-link');
            }
            if (li.classList.contains('nav-item-dropdown')) {
                const subLinks = li.querySelectorAll('.dropdown-menu a');
                subLinks.forEach(subLink => {
                    if (subLink.getAttribute('href') && currentPath === subLink.getAttribute('href').split('/').pop()) {
                        li.classList.add('active-link');
                    }
                });
            }
        }
    });

    // 導航懸停效果
    const navList = document.querySelector('nav .nav-links');
    if (navList) {
        navList.addEventListener('mouseover', (e) => {
            const activeLi = document.querySelector('.nav-links li.active-link');
            if (activeLi) {
                let targetLi = e.target.closest('li');
                if (activeLi !== targetLi) {
                    activeLi.classList.add('temporarily-hidden');
                }
            }
        });
        navList.addEventListener('mouseout', () => {
            const activeLi = document.querySelector('.nav-links li.active-link.temporarily-hidden');
            if (activeLi) {
                activeLi.classList.remove('temporarily-hidden');
            }
        });
    }

    // 頁腳年份
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
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
    
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown-menu')) {
            document.querySelectorAll('.dropdown-menu .nav-item-dropdown.is-open').forEach(item => {
                item.classList.remove('is-open');
            });
        }
    });

    // 回到頂部按鈕
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            window.scrollY > 300 ? backToTopBtn.classList.add('is-visible') : backToTopBtn.classList.remove('is-visible');
        });
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 時間軸當前日期檢測
    const timelineDates = document.querySelectorAll('.timeline-date');
    if (timelineDates.length > 0) {
        timelineDates.forEach(dateElement => {
            if (dateElement.textContent.includes('Present')) {
                dateElement.setAttribute('data-contains-present', 'true');
            }
        });
    }
}

// 載入導航列
async function loadNavbarAndInit() {
    const navbarContainer = document.getElementById('navbar-container');
    if (!navbarContainer) {
        console.warn('Navbar container (#navbar-container) not found. Initializing other common features.');
        initializeCommonFeatures(); 
        return;
    }

    try {
        const response = await fetch('navbar.html');
        if (!response.ok) {
            throw new Error(`Failed to load navbar.html: ${response.status} ${response.statusText}`);
        }
        const navbarHTML = await response.text();
        navbarContainer.innerHTML = navbarHTML;
        initializeCommonFeatures();
    } catch (error) {
        console.error('Error loading navbar:', error);
        navbarContainer.innerHTML = '<p style="color: red; text-align: center; padding: 1rem;">Error: Navigation bar could not be loaded.</p>';
    }
}

// 全域初始化
document.addEventListener('DOMContentLoaded', function() {
    loadNavbarAndInit();
});

// 全域滾動功能
function scrollToNextSection() {
    const arrow = document.querySelector('.motto-scroll-arrow');
    if (arrow) {
        arrow.classList.add('clicked');
        setTimeout(() => {
            arrow.classList.remove('clicked');
        }, 600);
    }

    const educationSection = document.querySelector('.education-section');
    const educationTitle = document.querySelector('.education-section h2');
    
    if (educationTitle) {
        const titleRect = educationTitle.getBoundingClientRect();
        const titleOffsetTop = window.pageYOffset + titleRect.top;
        
        window.scrollTo({
            top: titleOffsetTop - 10,
            behavior: 'smooth'
        });
    } else if (educationSection) {
        const rect = educationSection.getBoundingClientRect();
        const offsetTop = window.pageYOffset + rect.top;
        
        window.scrollTo({
            top: offsetTop - 10,
            behavior: 'smooth'
        });
    }
}
