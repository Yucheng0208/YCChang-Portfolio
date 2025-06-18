document.addEventListener('DOMContentLoaded', function () {

    // --- 1. Swiper 輪播圖初始化 ---
    const swiper = new Swiper('.swiper', {
        loop: true, // 循環播放
        autoplay: {
            delay: 4000, // 4 秒切換一次
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // --- 2. 漢堡選單功能 ---
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const navLinks = document.querySelector('.nav-links');

    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('is-active');
        navLinks.classList.toggle('is-active');
    });

    // --- 3. 滾動偵測 & Navbar 狀態更新 ---
    const sections = document.querySelectorAll('main section');
    const navLi = document.querySelectorAll('nav .nav-links li');
    const navList = document.querySelector('nav .nav-links');

    // 創建 IntersectionObserver
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 當 section 進入視窗
                const id = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`nav a[href="#${id}"]`);
                
                // 移除所有 li 的 active 狀態
                navLi.forEach(li => li.classList.remove('active-link'));
                
                // 為對應的 li 添加 active 狀態
                if (activeLink) {
                    activeLink.parentElement.classList.add('active-link');
                }
            }
        });
    }, { 
        rootMargin: '-50% 0px -50% 0px' // 當 section 位於視窗中央時觸發
    });

    // 讓 observer 觀察所有 section
    sections.forEach(section => {
        observer.observe(section);
    });

    // --- 4. 處理滑鼠懸停時，暫時隱藏 active-link 樣式 ---
    navList.addEventListener('mouseover', (e) => {
        // 檢查是否懸停在 li 或 a 元素上
        if (e.target.tagName === 'A' || e.target.tagName === 'LI') {
            const activeLi = document.querySelector('.nav-links li.active-link');
            if (activeLi) {
                // 如果懸停的目標不是當前 active 的 li，就暫時隱藏它
                let targetLi = e.target;
                if(targetLi.tagName === 'A') targetLi = targetLi.parentElement;
                
                if(activeLi !== targetLi){
                   activeLi.classList.add('temporarily-hidden');
                }
            }
        }
    });

    navList.addEventListener('mouseout', () => {
        // 滑鼠離開整個 ul 列表時，恢復 active-link 的樣式
        const activeLi = document.querySelector('.nav-links li.active-link.temporarily-hidden');
        if (activeLi) {
            activeLi.classList.remove('temporarily-hidden');
        }
    });

});