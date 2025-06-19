document.addEventListener('DOMContentLoaded', function () {

    // --- Navbar, Search, Footer Year, etc. (No changes needed) ---
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
    
    // ===== JS 修改：更新下拉選單的處理邏輯 =====
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (event) => {
            // 阻止連結的默認跳轉行為
            event.preventDefault();
            
            // 檢查是否處於手機模式 (判斷漢堡按鈕是否可見)
            const isMobileView = window.getComputedStyle(hamburgerBtn).display !== 'none';
            
            if (isMobileView) {
                // 在手機模式下，點擊會開/關子選單
                const parentLi = toggle.closest('.nav-item-dropdown');
                if (parentLi) {
                    parentLi.classList.toggle('is-open');
                }
            }
            // 在桌面模式下，此點擊事件不做任何事，保留 CSS hover 效果
        });
    });

    // --- Publication Page Logic ---
    const publicationPage = document.querySelector('.publication-page');
    if (publicationPage) {
        
        let allPublications = [];
        let filteredPublications = [];
        let currentPage = 1;
        const itemsPerPage = 10;

        const tableBody = document.getElementById('publication-table-body');
        const filterButtons = document.querySelectorAll('#publication-filter button');
        const searchInput = document.getElementById('publication-search');
        const noResultsDiv = document.getElementById('no-results');
        const paginationContainer = document.getElementById('pagination-container');
        const pageInfoSpan = document.getElementById('page-info');
        const pageInput = document.getElementById('page-input');
        const firstPageBtn = document.getElementById('first-page');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        const lastPageBtn = document.getElementById('last-page');

        async function loadPublications() {
            try {
                const response = await fetch('./publications.yaml');
                if (!response.ok) throw new Error('Cannot find publications.yaml');
                const yamlContent = await response.text();
                allPublications = window.jsyaml.load(yamlContent) || [];
                updateDisplay();
            } catch (error) {
                console.error("Failed to load publications:", error);
                tableBody.innerHTML = `<tr><td style="text-align:center; color: #ff4d4d;">Error loading data.</td></tr>`;
            }
        }
        
        function renderPage(publicationsToShow) {
            const children = Array.from(tableBody.children);
            if (children.length > 0) {
                children.forEach(row => row.classList.add('item-exit'));
                setTimeout(() => {
                    populateTable(publicationsToShow);
                }, 300); // Wait for exit animation
            } else {
                populateTable(publicationsToShow);
            }
        }

        function populateTable(publicationsToShow) {
            tableBody.innerHTML = '';
            publicationsToShow.forEach((pub, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1 + '.'; // +1 for 1-based index
                
                // --- 【核心修改】更嚴謹的連結判斷邏輯 ---
                let linksHTML = ''; // 預設為空
                // 1. 檢查 pub.links 是否存在且為一個物件
                if (pub.links && typeof pub.links === 'object') {
                    // 2. 過濾出所有「網址不為空」的連結
                    const validLinks = Object.entries(pub.links).filter(([name, url]) => url && url.trim() !== '');

                    // 3. 只有在存在至少一個有效連結時，才生成 HTML
                    if (validLinks.length > 0) {
                        linksHTML = `<div class="action-buttons">
                            ${validLinks.map(([name, url]) => 
                                `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name.charAt(0).toUpperCase() + name.slice(1)}</a>`
                            ).join('')}
                        </div>`;
                    }
                }
                // --- 修改結束 ---

                const row = document.createElement('tr');
                row.classList.add('item-enter');
                row.style.animationDelay = `${index * 0.05}s`;
                row.innerHTML = `
                    <td data-label="#">${globalIndex}</td>
                    <td data-label="Title">${pub.title}</td>
                    <td data-label="Authors">${pub.authors}</td>
                    <td data-label="Venue">${pub.venue}</td>
                    <td data-label="Date">${pub.date || 'N/A'}</td>
                    <td data-label="Author Role">${pub.authorrole || 'N/A'}</td>
                    ${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}
                `;
                tableBody.appendChild(row);
            });
        }

        function setupPagination() {
            const totalItems = filteredPublications.length;
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
            const paginatedItems = filteredPublications.slice(start, end);
            
            renderPage(paginatedItems);
            setupPagination();
        }

        function updateDisplay() {
            const activeFilter = document.querySelector('#publication-filter button.active').dataset.filter;
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            let tempFiltered = allPublications;
            if (activeFilter !== 'all') {
                tempFiltered = tempFiltered.filter(pub => pub.category === activeFilter);
            }
            if (searchTerm) {
                tempFiltered = tempFiltered.filter(pub => 
                    Object.values(pub).some(value => 
                        String(value).toLowerCase().includes(searchTerm)
                    )
                );
            }
            filteredPublications = tempFiltered;

            if (filteredPublications.length === 0) {
                noResultsDiv.style.display = 'block';
                tableBody.innerHTML = '';
                paginationContainer.style.display = 'none';
            } else {
                noResultsDiv.style.display = 'none';
                displayPage(1);
            }
        }

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateDisplay();
            });
        });
        searchInput.addEventListener('input', updateDisplay);

        firstPageBtn.addEventListener('click', () => displayPage(1));
        prevPageBtn.addEventListener('click', () => { if(currentPage > 1) displayPage(currentPage - 1); });
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
            if(currentPage < totalPages) displayPage(currentPage + 1);
        });
        lastPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
            displayPage(totalPages);
        });
        pageInput.addEventListener('change', () => {
            const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
            let page = parseInt(pageInput.value, 10);
            if (isNaN(page) || page < 1) page = 1;
            if (page > totalPages) page = totalPages;
            displayPage(page);
        });

        loadPublications();
    }
        
    // --- Back to Top Button Logic ---
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('is-visible');
            } else {
                backToTopBtn.classList.remove('is-visible');
            }
        });
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});