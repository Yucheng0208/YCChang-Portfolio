document.addEventListener('DOMContentLoaded', function () {

    // --- 1. Swiper 輪播圖初始化 (只在首頁執行) ---
    const swiperElement = document.querySelector('.swiper');
    if (swiperElement) {
        new Swiper('.swiper', {
            loop: true,
            autoplay: { delay: 4000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });
    }

    // --- 2. 漢堡選單功能 ---
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navLinks = document.querySelector('.nav-links');
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('is-active');
        navLinks.classList.toggle('is-active');
    });

    // --- 3. 根據 URL 設定 Navbar 的 active 狀態 ---
    const currentPath = window.location.pathname.split('/').pop();
    const navLi = document.querySelectorAll('nav .nav-links li:not(.search-item)'); // 排除搜尋項目
    navLi.forEach(li => {
        const link = li.querySelector('a');
        if (link) {
            const linkPath = link.getAttribute('href').split('/').pop();
            if ((currentPath === 'index.html' || currentPath === '') && linkPath === 'index.html') {
                li.classList.add('active-link');
            } else if (currentPath === linkPath && currentPath !== 'index.html' && currentPath !== '') {
                li.classList.add('active-link');
            }
        }
    });

    // --- 4. Navbar 懸停效果處理 ---
    const navList = document.querySelector('nav .nav-links');
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

    // --- 5. 搜尋功能 ---
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const closeBtn = searchOverlay.querySelector('.close-btn');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    // 打開搜尋浮層
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchOverlay.classList.add('is-visible');
        searchInput.focus();
    });

    // 關閉搜尋浮層
    const closeSearch = () => {
        searchOverlay.classList.remove('is-visible');
    };
    closeBtn.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) {
            closeSearch();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('is-visible')) {
            closeSearch();
        }
    });

    // 處理搜尋提交
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            // 您可以在這裡替換成真正的搜尋邏輯
            // 例如，跳轉到 Google 全站搜尋：
            // window.location.href = `https://www.google.com/search?q=site:your-domain.com ${query}`;
            
            alert(`您搜尋了: ${query}`);
            
            closeSearch();
            searchInput.value = '';
        }
    });
});