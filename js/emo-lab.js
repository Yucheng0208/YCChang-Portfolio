// =======================================================
//  EMO Lab 專用功能 - emo-lab.js (整合版)
//  說明：
//   - News：分類徽章＋分頁（每頁5筆，上一頁/下一頁＋頁碼輸入）
//   - Members：排序（order → name）、預設頭像與淡入動畫
//   - Scroll：卷軸箭頭導向、IntersectionObserver一次觸發
//   - 其他：防呆容器檢查、例外處理、debounce工具
// =======================================================

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // Scroll indicator click handler
    const scrollArrow = document.querySelector('.scroll-arrow');
    if (scrollArrow) {
      scrollArrow.addEventListener('click', () => {
        const aboutSection = document.querySelector('.lab-about-section');
        if (aboutSection) {
          aboutSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    }

    // Initialize all sections
    initNewsSection();
    initMembersSection();
    initScrollAnimations();
  });

  // ============================
  // News Section Management
  // ============================
  function initNewsSection() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return; // 無容器時直接返回

    let newsData = [];
    let currentPage = 1;
    const PAGE_SIZE = 5;

    // 類別色彩對應（CSS 需配合 .news-category-badge 與下列 class）
    const CATEGORY_STYLES = {
      Research:     { class: 'is-research',     label: 'Research' },
      Conference:   { class: 'is-conference',   label: 'Conference' },
      Competition:  { class: 'is-competition',  label: 'Competition' },
      Announcement: { class: 'is-announcement', label: 'Announcement' }
    };

    // 初始載入 YAML
    (async function loadNewsData() {
      try {
        const response = await fetch('./data/yaml/lab-news.yaml', { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Failed to load news data: ${response.status}`);
        const yamlText = await response.text();

        const loader = (window.jsyaml && window.jsyaml.load) ? window.jsyaml.load : null;
        if (!loader) throw new Error('js-yaml not found. Make sure js-yaml is loaded.');

        newsData = loader(yamlText) || [];
        // 兼容：非陣列情況
        if (!Array.isArray(newsData)) {
          console.warn('[News] YAML root is not an array. Coercing to array.');
          newsData = Object.values(newsData);
        }

        // 依日期新到舊
        newsData.sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));

        renderNewsView();
      } catch (error) {
        console.error('Error loading news data:', error);
        showNewsError();
      }
    })();

    function renderNewsView() {
      if (!newsData || newsData.length === 0) {
        showNoNews();
        return;
      }

      const totalPages = Math.max(1, Math.ceil(newsData.length / PAGE_SIZE));
      currentPage = clamp(currentPage, 1, totalPages);

      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const pageItems = newsData.slice(start, end);

      const frag = document.createDocumentFragment();

      // 建立表格
      const newsTable = document.createElement('table');
      newsTable.className = 'news-table';

      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr>
          <th>Date</th>
          <th>Event</th>
          <th>Category</th>
        </tr>
      `;
      newsTable.appendChild(thead);

      const tbody = document.createElement('tbody');
      pageItems.forEach((news) => tbody.appendChild(createNewsRow(news)));
      newsTable.appendChild(tbody);

      frag.appendChild(newsTable);

      // 分頁器（若僅 1 頁則不顯示）
      if (totalPages > 1) {
        frag.appendChild(renderPagination(totalPages));
      }

      // 注入 DOM
      newsContainer.innerHTML = '';
      newsContainer.appendChild(frag);
    }

    function createNewsRow(news) {
      const row = document.createElement('tr');

      const formattedDate = formatNewsDate(news?.date);

      row.innerHTML = `
        <td class="news-date-cell">${formattedDate}</td>
        <td class="news-title-cell">
          <div class="news-title" style="margin-bottom: .5rem;">${escapeHTML(news?.title) || 'Untitled'}</div>
          <div class="news-content-cell">${safeHTML(news?.content)}</div>
        </td>
        <td class="news-category-cell">${renderCategoryBadge(news?.category)}</td>
      `;

      return row;
    }

    function renderCategoryBadge(category) {
      const cat = (category || 'Announcement').toString().trim();
      const style = CATEGORY_STYLES[cat] || CATEGORY_STYLES['Announcement'];
      return `<span class="news-category-badge ${style.class}" title="${style.label}">${style.label}</span>`;
    }

    function renderPagination(totalPages) {
      const el = document.createElement('div');
      el.className = 'news-pager';
      el.innerHTML = `
        <button class="pager-btn pager-prev" aria-label="Previous page" type="button">&laquo;</button>
        <span class="pager-info">Page </span>
        <input class="pager-input" type="number" min="1" max="${totalPages}" value="${currentPage}" aria-label="Page number" inputmode="numeric" />
        <span class="pager-total"> / ${totalPages}</span>
        <button class="pager-btn pager-next" aria-label="Next page" type="button">&raquo;</button>
      `;

      const prevBtn = el.querySelector('.pager-prev');
      const nextBtn = el.querySelector('.pager-next');
      const input   = el.querySelector('.pager-input');

      function updateBtnState() {
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
      }

      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderNewsView();
        }
      });

      nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderNewsView();
        }
      });

      const commitInput = () => {
        const val = parseInt(input.value, 10);
        if (!Number.isNaN(val)) {
          const n = clamp(val, 1, totalPages);
          if (n !== currentPage) {
            currentPage = n;
            renderNewsView();
          }
        } else {
          input.value = currentPage;
        }
      };

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commitInput();
      });
      input.addEventListener('blur', commitInput);

      updateBtnState();
      return el;
    }

    function formatNewsDate(dateString) {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString || 'No date';
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      } catch {
        return dateString || 'No date';
      }
    }

    function showNewsError() {
      newsContainer.innerHTML = `
        <div class="loading-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Unable to load latest news. Please try again later.</p>
        </div>
      `;
    }

    function showNoNews() {
      newsContainer.innerHTML = `
        <div class="loading-state">
          <i class="fas fa-newspaper"></i>
          <p>No news available at the moment.</p>
        </div>
      `;
    }
  }

  // ============================
  // Members Section Management
  // ============================
  function initMembersSection() {
    const membersContainer = document.getElementById('members-container');
    if (!membersContainer) return;

    let membersData = [];

    (async function loadMembersData() {
      try {
        const response = await fetch('./data/yaml/lab-members.yaml', { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Failed to load members data: ${response.status}`);
        const yamlText = await response.text();

        const loader = (window.jsyaml && window.jsyaml.load) ? window.jsyaml.load : null;
        if (!loader) throw new Error('js-yaml not found. Make sure js-yaml is loaded.');

        membersData = loader(yamlText) || [];
        if (!Array.isArray(membersData)) {
          console.warn('[Members] YAML root is not an array. Coercing to array.');
          membersData = Object.values(membersData);
        }

        // Sort by order → name
        membersData.sort((a, b) => {
          const orderA = Number.parseInt(a?.order, 10);
          const orderB = Number.parseInt(b?.order, 10);
          const aHas = Number.isFinite(orderA);
          const bHas = Number.isFinite(orderB);

          if (aHas && bHas && orderA !== orderB) return orderA - orderB;
          if (aHas && !bHas) return -1;
          if (!aHas && bHas) return 1;

          const nameA = (a?.name || '').toString();
          const nameB = (b?.name || '').toString();
          return nameA.localeCompare(nameB);
        });

        renderMembersSection();
      } catch (error) {
        console.error('Error loading members data:', error);
        showMembersError();
      }
    })();

    function renderMembersSection() {
      if (!membersData || membersData.length === 0) {
        showNoMembers();
        return;
      }

      const membersGrid = document.createElement('div');
      membersGrid.className = 'members-grid';

      membersData.forEach((member, index) => {
        const card = createMemberCard(member);
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
        membersGrid.appendChild(card);
      });

      membersContainer.innerHTML = '';
      membersContainer.appendChild(membersGrid);
    }

    function createMemberCard(member) {
      const memberCard = document.createElement('div');
      memberCard.className = 'member-card';

      // 頭像處理（支援 onerror fallback）
      let avatarHTML;
      const avatar = (member?.avatar || '').toString().trim();
      if (avatar && !avatar.includes('default-avatar')) {
        avatarHTML = `
          <img src="${escapeAttr(avatar)}" alt="${escapeAttr(member?.name || 'Team Member')}"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="default-avatar" style="display:none;">
            <i class="fas fa-user"></i>
          </div>`;
      } else {
        avatarHTML = `
          <div class="default-avatar">
            <i class="fas fa-user"></i>
          </div>`;
      }

      memberCard.innerHTML = `
        <div class="member-avatar">${avatarHTML}</div>
        <h3 class="member-name notranslate">${escapeHTML(member?.name) || 'Unknown'}<br>${escapeHTML(member?.zh) || ''}</h3>
        <div class="member-position">${escapeHTML(member?.position) || 'Team Member'}</div>
        <div class="member-expertise">${escapeHTML(member?.expertise) || ''}</div>
        <div class="member-department">${escapeHTML(member?.department) || ''}</div>
        <div class="member-organization">${escapeHTML(member?.organization) || ''}</div>
      `;

      return memberCard;
    }

    function showMembersError() {
      membersContainer.innerHTML = `
        <div class="loading-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Unable to load team members. Please try again later.</p>
        </div>
      `;
    }

    function showNoMembers() {
      membersContainer.innerHTML = `
      <div class="loading-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 220px;">
        <i class="fas fa-users"></i>
        <p>No team members information available.</p>
      </div>
      `;
    }
  }

  // ============================
  // Scroll Animations
  // ============================
  function initScrollAnimations() {
    const sections = document.querySelectorAll('.lab-about-section, .lab-news-section, .lab-members-section');
    if (!sections.length) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // About section animation
        if (entry.target.classList.contains('lab-about-section')) {
          const paragraphs = entry.target.querySelectorAll('.intro-paragraph, .mission-paragraph, .philosophy-paragraph');
          paragraphs.forEach((p, idx) => {
            setTimeout(() => p.classList.add('fade-in-up'), idx * 200);
          });

          const principleCards = entry.target.querySelectorAll('.principle-card');
          principleCards.forEach((card, idx) => {
            setTimeout(() => card.classList.add('fade-in-up'), (paragraphs.length * 200) + (idx * 100));
          });
        }

        // News section animation
        if (entry.target.classList.contains('lab-news-section')) {
          const container = entry.target.querySelector('.news-container');
          if (container) {
            setTimeout(() => container.classList.add('fade-in-up'), 100);
          }
        }

        observer.unobserve(entry.target); // 一次觸發即可
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // ============================
  // Utilities
  // ============================
  function debounce(func, wait = 250) {
    let timeout;
    return function debounced(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  // 簡單的 HTML 安全處理（允許 content 以少量 HTML 呈現時，可使用 safeHTML；純文字使用 escapeHTML）
  function escapeHTML(input) {
    if (input == null) return '';
    return String(input)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function escapeAttr(input) {
    // 屬性值專用
    return escapeHTML(input).replaceAll('`', '&#96;');
  }

  function safeHTML(input) {
    // 若後續有更嚴格需求可改為白名單過濾
    // 目前僅作為允許 YAML content 放入簡單 HTML 的便捷方法
    return input == null ? '' : String(input);
  }

})();
