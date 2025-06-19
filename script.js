// script.js (完整修正版)

document.addEventListener('DOMContentLoaded', function () {

    // --- 1. 通用功能 (Navbar, Search, Footer Year, etc.) ---
    // (這部分程式碼與您原本的相同，保持不變)
    const swiperElement = document.querySelector('.swiper');
    if (swiperElement) { new Swiper('.swiper', { loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, }); }
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navLinks = document.querySelector('.nav-links');
    if(hamburgerBtn) { hamburgerBtn.addEventListener('click', () => { hamburgerBtn.classList.toggle('is-active'); navLinks.classList.toggle('is-active'); }); }
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLi = document.querySelectorAll('nav .nav-links li:not(.search-item)');
    navLi.forEach(li => { const link = li.querySelector('a'); if (link) { const linkPath = link.getAttribute('href').split('/').pop(); if (currentPath === linkPath) { li.classList.add('active-link'); } if (li.classList.contains('nav-item-dropdown')) { const subLinks = li.querySelectorAll('.dropdown-menu a'); subLinks.forEach(subLink => { if (currentPath === subLink.getAttribute('href').split('/').pop()) { li.classList.add('active-link'); } }); } } });
    const navList = document.querySelector('nav .nav-links');
    if(navList){ navList.addEventListener('mouseover', (e) => { const activeLi = document.querySelector('.nav-links li.active-link'); if (activeLi) { let targetLi = e.target.closest('li'); if (activeLi !== targetLi) { activeLi.classList.add('temporarily-hidden'); } } }); navList.addEventListener('mouseout', () => { const activeLi = document.querySelector('.nav-links li.active-link.temporarily-hidden'); if (activeLi) { activeLi.classList.remove('temporarily-hidden'); } });}
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    if(searchBtn && searchOverlay){ const closeBtn = searchOverlay.querySelector('.close-btn'); const searchForm = document.getElementById('search-form'); const searchInput = document.getElementById('search-input'); searchBtn.addEventListener('click', (e) => { e.preventDefault(); searchOverlay.classList.add('is-visible'); searchInput.focus(); }); const closeSearch = () => { searchOverlay.classList.remove('is-visible'); }; closeBtn.addEventListener('click', closeSearch); searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) { closeSearch(); } }); document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && searchOverlay.classList.contains('is-visible')) { closeSearch(); } }); searchForm.addEventListener('submit', (e) => { e.preventDefault(); const query = searchInput.value.trim(); if (query) { alert(`您搜尋了: ${query}`); closeSearch(); searchInput.value = ''; } });}
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            const isMobileView = window.getComputedStyle(hamburgerBtn).display !== 'none';
            if (isMobileView) {
                const parentLi = toggle.closest('.nav-item-dropdown');
                if (parentLi) {
                    parentLi.classList.toggle('is-open');
                }
            }
        });
    });
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => { window.scrollY > 300 ? backToTopBtn.classList.add('is-visible') : backToTopBtn.classList.remove('is-visible'); });
        backToTopBtn.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }

    // --- 2. 可複用的列表頁面初始化函式 ---
    function initializeListPage(config) {
        const pageContainer = document.querySelector(config.pageSelector);
        if (!pageContainer) return;

        let allItems = [];
        let filteredItems = [];
        let currentPage = 1;
        const itemsPerPage = 10;

        const tableBody = document.getElementById(config.tableBodyId);
        const filterButtons = document.querySelectorAll(`#${config.filterBarId} button`);
        const searchInput = document.getElementById(config.searchInputId);
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
                if (!response.ok) throw new Error(`Cannot find ${config.yamlPath}`);
                const yamlContent = await response.text();
                allItems = window.jsyaml.load(yamlContent) || [];
                updateDisplay();
            } catch (error) {
                console.error(`Failed to load data for ${config.pageSelector}:`, error);
                if (tableBody) {
                    tableBody.innerHTML = `<tr><td style="text-align:center; color: #ff4d4d;">Error loading data. Please check the console.</td></tr>`;
                }
            }
        }

        function renderPage(itemsToShow) {
            const children = Array.from(tableBody.children);
            if (children.length > 0) {
                children.forEach(row => row.classList.add('item-exit'));
                setTimeout(() => populateTable(itemsToShow), 300);
            } else {
                populateTable(itemsToShow);
            }
        }

        function populateTable(itemsToShow) {
            tableBody.innerHTML = '';
            itemsToShow.forEach((item, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                const row = config.renderRowFunction(item, globalIndex);
                row.classList.add('item-enter');
                row.style.animationDelay = `${index * 0.05}s`;
                tableBody.appendChild(row);
            });
        }

        function setupPagination() {
            if (!paginationContainer) return; // Add safety check
            const totalItems = filteredItems.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            if (totalPages <= 1) {
                paginationContainer.style.display = 'none';
                return;
            }
            paginationContainer.style.display = 'flex';
            pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
            pageInput.value = currentPage;
            pageInput.max = totalPages;
            firstPageBtn.disabled = currentPage === 1;
            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages;
            lastPageBtn.disabled = currentPage === totalPages;
        }

        function displayPage(page) {
            currentPage = page;
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedItems = filteredItems.slice(start, end);
            renderPage(paginatedItems);
            setupPagination();
        }

        function updateDisplay() {
            const activeFilterButton = document.querySelector(`#${config.filterBarId} button.active`);
            if (!activeFilterButton) return; // Add safety check
            
            const activeFilter = activeFilterButton.dataset.filter;
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            let tempFiltered = allItems;
            if (activeFilter !== 'all') {
                tempFiltered = tempFiltered.filter(item => item.category === activeFilter);
            }
            if (searchTerm) {
                tempFiltered = tempFiltered.filter(item =>
                    Object.values(item).some(value =>
                        String(value).toLowerCase().includes(searchTerm)
                    )
                );
            }
            filteredItems = tempFiltered;

            if (filteredItems.length === 0) {
                noResultsDiv.style.display = 'block';
                tableBody.innerHTML = '';
                if (paginationContainer) paginationContainer.style.display = 'none';
            } else {
                noResultsDiv.style.display = 'none';
                displayPage(1);
            }
        }

        if (filterButtons.length > 0) {
            filterButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    button.classList.add('active');
                    updateDisplay();
                });
            });
        }
        if (searchInput) searchInput.addEventListener('input', updateDisplay);
        if (firstPageBtn) firstPageBtn.addEventListener('click', () => displayPage(1));
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => { if (currentPage > 1) displayPage(currentPage - 1); });
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            if (currentPage < totalPages) displayPage(currentPage + 1);
        });
        if (lastPageBtn) lastPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            displayPage(totalPages);
        });
        if (pageInput) pageInput.addEventListener('change', () => {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
            let page = parseInt(pageInput.value, 10);
            if (isNaN(page) || page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            displayPage(page);
        });

        loadData();
    }
    
    // --- 3. 用於生成不同頁面內容的函式 ---
    
    function renderPublicationRow(pub, globalIndex) {
        let linksHTML = '';
        if (pub.links && typeof pub.links === 'object') {
            const validLinks = Object.entries(pub.links).filter(([name, url]) => url && url.trim() !== '');
            if (validLinks.length > 0) {
                linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
            }
        }
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="#">${globalIndex}.</td>
            <td data-label="Title">${pub.title}</td>
            <td data-label="Authors">${pub.authors}</td>
            <td data-label="Venue">${pub.venue}</td>
            <td data-label="Date">${pub.date || 'TBA'}</td>
            <td data-label="Author Role">${pub.authorrole}</td>
            ${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}
        `;
        return row;
    }

    function renderHonorRow(honor, globalIndex) {
        let linksHTML = '';
        if (honor.links && typeof honor.links === 'object') {
            const validLinks = Object.entries(honor.links).filter(([name, url]) => url && url.trim() !== '');
            if (validLinks.length > 0) {
                linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
            }
        }
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="#">${globalIndex}.</td>
            <td data-label="Title">${honor.title}</td>
            <td data-label="Event">${honor.event}</td>
            <td data-label="Organizer">${honor.organizer}</td>
            ${honor.award ? `<td data-label="Award">${honor.award}</td>` : ''}
            ${honor.bonus ? `<td data-label="Bonus">${honor.bonus}</td>` : ''}
            ${honor.members ? `<td data-label="Members">${honor.members}</td>` : ''}
            ${honor.supervisor ? `<td data-label="Supervisor">${honor.supervisor}</td>` : ''}
            <td data-label="Date">${honor.date || 'TBA'}</td>
            ${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}
        `;
        return row;
    }

    // [修正] 專為 Highlight 設計的 render 函式
    function renderHighlightRow(highlight, globalIndex) {
        // 處理 YAML 中的拼寫錯誤 `localtion`，使其更健壯
        const location = highlight.localtion || highlight.location || '';
        
        // 處理 YAML 中單一的 `link` 字串
        let linkHTML = '';
        if (highlight.link && String(highlight.link).trim() !== '') {
            linkHTML = `<div class="action-buttons">
                            <a href="${highlight.link}" target="_blank" rel="noopener noreferrer" class="action-btn">查看連結</a>
                        </div>`;
        }

        const row = document.createElement('tr');
        // [修正] 內部所有變數都使用 `highlight`，並且只顯示有值的欄位
        row.innerHTML = `
            <td data-label="#">${globalIndex}.</td>
            <td data-label="Title">${highlight.title || 'No Title'}</td>
            ${highlight.position ? `<td data-label="Position">${highlight.position}</td>` : ''}
            ${location ? `<td data-label="Location">${location}</td>` : ''}
            ${highlight.organizer ? `<td data-label="Organizer">${highlight.organizer}</td>` : ''}
            <td data-label="Date">${highlight.date || 'TBA'}</td>
            ${linkHTML ? `<td data-label="Links">${linkHTML}</td>` : ''}
        `;
        return row;
    }

    // --- 4. 根據目前頁面，執行對應的初始化設定 ---
    
    initializeListPage({
        pageSelector: '.publication-page',
        yamlPath: './publications.yaml',
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
        yamlPath: './honors.yaml',
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

    // [新增] 啟動 Highlight 頁面的功能
    initializeListPage({
        pageSelector: '.highlight-page',
        yamlPath: './highlights.yaml', // 確保這個檔案存在
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
        renderRowFunction: renderHighlightRow // 使用修正後的函式
    });
});