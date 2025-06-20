// =======================================================
// 第一部分：DOMContentLoaded 事件監聽器
// =======================================================
document.addEventListener('DOMContentLoaded', function () {

    // --- 1. 通用功能 ---
    (function setupCommonFeatures() {
        // Swiper 輪播圖初始化
        const swiperElement = document.querySelector('.swiper'); 
        if (swiperElement) { 
            new Swiper('.swiper', { 
                loop: true, 
                autoplay: { delay: 4000, disableOnInteraction: false }, 
                pagination: { el: '.swiper-pagination', clickable: true }, 
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, 
            }); 
        }

        // 手機版漢堡選單
        const hamburgerBtn = document.querySelector('.hamburger-btn'); 
        const navLinks = document.querySelector('.nav-links'); 
        if (hamburgerBtn && navLinks) { 
            hamburgerBtn.addEventListener('click', () => { 
                hamburgerBtn.classList.toggle('is-active'); 
                navLinks.classList.toggle('is-active'); 
            }); 
        }

        // 導航列當前頁面高亮
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

        // 導航列高亮項目滑鼠懸停效果
        const navList = document.querySelector('nav .nav-links'); 
        if(navList){ 
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

        // 頁腳年份更新
        const yearSpan = document.getElementById('current-year'); 
        if (yearSpan) { 
            yearSpan.textContent = new Date().getFullYear(); 
        }

        // 下拉選單點擊行為 (特別為手機版)
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle'); 
        dropdownToggles.forEach(toggle => { 
            toggle.addEventListener('click', (event) => { 
                event.preventDefault(); 
                if (hamburgerBtn && window.getComputedStyle(hamburgerBtn).display !== 'none') { 
                    const parentLi = toggle.closest('.nav-item-dropdown'); 
                    if (parentLi) { 
                        parentLi.classList.toggle('is-open'); 
                    } 
                } 
            }); 
        });

        // 【恢復的功能】Back to Top 按鈕功能
        const backToTopBtn = document.getElementById('back-to-top-btn'); 
        if (backToTopBtn) { 
            window.addEventListener('scroll', () => { 
                // 當滾動超過 300px 時顯示按鈕
                window.scrollY > 300 ? backToTopBtn.classList.add('is-visible') : backToTopBtn.classList.remove('is-visible'); 
            }); 
            // 點擊按鈕平滑滾動到頁面頂部
            backToTopBtn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }); 
        }
    })();

    // --- 2. 列表頁初始化相關的程式碼 (這部分不動) ---
    function initializeListPage(config) { const pageContainer = document.querySelector(config.pageSelector); if (!pageContainer) return; let allItems = [], filteredItems = [], currentPage = 1; const itemsPerPage = 10; const tableBody = document.getElementById(config.tableBodyId); const filterButtons = document.querySelectorAll(`#${config.filterBarId} button`); const searchInput = document.getElementById(config.searchInputId); const noResultsDiv = document.getElementById(config.noResultsId); const paginationContainer = document.getElementById(config.paginationContainerId); const pageInfoSpan = document.getElementById(config.pageInfoId); const pageInput = document.getElementById(config.pageInputId); const firstPageBtn = document.getElementById(config.firstPageBtnId); const prevPageBtn = document.getElementById(config.prevPageBtnId); const nextPageBtn = document.getElementById(config.nextPageBtnId); const lastPageBtn = document.getElementById(config.lastPageBtnId); async function loadData() { try { const response = await fetch(config.yamlPath); if (!response.ok) throw new Error(`YAML file not found: ${config.yamlPath}`); const yamlContent = await response.text(); allItems = window.jsyaml.load(yamlContent) || []; updateDisplay(); } catch (error) { console.error(`Failed to load or parse data for ${config.pageSelector}:`, error); if (tableBody) tableBody.innerHTML = `<tr><td style="text-align:center; color: #ff4d4d;">Error loading data. Please check the console.</td></tr>`; } } function renderPage(itemsToShow) { if (!tableBody) return; const children = Array.from(tableBody.children); if (children.length > 0) { children.forEach(row => row.classList.add('item-exit')); setTimeout(() => populateTable(itemsToShow), 300); } else { populateTable(itemsToShow); } } function populateTable(itemsToShow) { tableBody.innerHTML = ''; itemsToShow.forEach((item, index) => { const globalIndex = (currentPage - 1) * itemsPerPage + index + 1; const row = config.renderRowFunction(item, globalIndex); row.classList.add('item-enter'); row.style.animationDelay = `${index * 0.05}s`; tableBody.appendChild(row); }); } function setupPagination() { if (!paginationContainer) return; const totalItems = filteredItems.length; const totalPages = Math.ceil(totalItems / itemsPerPage); if (totalPages <= 1) { paginationContainer.style.display = 'none'; return; } paginationContainer.style.display = 'flex'; if (pageInfoSpan) pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`; if (pageInput) { pageInput.value = currentPage; pageInput.max = totalPages; } if (firstPageBtn) firstPageBtn.disabled = currentPage === 1; if (prevPageBtn) prevPageBtn.disabled = currentPage === 1; if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages; if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages; } function displayPage(page) { currentPage = page; const start = (currentPage - 1) * itemsPerPage; const end = start + itemsPerPage; const paginatedItems = filteredItems.slice(start, end); renderPage(paginatedItems); setupPagination(); } function updateDisplay() { const activeFilterButton = document.querySelector(`#${config.filterBarId} button.active`); const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : ""; let tempFiltered = allItems; if (activeFilterButton) { const activeFilter = activeFilterButton.dataset.filter; if (activeFilter !== 'all') { tempFiltered = tempFiltered.filter(item => item.category === activeFilter); } } if (searchTerm) { tempFiltered = tempFiltered.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(searchTerm))); } filteredItems = tempFiltered; if (noResultsDiv) noResultsDiv.style.display = filteredItems.length === 0 ? 'block' : 'none'; if (tableBody) tableBody.innerHTML = filteredItems.length === 0 ? '' : tableBody.innerHTML; if (paginationContainer) paginationContainer.style.display = filteredItems.length === 0 ? 'none' : 'flex'; if (filteredItems.length > 0) { displayPage(1); } } if (filterButtons.length > 0) { filterButtons.forEach(button => { button.addEventListener('click', () => { filterButtons.forEach(btn => btn.classList.remove('active')); button.classList.add('active'); updateDisplay(); }); }); } if (searchInput) searchInput.addEventListener('input', updateDisplay); if (firstPageBtn) firstPageBtn.addEventListener('click', () => displayPage(1)); if (prevPageBtn) prevPageBtn.addEventListener('click', () => { if (currentPage > 1) displayPage(currentPage - 1); }); if (nextPageBtn) nextPageBtn.addEventListener('click', () => { const totalPages = Math.ceil(filteredItems.length / itemsPerPage); if (currentPage < totalPages) displayPage(currentPage + 1); }); if (lastPageBtn) lastPageBtn.addEventListener('click', () => { const totalPages = Math.ceil(filteredItems.length / itemsPerPage); displayPage(totalPages); }); if (pageInput) pageInput.addEventListener('change', () => { const totalPages = Math.ceil(filteredItems.length / itemsPerPage); let page = parseInt(pageInput.value, 10); if (isNaN(page) || page < 1) page = 1; if (page > totalPages) page = totalPages; displayPage(page); }); loadData(); }
    function renderPublicationRow(pub, globalIndex) { let linksHTML = ''; if (pub.links && typeof pub.links === 'object') { const validLinks = Object.entries(pub.links).filter(([_, url]) => url && String(url).trim() !== ''); if (validLinks.length > 0) { linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`; } } const row = document.createElement('tr'); row.innerHTML = `<td data-label="#">${globalIndex}.</td><td data-label="Title">${pub.title || ''}</td><td data-label="Authors">${pub.authors || ''}</td><td data-label="Venue">${pub.venue || ''}</td><td data-label="Date">${pub.date || 'TBA'}</td><td data-label="Author Role">${pub.authorrole || ''}</td>${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}`; return row; }
    function renderHonorRow(honor, globalIndex) { let linksHTML = ''; if (honor.links && typeof honor.links === 'object') { const validLinks = Object.entries(honor.links).filter(([_, url]) => url && String(url).trim() !== ''); if (validLinks.length > 0) { linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`; } } const row = document.createElement('tr'); row.innerHTML = `<td data-label="#">${globalIndex}.</td><td data-label="Title">${honor.title || ''}</td><td data-label="Event">${honor.event || ''}</td><td data-label="Organizer">${honor.organizer || ''}</td>${honor.award ? `<td data-label="Award">${honor.award}</td>` : ''}${honor.bonus ? `<td data-label="Bonus">${honor.bonus}</td>` : ''}${honor.members ? `<td data-label="Members">${honor.members}</td>` : ''}${honor.supervisor ? `<td data-label="Supervisor">${honor.supervisor}</td>` : ''}<td data-label="Date">${honor.date || 'TBA'}</td>${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}`; return row; }
    function renderHighlightRow(highlight, globalIndex) { const location = highlight.localtion || highlight.location || ''; let linksHTML = ''; if (highlight.links && typeof highlight.links === 'object') { const validLinks = Object.entries(highlight.links).filter(([_, url]) => url && String(url).trim() !== ''); if (validLinks.length > 0) { linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`; } } const row = document.createElement('tr'); row.innerHTML = `<td data-label="#">${globalIndex}.</td><td data-label="Title">${highlight.title || 'No Title'}</td>${highlight.position ? `<td data-label="Position">${highlight.position}</td>` : ''}${location ? `<td data-label="Location">${location}</td>` : ''}${highlight.organizer ? `<td data-label="Organizer">${highlight.organizer}</td>` : ''}<td data-label="Date">${highlight.date || 'TBA'}</td>${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}`; return row; }
    initializeListPage({ pageSelector: '.publication-page', yamlPath: './publications.yaml', tableBodyId: 'publication-table-body', filterBarId: 'publication-filter', searchInputId: 'publication-search', noResultsId: 'no-results', paginationContainerId: 'pagination-container', pageInfoId: 'page-info', pageInputId: 'page-input', firstPageBtnId: 'first-page', prevPageBtnId: 'prev-page', nextPageBtnId: 'next-page', lastPageBtnId: 'last-page', renderRowFunction: renderPublicationRow });
    initializeListPage({ pageSelector: '.honor-page', yamlPath: './honors.yaml', tableBodyId: 'honor-table-body', filterBarId: 'honor-filter', searchInputId: 'honor-search', noResultsId: 'no-results-honor', paginationContainerId: 'pagination-container-honor', pageInfoId: 'page-info-honor', pageInputId: 'page-input-honor', firstPageBtnId: 'first-page-honor', prevPageBtnId: 'prev-page-honor', nextPageBtnId: 'next-page-honor', lastPageBtnId: 'last-page-honor', renderRowFunction: renderHonorRow });
    initializeListPage({ pageSelector: '.highlight-page', yamlPath: './highlights.yaml', tableBodyId: 'highlight-table-body', filterBarId: 'highlight-filter', searchInputId: 'highlight-search', noResultsId: 'no-results-highlight', paginationContainerId: 'pagination-container-highlight', pageInfoId: 'page-info-highlight', pageInputId: 'page-input-highlight', firstPageBtnId: 'first-page-highlight', prevPageBtnId: 'prev-page-highlight', nextPageBtnId: 'next-page-highlight', lastPageBtnId: 'last-page-highlight', renderRowFunction: renderHighlightRow });

});

// =======================================================
// Pagefind 初始化函式 (獨立在全域)
// =======================================================
function initPagefind() {
    if (window.PagefindUI) {
        try {
            new PagefindUI({ 
                element: "body",
                showSubResults: true,
                trigger: "#search-btn-desktop, #search-btn-mobile"
            });
            console.log("Pagefind UI initialized and listeners attached.");
        } catch (e) {
            console.error("Failed to initialize Pagefind UI:", e);
        }
    } else {
        console.error("PagefindUI is not available. Check if pagefind-ui.js is loaded correctly.");
    }
}