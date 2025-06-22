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
// 第一部分：DOMContentLoaded 事件監聽器
// =======================================================
document.addEventListener('DOMContentLoaded', function() {

    // --- 1. 通用功能 ---
    (function setupCommonFeatures() {
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
    })();

    // --- 2. 列表頁初始化 ---
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
                    if (newFilter === 'all' || newFilter === 'Certification' || newFilter === 'academic' || newFilter === 'industry') { // 【修改】為Works頁面增加無動畫的條件
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

    // --- 4. 初始化所有列表頁 ---
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
    initializeListPage({
        pageSelector: '.highlight-page',
        yamlPath: './highlights.yaml',
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
        yamlPath: './projects.yaml',
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
        yamlPath: './works.yaml',
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
        // 在這裡編輯要顯示的 YouTube 影片 ID 列表
        const videoIds = ["4RvHph2q0Hc", "4RvHph2q0Hc", "4RvHph2q0Hc"];
        
        let currentIndex = 0;
        const container = document.querySelector('.video-window-glw0pyx-wrapper');
        
        // 如果此頁面沒有影音區塊，或沒有提供影片ID，則不執行任何操作
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
                    // 手機版只顯示中間的影片
                    slots.center.src = `https://www.youtube.com/embed/${videoIds[index]}`;
                } else {
                    // 桌面版邏輯
                    if (n < 3) {
                        // 如果影片總數少於3個，只顯示中間的，並隱藏旁邊的
                        slots.center.src = `https://www.youtube.com/embed/${videoIds[index]}`;
                        container.querySelector('.slot-left').style.display = 'none';
                        container.querySelector('.slot-right').style.display = 'none';
                        prevBtn.style.display = 'none';
                        nextBtn.style.display = 'none';
                    } else {
                        // 正常顯示三個影片，實現循環播放
                        slots.left.src = `https://www.youtube.com/embed/${videoIds[index]}`;
                        slots.center.src = `https://www.youtube.com/embed/${videoIds[(index + 1) % n]}`;
                        slots.right.src = `https://www.youtube.com/embed/${videoIds[(index + 2) % n]}`;
                    }
                }
                displayArea.style.opacity = 1;
            }, 300); // 等待淡出動畫完成
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
            // 初始渲染
            render(currentIndex);
        }
    })();
    
});

// --- Skills Section Progress Bar Animation (with text sync) ---
document.addEventListener("DOMContentLoaded", function() {
  
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
          // 1. 從 data-width 屬性讀取目標值
          const targetWidth = bar.dataset.width;
          
          // 2. 將目標值設定給進度條的寬度，觸發動畫
          bar.style.width = targetWidth;

          // 3. (新增功能) 找到對應的文字標籤並填入數值
          //    - .closest('.skill-item') 找到最近的父層 skill-item 容器
          //    - .querySelector('.text-muted') 在該容器中找到要填寫的 span
          const skillItem = bar.closest('.skill-item');
          if (skillItem) {
            const textSpan = skillItem.querySelector('.text-muted');
            if (textSpan) {
              // 將目標值寫入文字標籤
              textSpan.textContent = targetWidth;
            }
          }
        });
        
        // 動畫觸發後，停止觀察
        observer.unobserve(skillsSection);
      }
    });
  }, observerOptions);

  // 開始觀察
  observer.observe(skillsSection);
});
