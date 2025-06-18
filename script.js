document.addEventListener('DOMContentLoaded', function () {

    // --- 1-7. (所有其他功能保持不變) ---
    const swiperElement = document.querySelector('.swiper');
    if (swiperElement) { new Swiper('.swiper', { loop: true, autoplay: { delay: 4000, disableOnInteraction: false }, pagination: { el: '.swiper-pagination', clickable: true }, navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' }, }); }
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navLinks = document.querySelector('.nav-links');
    hamburgerBtn.addEventListener('click', () => { hamburgerBtn.classList.toggle('is-active'); navLinks.classList.toggle('is-active'); });
    const currentPath = window.location.pathname.split('/').pop();
    const navLi = document.querySelectorAll('nav .nav-links li:not(.search-item)');
    navLi.forEach(li => { const link = li.querySelector('a'); if (link) { const linkPath = link.getAttribute('href').split('/').pop(); if ((currentPath === 'index.html' || currentPath === '') && linkPath === 'index.html') { li.classList.add('active-link'); } else if (currentPath === linkPath && currentPath !== 'index.html' && currentPath !== '') { li.classList.add('active-link'); } if (li.classList.contains('nav-item-dropdown')) { const subLinks = li.querySelectorAll('.dropdown-menu a'); subLinks.forEach(subLink => { const subLinkPath = subLink.getAttribute('href').split('/').pop(); if (currentPath === subLinkPath) { li.classList.add('active-link'); } }); } } });
    const navList = document.querySelector('nav .nav-links');
    navList.addEventListener('mouseover', (e) => { const activeLi = document.querySelector('.nav-links li.active-link'); if (activeLi) { let targetLi = e.target.closest('li'); if (activeLi !== targetLi) { activeLi.classList.add('temporarily-hidden'); } } });
    navList.addEventListener('mouseout', () => { const activeLi = document.querySelector('.nav-links li.active-link.temporarily-hidden'); if (activeLi) { activeLi.classList.remove('temporarily-hidden'); } });
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const closeBtn = searchOverlay.querySelector('.close-btn');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    searchBtn.addEventListener('click', (e) => { e.preventDefault(); searchOverlay.classList.add('is-visible'); searchInput.focus(); });
    const closeSearch = () => { searchOverlay.classList.remove('is-visible'); };
    closeBtn.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) { closeSearch(); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && searchOverlay.classList.contains('is-visible')) { closeSearch(); } });
    searchForm.addEventListener('submit', (e) => { e.preventDefault(); const query = searchInput.value.trim(); if (query) { alert(`您搜尋了: ${query}`); closeSearch(); searchInput.value = ''; } });
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) { const currentYear = new Date().getFullYear(); yearSpan.textContent = currentYear; }
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => { toggle.addEventListener('click', (event) => { event.preventDefault(); }); });

    // --- 8. Publication Page Logic (YAML-based) ---
    const publicationPage = document.querySelector('.publication-page');
    if (publicationPage) {
        
        let allPublications = [];
        const tableBody = document.getElementById('publication-table-body');
        const filterButtons = document.querySelectorAll('#publication-filter button');
        const searchInput = document.getElementById('publication-search');
        const noResultsDiv = document.getElementById('no-results');

        // 主函數：加載並處理單一 YAML 檔案
        async function loadPublications() {
            try {
                // 1. 獲取 publications.yaml 檔案
                const response = await fetch('./publications.yaml');
                if (!response.ok) throw new Error('Cannot find publications.yaml');
                const yamlContent = await response.text();

                // 2. 使用 js-yaml 解析檔案內容
                // window.jsyaml 是由我們引入的 js-yaml 函式庫提供的
                allPublications = window.jsyaml.load(yamlContent);
                
                if (!Array.isArray(allPublications)) {
                    throw new Error('YAML file is not a valid list.');
                }
                
                // 3. 初始渲染
                updateDisplay();

            } catch (error) {
                console.error("Failed to load publications:", error);
                tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #ff4d4d;">Error loading publication data. Please check the console.</td></tr>`;
            }
        }
        
        // 渲染表格的函數 (無需修改)
        function renderTable(publications) {
            tableBody.innerHTML = '';
            if (publications.length === 0) { noResultsDiv.style.display = 'block'; tableBody.parentElement.style.display = 'none'; return; }
            noResultsDiv.style.display = 'none';
            tableBody.parentElement.style.display = '';

            publications.forEach((pub, index) => {
                const linksHTML = `<div class="action-buttons">
                    ${pub.links.scholar ? `<a href="${pub.links.scholar}" target="_blank" rel="noopener noreferrer" class="action-btn">Google Scholar</a>` : ''}
                    ${pub.links.researchgate ? `<a href="${pub.links.researchgate}" target="_blank" rel="noopener noreferrer" class="action-btn">ResearchGate</a>` : ''}
                    ${pub.links.ieee ? `<a href="${pub.links.ieee}" target="_blank" rel="noopener noreferrer" class="action-btn">IEEE Explore</a>` : ''}
                    ${pub.links.pdf ? `<a href="${pub.links.pdf}" target="_blank" rel="noopener noreferrer" class="action-btn">PDF</a>` : ''}
                    ${pub.links.other ? `<a href="${pub.links.other}" target="_blank" rel="noopener noreferrer" class="action-btn">Other</a>` : ''}
                </div>`;
                const row = document.createElement('tr');
                row.innerHTML = `<td data-label="#">${index + 1}</td><td data-label="Title">${pub.title}</td><td data-label="Authors">${pub.authors}</td><td data-label="Venue">${pub.venue}</td><td data-label="Date">${pub.date}</td><td data-label="Links">${linksHTML}</td>`;
                tableBody.appendChild(row);
            });
        }

        // 更新顯示的函數 (無需修改)
        function updateDisplay() {
            const activeFilter = document.querySelector('#publication-filter button.active').dataset.filter;
            const searchTerm = searchInput.value.toLowerCase().trim();
            let filteredPublications = allPublications;
            if (activeFilter !== 'all') { filteredPublications = filteredPublications.filter(pub => pub.category === activeFilter); }
            if (searchTerm) { filteredPublications = filteredPublications.filter(pub => pub.title.toLowerCase().includes(searchTerm) || pub.authors.toLowerCase().includes(searchTerm) || pub.venue.toLowerCase().includes(searchTerm)); }
            renderTable(filteredPublications);
        }

        // 添加事件監聽 (無需修改)
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                updateDisplay();
            });
        });
        searchInput.addEventListener('input', updateDisplay);

        // 啟動加載過程
        loadPublications();
    }
        
    // --- 9. Back to Top Button Logic ---
    const backToTopBtn = document.getElementById('back-to-top-btn');

    if (backToTopBtn) {
        // 監聽頁面滾動
        window.addEventListener('scroll', () => {
            // 如果滾動距離超過 300px，就顯示按鈕
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('is-visible');
            } else {
                backToTopBtn.classList.remove('is-visible');
            }
        });

        // 監聽按鈕點擊
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault(); // 阻止 a 標籤的預設跳轉行為
            // 平滑滾動到頁面頂部
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});