// =======================================================
//  列表頁面通用功能 - list-pages.js（完整分類版）
// =======================================================

// 通用列表頁面初始化函數
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
            
            // 根據不同頁面類型進行排序
            if (config.yamlPath.includes('jobs.yaml')) {
                allItems.sort((a, b) => {
                    const dateA = CommonUtils.parsejobDate(a.date);
                    const dateB = CommonUtils.parsejobDate(b.date);
                    
                    if (dateA.isPresent && !dateB.isPresent) return -1;
                    if (!dateA.isPresent && dateB.isPresent) return 1;
                    
                    return dateB.startDate.getTime() - dateA.startDate.getTime();
                });
            } else if (config.yamlPath.includes('publications.yaml')) {
                allItems.sort((a, b) => {
                    const dateA = CommonUtils.parsePublicationDate(a.date);
                    const dateB = CommonUtils.parsePublicationDate(b.date);
                    return dateB.getTime() - dateA.getTime();
                });
            } else if (config.yamlPath.includes('projects.yaml')) {
                allItems.sort((a, b) => {
                    const dateA = CommonUtils.parseProjectDate(a.date);
                    const dateB = CommonUtils.parseProjectDate(b.date);
                    return dateB.getTime() - dateA.getTime();
                });
            } else if (config.yamlPath.includes('honors.yaml') || config.yamlPath.includes('highlights.yaml')) {
                allItems.sort((a, b) => {
                    const dateA = CommonUtils.parsePublicationDate(a.date);
                    const dateB = CommonUtils.parsePublicationDate(b.date);
                    return dateB.getTime() - dateA.getTime();
                });
            }
            
            updateDisplay({ type: 'refresh' });
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
        if (pageInfoSpan && pageInput) {
            pageInfoSpan.innerHTML = `Page `;
            pageInput.value = currentPage;
            pageInput.min = 1;
            pageInput.max = totalPages;
            pageInfoSpan.appendChild(pageInput);
            pageInfoSpan.insertAdjacentText('beforeend', ` of ${totalPages}`);
        } else if (pageInfoSpan) {
            pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages}`;
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
                tempFiltered = tempFiltered.filter(item => String(item.category) === activeFilter);
            }
        }
        
        if (searchTerm) {
            tempFiltered = tempFiltered.filter(item => 
                Object.values(item).some(value => 
                    String(value).toLowerCase().includes(searchTerm)
                )
            );
        }
        
        // 對篩選後的結果重新排序
        if (config.yamlPath.includes('jobs.yaml')) {
            tempFiltered.sort((a, b) => {
                const dateA = CommonUtils.parsejobDate(a.date);
                const dateB = CommonUtils.parsejobDate(b.date);
                
                if (dateA.isPresent && !dateB.isPresent) return -1;
                if (!dateA.isPresent && dateB.isPresent) return 1;
                
                return dateB.startDate.getTime() - dateA.startDate.getTime();
            });
        } else if (config.yamlPath.includes('publications.yaml')) {
            tempFiltered.sort((a, b) => {
                const dateA = CommonUtils.parsePublicationDate(a.date);
                const dateB = CommonUtils.parsePublicationDate(b.date);
                return dateB.getTime() - dateA.getTime();
            });
        } else if (config.yamlPath.includes('projects.yaml')) {
            tempFiltered.sort((a, b) => {
                const dateA = CommonUtils.parseProjectDate(a.date);
                const dateB = CommonUtils.parseProjectDate(b.date);
                return dateB.getTime() - dateA.getTime();
            });
        } else if (config.yamlPath.includes('honors.yaml') || config.yamlPath.includes('highlights.yaml')) {
            tempFiltered.sort((a, b) => {
                const dateA = CommonUtils.parsePublicationDate(a.date);
                const dateB = CommonUtils.parsePublicationDate(b.date);
                return dateB.getTime() - dateA.getTime();
            });
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

    // 事件監聽器
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const currentActiveButton = document.querySelector(`#${config.filterBarId} button.active`);
                if (button === currentActiveButton) return;
                const newFilter = button.dataset.filter;
                const oldFilter = currentActiveButton ? currentActiveButton.dataset.filter : 'all';
                let animationOptions;
                if (newFilter === 'all' || newFilter === 'Certification' || newFilter === 'academic' || newFilter === 'industry') {
                    animationOptions = { type: 'none' };
                } else if (oldFilter === 'all' || oldFilter === 'Certification') {
                    animationOptions = { type: 'refresh' };
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

    const refreshAnimation = { type: 'refresh' };
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
        pageInput.value = page;
        displayPage(page, refreshAnimation);
    });
    
    loadData();
}

// 🆕 創建分類標籤的輔助函數
function createCategoryBadge(category) {
    category = String(category).toLowerCase();
    if (!category) return '';
    return `<span class="category-badge category-${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</span>`;
}

// 🔧 更新的 Publications 渲染函數
function renderPublicationRow(pub, globalIndex) {
    let linksHTML = '';
    if (pub.links && typeof pub.links === 'object') {
        const validLinks = Object.entries(pub.links).filter(([_, url]) => url && String(url).trim() !== '');
        if (validLinks.length > 0) {
            linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
        }
    }
    
    const highlightedAuthors = CommonUtils.highlightAuthorName(pub.authors || '');
    const categoryBadge = createCategoryBadge(pub.category);
    const row = document.createElement('tr');
    row.innerHTML = `
        <td data-label="#">${globalIndex}.</td>
        <td data-label="Title">${pub.title || ''} ${categoryBadge}</td>
        ${pub.authors ? `<td data-label="Authors"><strong>Authors:</strong> <span class="notranslate">${highlightedAuthors}</span></td>` : ''}
        ${pub.venue ? `<td data-label="Venue"><strong>Venue:</strong> ${pub.venue}</td>` : ''}
        ${pub.location ? `<td data-label="Location"><strong>Location:</strong> ${pub.location}</td>` : ''}
        ${pub.patentnumber ? `<td data-label="Patent Number"><strong>Patent Number:</strong> ${pub.patentnumber}</td>` : ''}
        ${pub.authorrole ? `<td data-label="Author Role"><strong>Author Role:</strong> ${pub.authorrole}</td>` : ''}
        ${pub.isbn ? `<td data-label="ISBN"><strong>ISBN:</strong> ${pub.isbn}</td>` : ''}
        ${pub.patentterm ? `<td data-label="Patent Term"><strong>Patent Term:</strong> ${pub.patentterm}</td>` : ''}
        <td data-label="Date"><strong>Date:</strong> ${pub.date || 'TBA'}</td>
        ${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}
    `;
    return row;
}

// 🔧 更新的 Honors 渲染函數
function renderHonorRow(honor, globalIndex) {
    let linksHTML = '';
    if (honor.links && typeof honor.links === 'object') {
        const validLinks = Object.entries(honor.links).filter(([_, url]) => url && String(url).trim() !== '');
        if (validLinks.length > 0) {
            linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
        }
    }
    
    const highlightedMembers = CommonUtils.highlightAuthorName(honor.members || '');
    const highlightedAdvisors = CommonUtils.highlightAuthorName(honor.advisors || '');
    const highlightedTitle = CommonUtils.highlightAuthorName(honor.title || '');
    const categoryBadge = createCategoryBadge(honor.category);
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td data-label="#">${globalIndex}.</td>
        <td data-label="Title">${highlightedTitle} ${categoryBadge}</td>
        ${honor.event ? `<td data-label="Event"><strong>Event:</strong> ${honor.event}</td>` : ''}
        ${honor.organizer ? `<td data-label="Organizer"><strong>Organizer:</strong> ${honor.organizer}</td>` : ''}
        ${honor.award ? `<td data-label="Award"><strong>Award:</strong> ${honor.award}</td>` : ''}
        ${honor.bonus ? `<td data-label="Bonus"><strong>Bonus:</strong> ${honor.bonus}</td>` : ''}
        ${highlightedMembers ? `<td data-label="Members" class="notranslate"><strong>Members:</strong> ${highlightedMembers}</td>` : ''}
        ${highlightedAdvisors ? `<td data-label="Advisors" class="notranslate"><strong>Advisors:</strong> ${highlightedAdvisors}</td>` : ''}
        <td data-label="Date"><strong>Date:</strong> ${honor.date || 'TBA'}</td>
        ${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}
    `;
    return row;
}

// 🔧 更新的 Highlights 渲染函數
function renderHighlightRow(highlight, globalIndex) {
    const location = highlight.localtion || highlight.location || '';
    let linksHTML = '';
    if (highlight.links && typeof highlight.links === 'object') {
        const validLinks = Object.entries(highlight.links).filter(([_, url]) => url && String(url).trim() !== '');
        if (validLinks.length > 0) {
            linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
        }
    }
    
    const categoryBadge = createCategoryBadge(highlight.category);
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td data-label="#">${globalIndex}.</td>
        <td data-label="Title">${highlight.title || 'No Title'} ${categoryBadge}</td>
        ${highlight.position ? `<td data-label="Position"><strong>Position:</strong> ${highlight.position}</td>` : ''}
        ${location ? `<td data-label="Location"><strong>Location:</strong> ${location}</td>` : ''}
        ${highlight.organizer ? `<td data-label="Organizer"><strong>Organizer:</strong> ${highlight.organizer}</td>` : ''}
        <td data-label="Date"><strong>Date:</strong> ${highlight.date || 'TBA'}</td>
        ${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}
    `;
    return row;
}

// 🔧 更新的 Projects 渲染函數
function renderProjectRow(project, globalIndex) {
    let linksHTML = '';
    if (project.links && typeof project.links === 'object') {
        const validLinks = Object.entries(project.links).filter(([_, url]) => url && String(url).trim() !== '');
        if (validLinks.length > 0) {
            linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
        }
    }
    
    const categoryBadge = createCategoryBadge(project.category);
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td data-label="#">${globalIndex}.</td>
        <td data-label="Title">${project.title || ''} ${categoryBadge}</td>
        ${project.class ? `<td data-label="Class"><strong>Class:</strong> ${project.class}</td>` : ''}
        ${project.number ? `<td data-label="Project ID"><strong>Project ID:</strong> ${project.number}</td>` : ''}
        ${project.date ? `<td data-label="Duration"><strong>Duration:</strong> ${project.date}</td>` : ''}
        ${project.position ? `<td data-label="Position"><strong>Position:</strong> ${project.position}</td>` : ''}
        ${project.members ? `<td data-label="Members"><strong>Members:</strong> ${project.members}</td>` : ''}
        ${project.bonus ? `<td data-label="Bonus"><strong>Bonus:</strong> ${project.bonus}</td>` : ''}
        ${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}
    `;
    return row;

}

// 🔧 修正的 jobs 渲染函數
function renderjobRow(job, globalIndex) {
    let linksHTML = '';
    if (job.links && typeof job.links === 'object') {
        const validLinks = Object.entries(job.links).filter(([_, url]) => url && String(url).trim() !== '');
        if (validLinks.length > 0) {
            linksHTML = `<div class="action-buttons">${validLinks.map(([name, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn">${name}</a>`).join('')}</div>`;
        }
    }
    
    // 更嚴格的 CRN 檢查
    const crnValue = String(job.crn || '').trim();
    const hasCRN = crnValue && crnValue !== '' && crnValue !== '""' && crnValue !== "''" && crnValue !== 'null' && crnValue !== 'undefined';
    
    // 添加分類標籤
    const categoryBadge = createCategoryBadge(job.category);
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td data-label="#">${globalIndex}.</td>
        <td data-label="Organization">${job.organization || ''} ${categoryBadge}</td>
        <td data-label="Position"><strong>Position:</strong> ${job.position || ''}</td>
        ${hasCRN ? `<td data-label="CRN"><strong>Company Registration Numbers:</strong> ${crnValue}</td>` : ''}
        <td data-label="Date"><strong>Date:</strong> ${job.date || 'TBA'}</td>
        ${linksHTML ? `<td data-label="Links">${linksHTML}</td>` : ''}
    `;
    return row;
}

// 初始化所有列表頁面
document.addEventListener('DOMContentLoaded', function() {
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
        pageSelector: '.job-page', 
        yamlPath: './data/yaml/jobs.yaml', 
        tableBodyId: 'job-table-body', 
        filterBarId: 'job-filter', 
        searchInputId: 'job-search', 
        noResultsId: 'no-results-job', 
        paginationContainerId: 'pagination-container-job', 
        pageInfoId: 'page-info-job', 
        pageInputId: 'page-input-job', 
        firstPageBtnId: 'first-page-job', 
        prevPageBtnId: 'prev-page-job', 
        nextPageBtnId: 'next-page-job', 
        lastPageBtnId: 'last-page-job', 
        renderRowFunction: renderjobRow 
    });
});