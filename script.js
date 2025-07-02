// =======================================================
//  本地函式庫 - YAML 和 CSV 解析器
// =======================================================

// 本地 YAML 解析器 - 專門處理我們的格式
window.jsyaml = window.jsyaml || {
    load: function(yamlText) {
        try {
            const lines = yamlText.split('\n').filter(line => {
                const trimmed = line.trim();
                return trimmed && !trimmed.startsWith('#');
            });
            
            const result = [];
            let currentItem = null;
            let currentObject = null; // 追蹤當前嵌套物件 (name 或 school)
            
            for (let line of lines) {
                const trimmed = line.trim();
                const leadingSpaces = line.length - line.trimStart().length;
                
                if (trimmed.startsWith('- ')) {
                    // 新項目開始
                    if (currentItem) {
                        result.push(currentItem);
                    }
                    currentItem = {};
                    currentObject = null;
                    
                    // 處理 "- id: value" 格式
                    const content = trimmed.substring(2);
                    if (content.includes(':')) {
                        const colonIndex = content.indexOf(':');
                        const key = content.substring(0, colonIndex).trim();
                        let value = content.substring(colonIndex + 1).trim();
                        
                        // 移除行內註解
                        const commentIndex = value.indexOf('#');
                        if (commentIndex >= 0) {
                            value = value.substring(0, commentIndex).trim();
                        }
                        
                        currentItem[key] = value;
                    }
                } else if (trimmed.includes(':')) {
                    const colonIndex = trimmed.indexOf(':');
                    const key = trimmed.substring(0, colonIndex).trim();
                    let value = trimmed.substring(colonIndex + 1).trim();
                    
                    // 移除行內註解
                    const commentIndex = value.indexOf('#');
                    if (commentIndex >= 0) {
                        value = value.substring(0, commentIndex).trim();
                    }
                    
                    if (leadingSpaces === 2) {
                        // 第一層屬性
                        if (value) {
                            // 有值的屬性
                            currentItem[key] = value;
                        } else {
                            // 無值，表示嵌套物件
                            currentItem[key] = {};
                            currentObject = key;
                        }
                    } else if (leadingSpaces === 4 && currentObject) {
                        // 第二層屬性 (en, zh)
                        currentItem[currentObject][key] = value;
                    }
                }
            }
            
            if (currentItem) {
                result.push(currentItem);
            }
            
            console.log('YAML parsing completed:', result);
            return result;
        } catch (error) {
            console.error('YAML parsing error:', error);
            return [];
        }
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
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    
                    const values = line.split(',').map(v => v.trim());
                    result.push(values);
                }
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

console.log('Local libraries loaded successfully!');

// =======================================================
//  👋 HEY, CODE EXPLORER! THANKS FOR VISITING!
// =======================================================
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
        `%chttps://github.com/Yucheng0208/mywebsite`,
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



// =======================================================
//  DOMContentLoaded 事件監聽器
// =======================================================
document.addEventListener('DOMContentLoaded', function() {

    // --- 函式：初始化所有通用功能 (包含導覽列、頁尾等) ---
    function initializeCommonFeatures() {
        // Swiper Initialization
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

        // Hamburger Menu Toggle
        const hamburgerBtn = document.querySelector('.hamburger-btn');
        const navLinks = document.querySelector('.nav-links');
        if (hamburgerBtn && navLinks) {
            hamburgerBtn.addEventListener('click', () => {
                // === MODIFIED: Add/remove class on body to control scrolling ===
                document.body.classList.toggle('menu-open');

                hamburgerBtn.classList.toggle('is-active');
                navLinks.classList.toggle('is-active');
            });
        }

        // Active Navigation Link Highlighting
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

        // Temporarily hide active link background on hover
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

        // Footer Year
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }

        // Mobile Dropdown Accordion
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (event) => {
                // 檢查是否在手機模式下 (漢堡按鈕是可見的)
                if (hamburgerBtn && window.getComputedStyle(hamburgerBtn).display !== 'none') {
                    event.preventDefault();
                    const parentLi = toggle.closest('.nav-item-dropdown');
                    if (parentLi) {
                        parentLi.classList.toggle('is-open');
                    }
                }
            });
        });

        // Back to Top Button
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
    }
    
    // --- 函式：載入導覽列並初始化 ---
    async function loadNavbarAndInit() {
        const navbarContainer = document.getElementById('navbar-container');
        if (!navbarContainer) {
            // 如果頁面沒有導覽列容器，仍然執行通用功能初始化 (例如頁尾年份)
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

            // **關鍵步驟**：在導覽列的 HTML 被插入到頁面後，才執行初始化
            initializeCommonFeatures();

        } catch (error) {
            console.error('Error loading navbar:', error);
            navbarContainer.innerHTML = '<p style="color: red; text-align: center; padding: 1rem;">Error: Navigation bar could not be loaded.</p>';
        }
    }

    // --- 執行載入與初始化 ---
    loadNavbarAndInit();


    // --- 2. 列表頁初始化 (通用表格) ---
    function initializeListPage(config) {
        const pageContainer = document.querySelector(config.pageSelector);
        if (!pageContainer) return;

        let allItems = [],
            filteredItems = [],
            currentPage = 1;
        const itemsPerPage = 10;
        const tableBody = document.getElementById(config.tableBodyId);
        const filterButtons = document.querySelectorAll(`#${config.filterBarId} button`);
        const searchInput = config.searchInputId ? document.getElementById(config.searchInputId) : null;
        const noResultsDiv = document.getElementById(config.noResultsId);
        const paginationContainer = document.getElementById(config.paginationContainerId);
        const pageInfoSpan = document.getElementById(config.pageInfoId);
        const pageInput = document.getElementById(config.pageInputId);
        const firstPageBtn = document.getElementById(config.firstPageBtnId);
        const prevPageBtn = document.getElementById(config.prevPageBtnId);
        const nextPageBtn = document.getElementById(config.nextPageBtnId);
        const lastPageBtn = document.getElementById(config.lastPageBtnId);

        async function loadData() {
            try {
                const response = await fetch(config.yamlPath);
                if (!response.ok) throw new Error(`YAML file not found: ${config.yamlPath}`);
                const yamlContent = await response.text();
                allItems = window.jsyaml.load(yamlContent) || [];
                updateDisplay({
                    type: 'refresh'
                });
            } catch (error) {
                console.error(`Failed to load or parse data for ${config.pageSelector}:`, error);
                if (tableBody) tableBody.innerHTML = `<tr><td style="text-align:center; color: #ff4d4d;">Error loading data. Please check the console.</td></tr>`;
            }
        }

        function renderPage(itemsToShow, animationOptions) {
            if (!tableBody) return;
            if (animationOptions.type === 'none') {
                populateTable(itemsToShow, animationOptions);
                return;
            }
            const children = Array.from(tableBody.children);
            if (children.length > 0) {
                let exitClass;
                if (animationOptions.type === 'refresh') {
                    exitClass = 'item-exit-fade';
                } else {
                    exitClass = animationOptions.direction === 'right' ? 'item-exit-to-left' : 'item-exit-to-right';
                }
                children.forEach(row => row.className = exitClass);
                setTimeout(() => populateTable(itemsToShow, animationOptions), 300);
            } else {
                populateTable(itemsToShow, animationOptions);
            }
        }

        function populateTable(itemsToShow, animationOptions) {
            tableBody.innerHTML = '';
            let enterClass = 'item-enter-from-down';
            if (animationOptions.type === 'slide') {
                enterClass = animationOptions.direction === 'right' ? 'item-enter-from-right' : 'item-enter-from-left';
            }
            itemsToShow.forEach((item, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                const row = config.renderRowFunction(item, globalIndex);
                row.className = enterClass;
                if (animationOptions.type === 'slide') {
                    row.style.animationDelay = '0s';
                } else {
                    row.style.animationDelay = `${index * 0.05}s`;
                }
                tableBody.appendChild(row);
            });
        }

        function setupPagination() {
            if (!paginationContainer) return;
            const totalItems = filteredItems.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            if (totalPages <= 1) {
                paginationContainer.style.display = 'none';
                return;
            }
            paginationContainer.style.display = 'flex';
            if (pageInfoSpan) pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
            if (pageInput) {
                pageInput.value = currentPage;
                pageInput.max = totalPages;
            }
            if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
            if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
            if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
            if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
        }

        function displayPage(page, animationOptions) {
            currentPage = page;
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = filteredItems.slice(start, end);
            renderPage(paginatedItems, animationOptions);
            setupPagination();
        }

        function updateDisplay(animationOptions) {
            const activeFilterButton = document.querySelector(`#${config.filterBarId} button.active`);
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
            let tempFiltered = allItems;
            if (activeFilterButton) {
                const activeFilter = activeFilterButton.dataset.filter;
                if (activeFilter !== 'all') {
                    tempFiltered = tempFiltered.filter(item => item.category === activeFilter);
                }
            }
            if (searchTerm) {
                tempFiltered = tempFiltered.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(searchTerm)));
            }
            filteredItems = tempFiltered;
            if (noResultsDiv) noResultsDiv.style.display = filteredItems.length === 0 ? 'block' : 'none';
            if (filteredItems.length === 0) {
                const children = Array.from(tableBody.children);
                if (children.length > 0) {
                    const exitClass = animationOptions.type === 'refresh' ? 'item-exit-fade' : (animationOptions.direction === 'right' ? 'item-exit-to-left' : 'item-exit-to-right');
                    children.forEach(row => row.className = exitClass);
                    setTimeout(() => {
                        tableBody.innerHTML = '';
                    }, 300);
                }
                if (paginationContainer) paginationContainer.style.display = 'none';
            } else {
                displayPage(1, animationOptions);
            }
        }

        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const currentActiveButton = document.querySelector(`#${config.filterBarId} button.active`);
                    if (button === currentActiveButton) return;
                    const newFilter = button.dataset.filter;
                    const oldFilter = currentActiveButton ? currentActiveButton.dataset.filter : 'all';
                    let animationOptions;
                    if (newFilter === 'all' || newFilter === 'Certification' || newFilter === 'academic' || newFilter === 'industry') {
                        animationOptions = {
                            type: 'none'
                        };
                    } else if (oldFilter === 'all' || oldFilter === 'Certification') {
                        animationOptions = {
                            type: 'refresh'
                        };
                    } else {
                        const allButtons = Array.from(filterButtons);
                        const oldIndex = allButtons.indexOf(currentActiveButton);
                        const newIndex = allButtons.indexOf(button);
                        animationOptions = {
                            type: 'slide',
                            direction: newIndex > oldIndex ? 'right' : 'left'
                        };
                    }
                    if (currentActiveButton) {
                        currentActiveButton.classList.remove('active');
                    }
                    button.classList.add('active');
                    updateDisplay(animationOptions);
                });
            });
        }
        const refreshAnimation = {
            type: 'refresh'
        };
        if (searchInput) searchInput.addEventListener('input', () => updateDisplay(refreshAnimation));
        if (firstPageBtn) firstPageBtn.addEventListener('click', () => displayPage(1, refreshAnimation));
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) displayPage(currentPage - 1, refreshAnimation);
        });
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            if (currentPage < totalPages) displayPage(currentPage + 1, refreshAnimation);
        });
        if (lastPageBtn) lastPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            displayPage(totalPages, refreshAnimation);
        });
        if (pageInput) pageInput.addEventListener('change', () => {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            let page = parseInt(pageInput.value, 10);
            if (isNaN(page) || page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            displayPage(page, refreshAnimation);
        });
        loadData();
    }

    // --- 3. 表格渲染輔助函式 ---
    function renderPublicationRow(pub, globalIndex) {
        let linksHTML = '';
        if (pub.links && typeof pub.links === 'object') {
            const validLinks = Object.entries(pub.links).filter(([_, url]) => url && String(url).trim() !== '');
            if (validLinks.length > 0) {
                linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
            }
        }
        const row = document.createElement('tr');
        row.innerHTML = `<td data-label="#">${globalIndex}.</td><td data-label="Title">${pub.title || ''}</td><td data-label="Authors">${pub.authors || ''}</td><td data-label="Venue">${pub.venue || ''}</td><td data-label="Date">${pub.date || 'TBA'}</td><td data-label="Author Role">${pub.authorrole || ''}</td>${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}`;
        return row;
    }

    function renderHonorRow(honor, globalIndex) {
        let linksHTML = '';
        if (honor.links && typeof honor.links === 'object') {
            const validLinks = Object.entries(honor.links).filter(([_, url]) => url && String(url).trim() !== '');
            if (validLinks.length > 0) {
                linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
            }
        }
        const row = document.createElement('tr');
        row.innerHTML = `<td data-label="#">${globalIndex}.</td><td data-label="Title">${honor.title || ''}</td><td data-label="Event">${honor.event || ''}</td><td data-label="Organizer">${honor.organizer || ''}</td>${honor.award ? `<td data-label="Award">${honor.award}</td>` : ''}${honor.bonus ? `<td data-label="Bonus">${honor.bonus}</td>` : ''}${honor.members ? `<td data-label="Members">${honor.members}</td>` : ''}${honor.supervisor ? `<td data-label="Supervisor">Supervisor: ${honor.supervisor}</td>` : ''}<td data-label="Date">${honor.date || 'TBA'}</td>${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}`;
        return row;
    }

    function renderHighlightRow(highlight, globalIndex) {
        const location = highlight.localtion || highlight.location || '';
        let linksHTML = '';
        if (highlight.links && typeof highlight.links === 'object') {
            const validLinks = Object.entries(highlight.links).filter(([_, url]) => url && String(url).trim() !== '');
            if (validLinks.length > 0) {
                linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
            }
        }
        const row = document.createElement('tr');
        row.innerHTML = `<td data-label="#">${globalIndex}.</td><td data-label="Title">${highlight.title || 'No Title'}</td>${highlight.position ? `<td data-label="Position">${highlight.position}</td>` : ''}${location ? `<td data-label="Location">${location}</td>` : ''}${highlight.organizer ? `<td data-label="Organizer">${highlight.organizer}</td>` : ''}<td data-label="Date">${highlight.date || 'TBA'}</td>${linksHTML ? `<td data--label="Links">${linksHTML}</td>` : ''}`;
        return row;
    }

    function renderProjectRow(project, globalIndex) {
        let linksHTML = '';
        if (project.links && typeof project.links === 'object') {
            const validLinks = Object.entries(project.links).filter(([_, url]) => url && String(url).trim() !== '');
            if (validLinks.length > 0) {
                linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
            }
        }
        const row = document.createElement('tr');
        row.innerHTML = `<td data-label="Title">${project.title || ''}</td><td data-label="Class">${project.class || ''}</td><td data-label="Project ID">${project.number || ''}</td><td data-label="Duration">${project.date || 'TBA'}</td><td data-label="position">${project.position || ''}</td>${project.Members ? `<td data-label="Members">${project.members}</td>` : ''}${project.bonus ? `<td data-label="Bonus">${project.bonus}</td>` : ''}${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}`;
        return row;
    }

    function renderWorkRow(work, globalIndex) {
        let linksHTML = '';
        if (work.links && typeof work.links === 'object') {
            const validLinks = Object.entries(work.links).filter(([_, url]) => url && String(url).trim() !== '');
            if (validLinks.length > 0) {
                linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
            }
        }
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Organization">${work.organization || ''}</td>
            <td data-label="Position">${work.position || ''}</td>
            ${work.crn ? `<td data-label="CRN">Company Registration Numbers: ${work.crn}</td>` : ''}
            <td data-label="Date">${work.date || 'TBA'}</td>
            ${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}
        `;
        return row;
    }

    // --- 4. 初始化所有列表頁 (表格) ---
    initializeListPage({
        pageSelector: '.publication-page',
        yamlPath: './data/yaml/publications.yaml',
        tableBodyId: 'publication-table-body',
        filterBarId: 'publication-filter',
        searchInputId: 'publication-search',
        noResultsId: 'no-results',
        paginationContainerId: 'pagination-container',
        pageInfoId: 'page-info',
        pageInputId: 'page-input',
        firstPageBtnId: 'first-page',
        prevPageBtnId: 'prev-page',
        nextPageBtnId: 'next-page',
        lastPageBtnId: 'last-page',
        renderRowFunction: renderPublicationRow
    });
    initializeListPage({
        pageSelector: '.honor-page',
        yamlPath: './data/yaml/honors.yaml',
        tableBodyId: 'honor-table-body',
        filterBarId: 'honor-filter',
        searchInputId: 'honor-search',
        noResultsId: 'no-results-honor',
        paginationContainerId: 'pagination-container-honor',
        pageInfoId: 'page-info-honor',
        pageInputId: 'page-input-honor',
        firstPageBtnId: 'first-page-honor',
        prevPageBtnId: 'prev-page-honor',
        nextPageBtnId: 'next-page-honor',
        lastPageBtnId: 'last-page-honor',
        renderRowFunction: renderHonorRow
    });
    initializeListPage({
        pageSelector: '.highlight-page',
        yamlPath: './data/yaml/highlights.yaml',
        tableBodyId: 'highlight-table-body',
        filterBarId: 'highlight-filter',
        searchInputId: 'highlight-search',
        noResultsId: 'no-results-highlight',
        paginationContainerId: 'pagination-container-highlight',
        pageInfoId: 'page-info-highlight',
        pageInputId: 'page-input-highlight',
        firstPageBtnId: 'first-page-highlight',
        prevPageBtnId: 'prev-page-highlight',
        nextPageBtnId: 'next-page-highlight',
        lastPageBtnId: 'last-page-highlight',
        renderRowFunction: renderHighlightRow
    });
    initializeListPage({
        pageSelector: '.project-page',
        yamlPath: './data/yaml/projects.yaml',
        tableBodyId: 'project-table-body',
        filterBarId: 'project-filter',
        searchInputId: 'project-search',
        noResultsId: 'no-results-project',
        paginationContainerId: 'pagination-container-project',
        pageInfoId: 'page-info-project',
        pageInputId: 'page-input-project',
        firstPageBtnId: 'first-page-project',
        prevPageBtnId: 'prev-page-project',
        nextPageBtnId: 'next-page-project',
        lastPageBtnId: 'last-page-project',
        renderRowFunction: renderProjectRow
    });
    initializeListPage({
        pageSelector: '.work-page',
        yamlPath: './data/yaml/works.yaml',
        tableBodyId: 'work-table-body',
        filterBarId: 'work-filter',
        searchInputId: null,
        noResultsId: 'no-results-work',
        paginationContainerId: 'pagination-container-work',
        pageInfoId: 'page-info-work',
        pageInputId: 'page-input-work',
        firstPageBtnId: 'first-page-work',
        prevPageBtnId: 'prev-page-work',
        nextPageBtnId: 'next-page-work',
        lastPageBtnId: 'last-page-work',
        renderRowFunction: renderWorkRow
    });

    // --- 5. 首頁影音滑動視窗 ---
    (function setupVideoWindow() {
        const videoIds = ["4RvHph2q0Hc", "4RvHph2q0Hc", "4RvHph2q0Hc"];
        let currentIndex = 0;
        const container = document.querySelector('.video-window-glw0pyx-wrapper');
        if (!container || videoIds.length === 0) return;
        const displayArea = container.querySelector('.video-window-glw0pyx-display-area');
        const prevBtn = container.querySelector('.video-window-glw0pyx-prev-btn');
        const nextBtn = container.querySelector('.video-window-glw0pyx-next-btn');
        const slots = {
            left: container.querySelector('.slot-left iframe'),
            center: container.querySelector('.slot-center iframe'),
            right: container.querySelector('.slot-right iframe')
        };
        const isMobile = window.innerWidth <= 768;
        const n = videoIds.length;

        function render(index) {
            displayArea.style.opacity = 0;
            setTimeout(() => {
                if (isMobile) {
                    slots.center.src = `https://www.youtube.com/embed/${videoIds[index]}`;
                } else {
                    if (n < 3) {
                        slots.center.src = `https://www.youtube.com/embed/${videoIds[index]}`;
                        container.querySelector('.slot-left').style.display = 'none';
                        container.querySelector('.slot-right').style.display = 'none';
                        prevBtn.style.display = 'none';
                        nextBtn.style.display = 'none';
                    } else {
                        slots.left.src = `https://www.youtube.com/embed/${videoIds[index]}`;
                        slots.center.src = `https://www.youtube.com/embed/${videoIds[(index + 1) % n]}`;
                        slots.right.src = `https://www.youtube.com/embed/${videoIds[(index + 2) % n]}`;
                    }
                }
                displayArea.style.opacity = 1;
            }, 300);
        }
        if (n > 0) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + n) % n;
                render(currentIndex);
            });
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % n;
                render(currentIndex);
            });
            render(currentIndex);
        }
    })();

    // --- 6. 教材頁 (Materials Page) 專用邏輯 ---
    (function setupMaterialsPage() {
        const pageContainer = document.querySelector('.materials-page');
        if (!pageContainer) return;
        const listContainer = document.getElementById('materials-list-container');
        const noResultsDiv = document.getElementById('no-results-materials');
        const schoolFilterContainer = document.getElementById('school-filter');
        const yearFilter = document.getElementById('year-filter');
        const semesterFilter = document.getElementById('semester-filter');
        const searchInput = document.getElementById('materials-search');
        const langToggleButton = document.getElementById('lang-toggle');
        let allCourses = [];
        const yearOptionMap = {};
        const semesterOptionMap = {};

        function updateDropdownLanguage() {
            const isZh = document.body.classList.contains('show-zh');
            const allYearOption = yearFilter.querySelector('option[value="all"]');
            if (allYearOption) {
                allYearOption.textContent = isZh ? '所有學年度' : 'All Academic Years';
            }
            for (const year in yearOptionMap) {
                yearOptionMap[year].textContent = isZh ? `${year} 學年度` : `Academic Year ${year}`;
            }
            const allSemesterOption = semesterFilter.querySelector('option[value="all"]');
            if (allSemesterOption) {
                allSemesterOption.textContent = isZh ? '所有學期' : 'All Semesters';
            }
            for (const semester in semesterOptionMap) {
                semesterOptionMap[semester].textContent = isZh ? `第 ${semester} 學期` : `Semester ${semester}`;
            }
        }
        if (langToggleButton) {
            langToggleButton.addEventListener('click', () => {
                document.body.classList.toggle('show-zh');
                updateDropdownLanguage();
            });
        }
        async function loadMaterials() {
            try {
                const response = await fetch('./data/yaml/materials.yaml');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const yamlText = await response.text();
                allCourses = window.jsyaml.load(yamlText) || [];
                allCourses.sort((a, b) => {
                    if (a.academicYear !== b.academicYear) return b.academicYear.localeCompare(a.academicYear);
                    return b.semester.localeCompare(a.semester);
                });
                populateFilters();
                filterAndRender();
            } catch (error) {
                console.error('Failed to load or parse materials.yml:', error);
                if (listContainer) {
                    listContainer.innerHTML = '<p style="color: red; text-align: center;">Error loading course data. Please check the console.</p>';
                }
            }
        }

        function populateFilters() {
            const years = [...new Set(allCourses.map(c => c.academicYear))];
            const semesters = [...new Set(allCourses.map(c => c.semester))];
            yearFilter.innerHTML = '<option value="all">All Academic Years</option>';
            semesterFilter.innerHTML = '<option value="all">All Semesters</option>';
            years.sort().reverse().forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = `${year} (AY)`;
                yearFilter.appendChild(option);
                yearOptionMap[year] = option;
            });
            semesters.sort().forEach(semester => {
                const option = document.createElement('option');
                option.value = semester;
                option.textContent = `Semester ${semester}`;
                semesterFilter.appendChild(option);
                semesterOptionMap[semester] = option;
            });
            updateDropdownLanguage();
        }

        function renderCourses(courses) {
            listContainer.innerHTML = '';
            if (noResultsDiv) {
                noResultsDiv.style.display = courses.length === 0 ? 'block' : 'none';
            }
            if (courses.length === 0) return;
            courses.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.className = 'course-card';
                const links = course.links || {};
                courseCard.innerHTML = `
                    <h3>
                        <span class="lang-en">${course.courseName.en}</span>
                        <span class="lang-zh">${course.courseName.zh}</span>
                        <span style="font-size: 0.6em; color: #8b949e; font-weight: normal;">
                            (${course.academicYear}-${course.semester} @ <span class="lang-en">${course.school.en}</span><span class="lang-zh">${course.school.zh}</span>)
                        </span>
                    </h3>
                    <div class="course-details">
                        <p><strong><span class="lang-en">Educational</span><span class="lang-zh">授課學制</span>:</strong> <span class="lang-en">${course.educational.en}</span><span class="lang-zh">${course.educational.zh}</span></p>
                        <p><strong><span class="lang-en">Course Time</span><span class="lang-zh">授課時間</span>:</strong> <span class="lang-en">${course.courseTime.en}</span><span class="lang-zh">${course.courseTime.zh}</span></p>
                        <p><strong><span class="lang-en">Office Hours</span><span class="lang-zh">輔導時間</span>:</strong> <span class="lang-en">${course.officeHours.en}</span><span class="lang-zh">${course.officeHours.zh}</span></p>
                        <p><strong><span class="lang-en">Class</span><span class="lang-zh">授課班級</span>:</strong> <span class="lang-en">${course.class.en}</span><span class="lang-zh">${course.class.zh}</span></p>
                        <p><strong><span class="lang-en">Classroom</span><span class="lang-zh">授課教室</span>:</strong> <span class="lang-en">${course.classroom.en}</span><span class="lang-zh">${course.classroom.zh}</span></p>
                        <p><strong><span class="lang-en">Language</span><span class="lang-zh">授課語言</span>:</strong> <span class="lang-en">${course.language.en}</span><span class="lang-zh">${course.language.zh}</span></p>
                        <p><strong><span class="lang-en">Teaching Assistents</span><span class="lang-zh">課程助教</span>:</strong> <span>${course.ta || 'N/A'}</span></p>
                        <p><strong><span class="lang-en">Description</span><span class="lang-zh">課程簡介</span>:</strong> <span class="lang-en">${course.description.en}</span><span class="lang-zh">${course.description.zh}</span></p>
                    </div>
                    <div class="course-links">
                        <a href="mailto:${course.contactEmailPlaceholder || '#'}" class="btn contact-btn"><span class="lang-en">Contact Me</span><span class="lang-zh">聯繫老師</span></a>
                        ${links.materials ? `<a href="${links.materials}" target="_blank" class="btn"><span class="lang-en">Materials</span><span class="lang-zh">課程教材</span></a>` : ''}
                        ${links.linechat ? `<a href="${links.linechat}" target="_blank" class="btn"><span class="lang-en">LINE Chat</span><span class="lang-zh">LINE 群組</span></a>` : ''}
                        ${links.announcements ? `<a href="${links.announcements}" target="_blank" class="btn"><span class="lang-en">Announcements</span><span class="lang-zh">課程公告</span></a>` : ''}
                        ${links.msteams ? `<a href="${links.msteams}" target="_blank" class="btn"><span class="lang-en">Microsoft Teams</span><span class="lang-zh">Microsoft Teams</span></a>` : ''}
                        ${links.googlemeet ? `<a href="${links.googlemeet}" target="_blank" class="btn"><span class="lang-en">Google Meet</span><span class="lang-zh">Google Meet</span></a>` : ''}
                        ${links.googleclassroom ? `<a href="${links.googleclassroom}" target="_blank" class="btn"><span class="lang-en">Google Classroom</span><span class="lang-zh">Google Classroom</span></a>` : ''}
                        ${links.zuvio ? `<a href="${links.zuvio}" target="_blank" class="btn"><span class="lang-en">Zuvio</span><span class="lang-zh">Zuvio</span></a>` : ''}
                        ${links.github ? `<a href="${links.github}" target="_blank" class="btn"><span class="lang-en">GitHub</span><span class="lang-zh">GitHub</span></a>` : ''}
                    </div>`;
                listContainer.appendChild(courseCard);
            });
        }

        function filterAndRender() {
            if (!schoolFilterContainer) return;
            const activeSchoolButton = schoolFilterContainer.querySelector('.active');
            if (!activeSchoolButton) return;
            const activeFilter = activeSchoolButton.dataset.filter;
            const selectedYear = yearFilter.value;
            const selectedSemester = semesterFilter.value;
            const searchTerm = searchInput.value.toLowerCase().trim();
            const filteredCourses = allCourses.filter(course => {
                // 使用 educational 做分類，將按鈕值映射到對應的 educational 值
                let educationalMatch = false;
                if (activeFilter === 'all') {
                    educationalMatch = true;
                } else if (activeFilter === 'high-school') {
                    educationalMatch = course.educational && course.educational.en === 'High School';
                } else if (activeFilter === 'university') {
                    educationalMatch = course.educational && course.educational.en === 'University';
                }
                
                const yearMatch = selectedYear === 'all' || course.academicYear === selectedYear;
                const semesterMatch = selectedSemester === 'all' || course.semester === selectedSemester;
                const searchMatch = !searchTerm || 
                    (course.courseName.en && course.courseName.en.toLowerCase().includes(searchTerm)) || 
                    (course.courseName.zh && course.courseName.zh.toLowerCase().includes(searchTerm)) || 
                    (course.description.en && course.description.en.toLowerCase().includes(searchTerm)) || 
                    (course.description.zh && course.description.zh.toLowerCase().includes(searchTerm)) || 
                    (course.school && course.school.en && course.school.en.toLowerCase().includes(searchTerm)) ||
                    (course.school && course.school.zh && course.school.zh.toLowerCase().includes(searchTerm)) ||
                    (course.educational && course.educational.en && course.educational.en.toLowerCase().includes(searchTerm)) ||
                    (course.educational && course.educational.zh && course.educational.zh.toLowerCase().includes(searchTerm));
                return educationalMatch && yearMatch && semesterMatch && searchMatch;
            });
            renderCourses(filteredCourses);
        }
        if (schoolFilterContainer) {
            schoolFilterContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const currentActive = schoolFilterContainer.querySelector('.active');
                    if (currentActive) currentActive.classList.remove('active');
                    e.target.classList.add('active');
                    filterAndRender();
                }
            });
        }
        if (yearFilter) yearFilter.addEventListener('change', filterAndRender);
        if (semesterFilter) semesterFilter.addEventListener('change', filterAndRender);
        if (searchInput) searchInput.addEventListener('input', filterAndRender);
        loadMaterials();
    })();

    // --- 7. Skills Section Progress Bar Animation ---
    (function setupSkillsObserver() {
        const skillsSection = document.querySelector('#skills');
        if (!skillsSection) return;
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBars = skillsSection.querySelectorAll('.progress-bar');
                    progressBars.forEach(bar => {
                        const targetWidth = bar.dataset.width;
                        bar.style.width = targetWidth;
                        const skillItem = bar.closest('.skill-item');
                        if (skillItem) {
                            const textSpan = skillItem.querySelector('.text-muted');
                            if (textSpan) {
                                textSpan.textContent = targetWidth;
                            }
                        }
                    });
                    observer.unobserve(skillsSection);
                }
            });
        }, observerOptions);
        observer.observe(skillsSection);
    })();

    // --- 8. 課表頁 (Schedule Page) 專用邏輯 ---
    (function setupSchedulePage() {
        const pageContainer = document.querySelector('.schedule-page');
        if (!pageContainer) return;
        const filterContainer = document.getElementById('schedule-filter');
        const scheduleWrappers = document.querySelectorAll('.schedule-wrapper');
        if (!filterContainer) return;
        filterContainer.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                return;
            }
            const targetScheduleId = e.target.dataset.schedule;
            if (!targetScheduleId) return;
            filterContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            scheduleWrappers.forEach(wrapper => {
                wrapper.style.display = 'none';
            });
            const targetWrapper = document.getElementById(targetScheduleId + '-schedule');
            if (targetWrapper) {
                targetWrapper.style.display = 'block';
            }
        });
    })();

    // =======================================================
    //  9. 成績查詢頁 (Grade Inquiry Page) 專用邏輯  [MODIFIED]
    // =======================================================
    (function setupGradeInquiryPage() {
        const pageContainer = document.querySelector('.grade-inquiry-page');
        if (!pageContainer) return;

        // --- 元素獲取 ---
        const schoolSelect = document.getElementById('school-select');
        const courseSelect = document.getElementById('course-select');
        const studentIdInput = document.getElementById('student-id-input');
        const searchBtn = document.getElementById('search-btn');
        const langToggleBtn = document.getElementById('lang-toggle');
        const resultsContainer = document.getElementById('grade-results-container');
        const noResultsMessage = document.getElementById('no-results-message');
        const loadingIndicator = document.getElementById('loading-indicator');
        const resultCourseName = document.getElementById('result-course-name');
        const resultCourseCode = document.getElementById('result-course-code');
        const resultStudentId = document.getElementById('result-student-id');
        const gradeDetailsBody = document.getElementById('grade-details-body');
        
        const summaryCards = {
            assignments: document.querySelector('#card-assignments .score .value'),
            dailyPerformance: document.querySelector('#card-daily-performance .score .value'),
            attendance: document.querySelector('#card-attendance .score .value'),
            midterm: document.querySelector('#card-midterm .score .value'),
            final: document.querySelector('#card-final .score .value'),
            bonus: document.querySelector('#card-bonus .score .value'),
        };
        const subtotalScoreEl = document.getElementById('subtotal-score');
        const bonusScoreEl = document.getElementById('bonus-score');
        const finalTotalScoreEl = document.getElementById('final-total-score');
        
        let availableCourses = [];

        // --- 標頭翻譯字典 ---
        const headerTranslations = {
            'HW': { en: 'Homework', zh: '作業' },
            'Quiz': { en: 'Quiz', zh: '小考' },
            'Bonus': { en: 'Bonus', zh: '加分' },
            'Daily': {en: 'Daily', zh: '日常'},
            'Participation': {en: 'Participation', zh: '參與分數'},
            'Attendance': { en: 'Attendance', zh: '點名分數' },
            'Midterm': { en: 'Midterm', zh: '期中' },
            'Final': { en: 'Final', zh: '期末' },
        };
        
        // --- 核心功能函式 ---

        function isChinese() {
            return document.body.classList.contains('show-zh');
        }

        function getDisplayName(header) {
            const lang = isChinese() ? 'zh' : 'en';
            if (headerTranslations[header]) {
                return headerTranslations[header][lang];
            }
            const match = header.match(/^([a-zA-Z]+)(\d+)$/);
            if (match) {
                const base = match[1];
                const number = match[2];
                if (headerTranslations[base]) {
                    return `${headerTranslations[base][lang]} ${number}`;
                }
            }
            return header;
        }

        function showLoading(show) {
            loadingIndicator.style.display = show ? 'block' : 'none';
            [searchBtn, studentIdInput, schoolSelect, courseSelect].forEach(el => el.disabled = show);
        }
    
        function hideAllResults() {
            resultsContainer.style.display = 'none';
            noResultsMessage.style.display = 'none';
        }
    
        async function loadCourses() {
            try {
                await waitForJsYaml();
                
                const response = await fetch('./data/yaml/grades.yaml');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const yamlText = await response.text();
                availableCourses = window.jsyaml.load(yamlText) || [];
                loadSchools();
            } catch (error) {
                console.error('Failed to load grades.yaml:', error);
                schoolSelect.disabled = true;
                courseSelect.disabled = true;
                schoolSelect.innerHTML = '<option>Error loading courses</option>';
            }
        }

        function waitForJsYaml(timeout = 1000) {
            return new Promise((resolve, reject) => {
                if (typeof window.jsyaml !== 'undefined' && typeof window.jsyaml.load === 'function') {
                    resolve();
                    return;
                }
                setTimeout(() => {
                    if (typeof window.jsyaml !== 'undefined' && typeof window.jsyaml.load === 'function') {
                        resolve();
                    } else {
                        reject(new Error('js-yaml library is not available.'));
                    }
                }, 100);
            });
        }
        
        function loadSchools() {
            schoolSelect.options.length = 1;
            const schoolMap = new Map();
            availableCourses.forEach(c => {
                if (c.school && c.school_id && c.school_id !== 'NA' && c.school_id.trim() !== '' && c.school.en && c.school.zh && !schoolMap.has(c.school_id)) {
                    schoolMap.set(c.school_id, c.school);
                }
            });
            schoolMap.forEach((school, id) => {
                const option = new Option(isChinese() ? school.zh : school.en, id);
                schoolSelect.add(option);
            });
            updateSchoolSelectLanguage();
        }
        
        function loadCoursesForSchool(schoolId) {
            courseSelect.options.length = 1;
            courseSelect.disabled = !schoolId;
            if (!schoolId) return;
            availableCourses.filter(c => c.school_id === schoolId).forEach(c => {
                const text = isChinese() ? `${c.name.zh} (${c.code})` : `${c.name.en} (${c.code})`;
                const option = new Option(text, c.id);
                courseSelect.add(option);
            });
            updateCourseSelectLanguage();
        }
        
        function updateSchoolSelectLanguage() {
            const isZh = isChinese();
            Array.from(schoolSelect.options).forEach(opt => {
                if (opt.value === "") {
                    opt.textContent = isZh ? "請選擇學校" : "Please select a school";
                } else {
                    const course = availableCourses.find(c => c.school_id === opt.value);
                    if (course) opt.textContent = isZh ? course.school.zh : course.school.en;
                }
            });
        }
        
        function updateCourseSelectLanguage() {
            const isZh = isChinese();
            Array.from(courseSelect.options).forEach(opt => {
                if (opt.value === "") {
                    opt.textContent = isZh ? "請選擇一門課程" : "Please select a course";
                } else {
                    const course = availableCourses.find(c => c.id === opt.value);
                    if (course) opt.textContent = isZh ? `${course.name.zh} (${course.code})` : `${course.name.en} (${course.code})`;
                }
            });
        }
    
        // --- 自定義彈窗功能 ---
        function createModal() {
            const modal = document.createElement('div');
            modal.className = 'custom-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title"></h3>
                    </div>
                    <div class="modal-body">
                        <p class="modal-message"></p>
                        <div class="modal-input-container">
                            <input type="password" class="modal-input" maxlength="20" />
                            <button type="button" class="modal-toggle-password" title="顯示/隱藏密碼">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="modal-error"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-secondary" data-action="cancel">
                            <span class="lang-en">Cancel</span>
                            <span class="lang-zh">取消</span>
                        </button>
                        <button class="modal-btn modal-btn-primary" data-action="confirm">
                            <span class="lang-en">Confirm</span>
                            <span class="lang-zh">確認</span>
                        </button>
                    </div>
                </div>
            `;
            
            // 防止頁面滾動干擾彈窗居中位置
            document.body.style.overflow = 'hidden';
            document.body.appendChild(modal);
            
            // 添加清理函數到模態框對象
            modal.cleanup = function() {
                document.body.style.overflow = '';
            };
            
            return modal;
        }

        function showAccessCodeModal() {
            return new Promise((resolve) => {
                const modal = createModal();
                const titleEl = modal.querySelector('.modal-title');
                const messageEl = modal.querySelector('.modal-message');
                const inputEl = modal.querySelector('.modal-input');
                const toggleBtn = modal.querySelector('.modal-toggle-password');
                const errorEl = modal.querySelector('.modal-error');
                const cancelBtn = modal.querySelector('[data-action="cancel"]');
                const confirmBtn = modal.querySelector('[data-action="confirm"]');

                // 設定內容
                titleEl.innerHTML = isChinese() ? '🔐 輸入查詢代碼' : '🔐 Enter Access Code';
                messageEl.innerHTML = isChinese() 
                    ? '請輸入六位數查詢代碼 (由大小寫英文字母和數字組成)<br><small style="color: #8b949e;">管理者 (yccadmin) 請輸入: ADMIN_課程代碼</small>' 
                    : 'Please enter the 6-digit access code (consisting of uppercase/lowercase letters and numbers)<br><small style="color: #8b949e;">Admin (yccadmin): Enter ADMIN_CourseCode</small>';
                inputEl.placeholder = '＊＊＊＊＊＊';

                // 密碼顯示/隱藏功能
                let isPasswordVisible = false;
                toggleBtn.addEventListener('click', () => {
                    isPasswordVisible = !isPasswordVisible;
                    const iconEl = toggleBtn.querySelector('i');
                    if (isPasswordVisible) {
                        inputEl.type = 'text';
                        iconEl.className = 'fas fa-eye-slash';
                        toggleBtn.title = isChinese() ? '隱藏密碼' : 'Hide password';
                    } else {
                        inputEl.type = 'password';
                        iconEl.className = 'fas fa-eye';
                        toggleBtn.title = isChinese() ? '顯示密碼' : 'Show password';
                    }
                });

                // 顯示彈窗
                setTimeout(() => modal.classList.add('show'), 10);
                inputEl.focus();

                // 即時驗證
                inputEl.addEventListener('input', () => {
                    const value = inputEl.value;
                    const isValidStudentCode = validateAccessCode(value);
                    const isValidAdminCode = value.startsWith('ADMIN_');
                    
                    if (value.length > 0 && !isValidStudentCode && !isValidAdminCode) {
                        errorEl.textContent = isChinese() 
                            ? '格式錯誤！請輸入6位英文字母和數字，或管理者代碼' 
                            : 'Invalid format! Please enter 6 letters and numbers, or admin code';
                        errorEl.style.display = 'block';
                        confirmBtn.disabled = true;
                        confirmBtn.style.opacity = '0.5';
                    } else {
                        errorEl.style.display = 'none';
                        confirmBtn.disabled = false;
                        confirmBtn.style.opacity = '1';
                    }
                });

                // Enter 鍵提交
                inputEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const value = inputEl.value;
                        if (validateAccessCode(value) || value.startsWith('ADMIN_')) {
                            confirmBtn.click();
                        }
                    }
                });

                // 按鈕事件
                cancelBtn.addEventListener('click', () => {
                    modal.classList.remove('show');
                    setTimeout(() => {
                        modal.cleanup();
                        modal.remove();
                    }, 300);
                    resolve(null);
                });

                confirmBtn.addEventListener('click', () => {
                    const code = inputEl.value.trim();
                    if (validateAccessCode(code) || code.startsWith('ADMIN_')) {
                        modal.classList.remove('show');
                        setTimeout(() => {
                            modal.cleanup();
                            modal.remove();
                        }, 300);
                        resolve(code);
                    }
                });

                // 點擊背景關閉
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        cancelBtn.click();
                    }
                });
            });
        }

        function showAlert(message, isError = false) {
            return new Promise((resolve) => {
                const modal = createModal();
                const titleEl = modal.querySelector('.modal-title');
                const messageEl = modal.querySelector('.modal-message');
                const inputEl = modal.querySelector('.modal-input');
                const errorEl = modal.querySelector('.modal-error');
                const cancelBtn = modal.querySelector('[data-action="cancel"]');
                const confirmBtn = modal.querySelector('[data-action="confirm"]');

                // 隱藏輸入框和取消按鈕
                inputEl.style.display = 'none';
                errorEl.style.display = 'none';
                cancelBtn.style.display = 'none';

                // 設定內容
                titleEl.innerHTML = isError 
                    ? (isChinese() ? '❌ 錯誤' : '❌ Error')
                    : (isChinese() ? '✅ 提示' : '✅ Notice');
                messageEl.textContent = message;
                messageEl.style.textAlign = 'center';

                if (isError) {
                    messageEl.style.color = '#ff6b6b';
                }

                // 顯示彈窗
                setTimeout(() => modal.classList.add('show'), 10);
                confirmBtn.focus();

                // 確認按鈕
                confirmBtn.innerHTML = isChinese() ? '確定' : 'OK';
                confirmBtn.addEventListener('click', () => {
                    modal.classList.remove('show');
                    setTimeout(() => {
                        modal.cleanup();
                        modal.remove();
                    }, 300);
                    resolve();
                });

                // Enter 鍵確認
                document.addEventListener('keydown', function enterHandler(e) {
                    if (e.key === 'Enter') {
                        document.removeEventListener('keydown', enterHandler);
                        confirmBtn.click();
                    }
                });

                // 點擊背景關閉
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        confirmBtn.click();
                    }
                });
            });
        }

        async function performSearch() {
            const courseId = courseSelect.value;
            const studentId = studentIdInput.value.trim().toUpperCase();

            if (!courseId || !studentId) {
                await showAlert(isChinese() ? '請選擇課程並輸入學號。' : 'Please select a course and enter your Student ID.', true);
                return;
            }

            // 驗證學號格式（在要求輸入密碼之前）
            if (!validateStudentId(studentId)) {
                await showAlert(isChinese() 
                    ? '學號格式錯誤！請輸入有效的學號格式。' 
                    : 'Invalid Student ID format! Please enter a valid Student ID.', true);
                return;
            }

            // 檢查學號是否存在於CSV檔案中（在要求輸入密碼之前）
            showLoading(true);
            const studentExists = await checkStudentExists(courseId, studentId);
            showLoading(false);
            
            if (!studentExists) {
                await showAlert(isChinese() 
                    ? '找不到該學號的資料。請確認學號是否正確。' 
                    : 'No data found for this Student ID. Please verify the Student ID.', true);
                return;
            }

            // 使用自定義彈窗要求輸入六位代碼
            const accessCode = await showAccessCodeModal();

            // 檢查使用者是否取消輸入
            if (accessCode === null) {
                return;
            }

            // 檢查是否為管理者查詢（yccadmin學號）
            if (studentId === 'YCCADMIN') {
                const isAdminMode = await checkAdminCode(courseId, accessCode);
                if (isAdminMode) {
                    // 管理者模式：顯示全班成績
                    await showAllGrades(courseId);
                    return;
                } else {
                    await showAlert(isChinese() 
                        ? '管理者代碼錯誤！請確認您輸入的代碼是否正確。' 
                        : 'Admin code is incorrect! Please verify the code you entered.', true);
                    return;
                }
            }

            // 驗證代碼格式（一般學生查詢）
            if (!validateAccessCode(accessCode)) {
                await showAlert(isChinese() 
                    ? '代碼格式錯誤！請輸入六位由大小寫英文字母和數字組成的代碼。' 
                    : 'Invalid code format! Please enter a 6-character code consisting of uppercase/lowercase letters and numbers.', true);
                return;
            }
    
            hideAllResults();
            showLoading(true);
    
            try {
                await waitForPapaParse();
                
                const selectedCourse = availableCourses.find(c => c.id === courseId);
                if (!selectedCourse) throw new Error('Course not found');
                
                const csvPath = selectedCourse.csv_path;
                const response = await fetch(csvPath);
                if (!response.ok) throw new Error(`Could not load grade file: ${csvPath} (Status: ${response.status})`);
                
                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async (results) => {
                        await processGradeData(results.data, studentId, selectedCourse, accessCode);
                    },
                    error: (error) => { throw new Error('Failed to parse CSV file.'); }
                });
    
            } catch (error) {
                console.error('Search failed:', error);
                noResultsMessage.style.display = 'block';
                await showAlert(isChinese() ? `查詢失敗：${error.message}` : `Search failed: ${error.message}`, true);
            } finally {
                showLoading(false);
            }
        }

        function validateAccessCode(code) {
            // 檢查是否為六位字符且只包含大小寫英文字母和數字
            const codeRegex = /^[a-zA-Z0-9]{6}$/;
            return codeRegex.test(code);
        }

        function validateStudentId(studentId) {
            // 根據實際資料調整學號格式驗證
            // 從CSV資料看到的格式：S12345678 (字母S + 8位數字)
            
            // 管理者學號
            if (studentId === 'YCCADMIN') {
                return true;
            }
            
            // 格式1: S + 8位數字 (實際使用的格式)
            const format1 = /^S[0-9]{8}$/;
            
            // 格式2: 其他常見學號格式 - 9位數字 (例: 123456789)
            const format2 = /^[0-9]{9}$/;
            
            // 格式3: 字母+數字組合 (例: A12345678, B12345678)
            const format3 = /^[A-Z][0-9]{8}$/;
            
            // 格式4: 年度+科系代碼+序號 (例: 11012345, 112AB001)
            const format4 = /^[0-9]{3}[A-Z]{0,2}[0-9]{3,5}$/;
            
            return format1.test(studentId) || 
                   format2.test(studentId) || 
                   format3.test(studentId) || 
                   format4.test(studentId);
        }

        async function checkStudentExists(courseId, studentId) {
            try {
                await waitForPapaParse();
                
                const selectedCourse = availableCourses.find(c => c.id === courseId);
                if (!selectedCourse) {
                    throw new Error('Course not found');
                }
                
                const csvPath = selectedCourse.csv_path;
                const response = await fetch(csvPath);
                if (!response.ok) {
                    throw new Error(`Could not load grade file: ${csvPath} (Status: ${response.status})`);
                }
                
                const csvText = await response.text();
                
                return new Promise((resolve) => {
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            // 從第 5 行 (索引為 4) 開始是學生資料
                            const studentRows = results.data.slice(4);
                            const studentData = studentRows.find(row => row.ID && row.ID.toUpperCase() === studentId);
                            resolve(!!studentData); // 轉換為布林值
                        },
                        error: () => {
                            resolve(false); // 解析錯誤時返回 false
                        }
                    });
                });
                
            } catch (error) {
                console.error('Error checking student existence:', error);
                return false; // 發生錯誤時返回 false
            }
        }

        async function checkAdminCode(courseId, accessCode) {
            try {
                await waitForPapaParse();
                
                const selectedCourse = availableCourses.find(c => c.id === courseId);
                if (!selectedCourse) {
                    return false;
                }
                
                const csvPath = selectedCourse.csv_path;
                const response = await fetch(csvPath);
                if (!response.ok) {
                    return false;
                }
                
                const csvText = await response.text();
                
                return new Promise((resolve) => {
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            // 從第 5 行 (索引為 4) 開始是學生資料，查找 yccadmin
                            const studentRows = results.data.slice(4);
                            const adminRow = studentRows.find(row => row.ID && row.ID.toUpperCase() === 'YCCADMIN');
                            
                            if (adminRow) {
                                const adminCode = adminRow.Code || adminRow.code;
                                resolve(adminCode === accessCode);
                            } else {
                                resolve(false);
                            }
                        },
                        error: () => {
                            resolve(false);
                        }
                    });
                });
                
            } catch (error) {
                console.error('Error checking admin code:', error);
                return false;
            }
        }

        async function showAllGrades(courseId) {
            hideAllResults();
            showLoading(true);
    
            try {
                await waitForPapaParse();
                
                const selectedCourse = availableCourses.find(c => c.id === courseId);
                if (!selectedCourse) throw new Error('Course not found');
                
                const csvPath = selectedCourse.csv_path;
                const response = await fetch(csvPath);
                if (!response.ok) throw new Error(`Could not load grade file: ${csvPath} (Status: ${response.status})`);
                
                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async (results) => {
                        await renderAllGrades(results.data, selectedCourse);
                    },
                    error: (error) => { throw new Error('Failed to parse CSV file.'); }
                });
    
            } catch (error) {
                console.error('Show all grades failed:', error);
                await showAlert(isChinese() ? `查詢失敗：${error.message}` : `Search failed: ${error.message}`, true);
            } finally {
                showLoading(false);
            }
        }

        async function renderAllGrades(data, courseInfo) {
            const config = {};
            const configRows = data.slice(0, 4);
            const headers = Object.keys(data[0] || {});

            headers.forEach(h => { config[h] = {}; });
            configRows.forEach(row => {
                const keyName = row.ID;
                if (keyName) {
                    headers.forEach(h => {
                        if (h !== 'ID') {
                            config[h][keyName] = row[h];
                        }
                    });
                }
            });

            // 過濾學生資料，排除管理者帳號
            const studentRows = data.slice(4).filter(row => 
                row.ID && row.ID.toUpperCase() !== 'YCCADMIN'
            );

            // 設定課程資訊
            resultCourseName.innerHTML = `<span class="lang-en">${courseInfo.name.en}</span><span class="lang-zh">${courseInfo.name.zh}</span>`;
            resultCourseCode.textContent = courseInfo.code;
            resultStudentId.innerHTML = `<span class="lang-en">👥 All Students (Admin View)</span><span class="lang-zh">👥 全班成績 (管理者檢視)</span>`;

            // 計算各類別的總權重並顯示特定成績卡片
            const categoryWeights = {};
            headers.forEach(h => {
                if (h !== 'ID' && config[h] && config[h].category && config[h].category !== 'code') {
                    const category = config[h].category;
                    const weight = parseFloat(config[h].weight) || 0;
                    if (!categoryWeights[category]) {
                        categoryWeights[category] = 0;
                    }
                    categoryWeights[category] += weight;
                }
            });

            // 顯示成績卡片（管理者模式下顯示佔比）
            const cardsContainer = document.querySelector('.grade-summary-cards');
            cardsContainer.style.display = 'grid';
            
            // 隱藏所有卡片，然後只顯示需要的
            const allCards = cardsContainer.querySelectorAll('.card');
            allCards.forEach(card => card.style.display = 'none');
            
            // 計算加分項目的平均值
            let bonusTotal = 0;
            let studentCount = 0;
            studentRows.forEach(student => {
                if (!student.ID) return;
                let studentBonusTotal = 0;
                headers.forEach(h => {
                    if (h !== 'ID' && config[h] && config[h].category === 'bonus') {
                        const score = parseFloat(student[h]) || 0;
                        studentBonusTotal += score;
                    }
                });
                bonusTotal += studentBonusTotal;
                studentCount++;
            });
            const bonusAverage = studentCount > 0 ? (bonusTotal / studentCount) : 0;

            // 顯示特定卡片並填入佔比資訊
            const cardMappings = {
                'assignments': 'card-assignments',
                'dailyPerformance': 'card-daily-performance', 
                'attendance': 'card-attendance',
                'midterm': 'card-midterm',
                'final': 'card-final'
            };
            
            Object.keys(cardMappings).forEach(category => {
                const cardId = cardMappings[category];
                const card = document.getElementById(cardId);
                if (card && categoryWeights[category]) {
                    card.style.display = 'block';
                    const scoreElement = card.querySelector('.score .value');
                    if (scoreElement) {
                        const percentage = (categoryWeights[category] * 100).toFixed(0);
                        scoreElement.textContent = `${percentage}%`;
                    }
                    // 更新顯示格式
                    const scoreContainer = card.querySelector('.score');
                    if (scoreContainer) {
                        scoreContainer.innerHTML = `<span class="value">${(categoryWeights[category] * 100).toFixed(0)}%</span>`;
                    }
                }
            });

            // 顯示加分項目卡片並填入平均值
            const bonusCard = document.getElementById('card-bonus');
            if (bonusCard) {
                bonusCard.style.display = 'block';
                const scoreContainer = bonusCard.querySelector('.score');
                if (scoreContainer) {
                    const avgLabel = isChinese() ? '平均' : 'AVG';
                    scoreContainer.innerHTML = `+<span class="value">${bonusAverage.toFixed(1)}</span> <small>(${avgLabel})</small>`;
                }
            }
            
            // 隱藏成績明細標題（因為我們要自定義表格）
            const gradeDetailsSection = document.querySelector('.grade-details');
            const gradeDetailsTitle = gradeDetailsSection.querySelector('h3');
            if (gradeDetailsTitle) {
                gradeDetailsTitle.style.display = 'none';
            }

            // 隱藏原本的thead（包含Item, Score, Weight, Weighted Score等標題）
            const thead = gradeDetailsSection.querySelector('thead');
            if (thead) {
                thead.style.display = 'none';
            }

            // 建立全班成績表格，完全重新設計
            gradeDetailsBody.innerHTML = '';
            
            // 隱藏原本的tfoot（包含Final Score (Before Bonus)等）
            const tfoot = gradeDetailsSection.querySelector('tfoot');
            if (tfoot) {
                tfoot.style.display = 'none';
            }

            // 表格標題行 - 只顯示對應卡片的類別
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `
                <th><span class="lang-en">Rank</span><span class="lang-zh">排名</span></th>
                <th><span class="lang-en">Student ID</span><span class="lang-zh">學號</span></th>
                <th><span class="lang-en">Assignments</span><span class="lang-zh">平時成績</span></th>
                <th><span class="lang-en">Daily Performance</span><span class="lang-zh">日常表現</span></th>
                <th><span class="lang-en">Attendance</span><span class="lang-zh">點名</span></th>
                <th><span class="lang-en">Midterm</span><span class="lang-zh">期中</span></th>
                <th><span class="lang-en">Final</span><span class="lang-zh">期末</span></th>
                <th><span class="lang-en">Bonus</span><span class="lang-zh">加分</span></th>
                <th><span class="lang-en">Final Score</span><span class="lang-zh">總分</span></th>
            `;
            gradeDetailsBody.appendChild(headerRow);

            // 計算每個學生的各類別成績和總分
            const studentData = studentRows.map(student => {
                if (!student.ID) return null;

                const categoryScores = {
                    assignments: 0,
                    dailyPerformance: 0,
                    attendance: 0,
                    midterm: 0,
                    final: 0,
                    bonus: 0
                };

                const categoryWeightedScores = {
                    assignments: 0,
                    dailyPerformance: 0,
                    attendance: 0,
                    midterm: 0,
                    final: 0
                };

                headers.forEach(h => {
                    if (h !== 'ID' && config[h] && config[h].category && config[h].category !== 'code') {
                        const score = parseFloat(student[h]) || 0;
                        const weight = parseFloat(config[h].weight) || 0;
                        const category = config[h].category;
                        
                        if (category === 'bonus') {
                            categoryScores.bonus += score;
                        } else if (categoryScores.hasOwnProperty(category)) {
                            // 計算該類別的平均分數
                            const weightedScore = score * weight;
                            categoryWeightedScores[category] += weightedScore;
                        }
                    }
                });

                // 計算各類別的顯示分數（加權後再除以該類別總權重得到平均分）
                Object.keys(categoryWeightedScores).forEach(category => {
                    if (categoryWeights[category] > 0) {
                        categoryScores[category] = categoryWeightedScores[category] / categoryWeights[category];
                    }
                });

                const subtotal = Object.values(categoryWeightedScores).reduce((sum, score) => sum + score, 0);
                const finalScore = Math.min(100, subtotal + categoryScores.bonus);

                return {
                    id: student.ID,
                    ...categoryScores,
                    finalScore: finalScore
                };
            }).filter(student => student !== null);

            // 根據總分排序（由高到低）
            studentData.sort((a, b) => b.finalScore - a.finalScore);

            // 生成學生成績行
            studentData.forEach((student, index) => {
                const rank = index + 1;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>#${rank}</strong></td>
                    <td><strong>${student.id}</strong></td>
                    <td>${student.assignments.toFixed(1)}</td>
                    <td>${student.dailyPerformance.toFixed(1)}</td>
                    <td>${student.attendance.toFixed(1)}</td>
                    <td>${student.midterm.toFixed(1)}</td>
                    <td>${student.final.toFixed(1)}</td>
                    <td>+${student.bonus.toFixed(1)}</td>
                    <td><strong style="color: var(--tech-cyan);">${student.finalScore.toFixed(2)}</strong></td>
                `;
                gradeDetailsBody.appendChild(row);
            });

            resultsContainer.style.display = 'block';
        }

        function waitForPapaParse(timeout = 1000) {
            return new Promise((resolve, reject) => {
                if (typeof Papa !== 'undefined' && typeof Papa.parse === 'function') {
                    resolve();
                    return;
                }
                setTimeout(() => {
                    if (typeof Papa !== 'undefined' && typeof Papa.parse === 'function') {
                        resolve();
                    } else {
                        reject(new Error('Papa Parse library is not available.'));
                    }
                }, 100);
            });
        }

        // =========================================================================
        //  ↓↓↓ 這裡是修改的核心 ↓↓↓
        // =========================================================================
        async function processGradeData(data, studentId, courseInfo, accessCode) {
            const config = {};
            // [修改] 讀取前 4 行作為設定 (ID, type, weight, category)
            const configRows = data.slice(0, 4); 
            const headers = Object.keys(data[0] || {});

            headers.forEach(h => { config[h] = {}; });
            configRows.forEach(row => {
                // 使用第一欄的值 ('ID', 'type', 'weight', 'category') 作為設定的鍵
                const keyName = row.ID; 
                if (keyName) {
                    headers.forEach(h => {
                        // 排除第一欄本身，只處理成績項目欄
                        if (h !== 'ID') {
                            config[h][keyName] = row[h];
                        }
                    });
                }
            });

            // [修改] 從第 5 行 (索引為 4) 開始是學生資料
            const studentRows = data.slice(4); 
            const studentData = studentRows.find(row => row.ID && row.ID.toUpperCase() === studentId);

            if (!studentData) {
                noResultsMessage.style.display = 'block';
                await showAlert(isChinese() ? '找不到該學號的資料。' : 'No data found for this Student ID.', true);
                return;
            }

            // 驗證查詢代碼
            const studentAccessCode = studentData.Code || studentData.code; // 支援大小寫不同的欄位名
            if (!studentAccessCode || studentAccessCode !== accessCode) {
                await showAlert(isChinese() 
                    ? '查詢代碼錯誤！請確認您輸入的代碼是否正確。' 
                    : 'Access code is incorrect! Please verify the code you entered.', true);
                return;
            }

            renderResults(studentData, config, courseInfo);
            resultsContainer.style.display = 'block';
        }
        // =========================================================================
        //  ↑↑↑ 這裡是修改的核心 ↑↑↑
        // =========================================================================
    
        function renderResults(student, config, courseInfo) {
            // 恢復個人成績卡片顯示（管理者模式會隱藏它）
            document.querySelector('.grade-summary-cards').style.display = 'grid';
            
            // 恢復成績明細標題
            const gradeDetailsSection = document.querySelector('.grade-details');
            const gradeDetailsTitle = gradeDetailsSection.querySelector('h3');
            if (gradeDetailsTitle) {
                gradeDetailsTitle.style.display = 'block';
            }
            
            // 恢復thead顯示
            const thead = gradeDetailsSection.querySelector('thead');
            if (thead) {
                thead.style.display = 'table-header-group';
            }
            
            // 恢復tfoot顯示
            const tfoot = gradeDetailsSection.querySelector('tfoot');
            if (tfoot) {
                tfoot.style.display = 'table-footer-group';
            }
            
            resultCourseName.innerHTML = `<span class="lang-en">${courseInfo.name.en}</span><span class="lang-zh">${courseInfo.name.zh}</span>`;
            resultCourseCode.textContent = courseInfo.code;
            resultStudentId.textContent = student.ID;
            gradeDetailsBody.innerHTML = '';
    
            const categoryTotals = { assignments: 0, dailyPerformance: 0, attendance: 0, midterm: 0, final: 0 };
            const categoryWeights = { assignments: 0, dailyPerformance: 0, attendance: 0, midterm: 0, final: 0 };
            let totalBonus = 0;
            let subtotal = 0;
    
            Object.keys(student).forEach(key => {
                // 排除 ID 欄位、沒有設定的欄位、代碼欄位
                if (key === 'ID' || key === 'Code' || key === 'code' || !config[key] || !config[key].category) return;
    
                const displayName = getDisplayName(key);
                if (!displayName) return;
                
                const score = parseFloat(student[key]) || 0;
                const weight = parseFloat(config[key].weight) || 0;
                const category = config[key].category;
                
                // 排除 code 類別的項目
                if (category === 'code') return;
                
                const weightedScore = score * weight;
                
                if (category !== 'bonus') {
                    subtotal += weightedScore;
                    if (category in categoryTotals) {
                        categoryTotals[category] += weightedScore;
                        categoryWeights[category] += weight;
                    }
                } else {
                    totalBonus += score;
                }
    
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${displayName}</td>
                    <td>${score.toFixed(1)}</td>
                    <td>${(weight * 100).toFixed(0)}%</td>
                    <td>${weightedScore.toFixed(2)}</td>
                `;
                gradeDetailsBody.appendChild(row);
            });
    
            Object.keys(summaryCards).forEach(cat => {
                if (summaryCards[cat]) {
                    if (cat === 'bonus') {
                        summaryCards[cat].textContent = totalBonus.toFixed(1);
                    } else if (categoryWeights[cat] > 0) {
                        const categoryAverage = (categoryTotals[cat] / categoryWeights[cat]);
                        summaryCards[cat].textContent = categoryAverage.toFixed(1);
                    } else {
                        summaryCards[cat].textContent = '--';
                    }
                }
            });
    
            subtotalScoreEl.textContent = subtotal.toFixed(2);
            bonusScoreEl.textContent = `+${totalBonus.toFixed(2)}`;
            const finalScore = Math.min(100, subtotal + totalBonus);
            finalTotalScoreEl.textContent = finalScore.toFixed(2);
        }
        
        function updateDynamicLanguage() {
            updateSchoolSelectLanguage();
            updateCourseSelectLanguage();
            const isZh = isChinese();
            if (studentIdInput) {
                 studentIdInput.placeholder = isZh ? studentIdInput.dataset.placeholderZh : studentIdInput.dataset.placeholderEn;
            }
            if(resultsContainer.style.display === 'block' && studentIdInput.value) {
                performSearch();
            }
        }

        // --- 事件監聽器 ---
        schoolSelect.addEventListener('change', (e) => {
            loadCoursesForSchool(e.target.value);
            hideAllResults();
        });
        
        // 學號輸入即時驗證
        studentIdInput.addEventListener('input', (e) => {
            const studentId = e.target.value.trim().toUpperCase();
            const isValid = !studentId || validateStudentId(studentId);
            
            // 添加視覺反饋
            if (studentId && !isValid) {
                studentIdInput.classList.add('invalid');
                studentIdInput.title = isChinese() ? '學號格式不正確' : 'Invalid Student ID format';
            } else {
                studentIdInput.classList.remove('invalid');
                studentIdInput.title = '';
            }
        });
        
        searchBtn.addEventListener('click', performSearch);
        studentIdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        if (langToggleBtn) {
            langToggleBtn.addEventListener('click', () => {
                document.body.classList.toggle('show-zh');
                updateDynamicLanguage();
            });
        }
    
        // --- 頁面初始化 ---
        loadCourses();
        const isZh = isChinese();
        if (studentIdInput) {
            studentIdInput.placeholder = isZh ? studentIdInput.dataset.placeholderZh : studentIdInput.dataset.placeholderEn;
        }
    })();
});