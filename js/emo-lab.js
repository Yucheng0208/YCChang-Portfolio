// =======================================================
//  EMO Lab 專用功能 - emo-lab.js
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    
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

// News Section Management
function initNewsSection() {
    let newsData = [];
    const newsContainer = document.getElementById('news-container');

    async function loadNewsData() {
        try {
            const response = await fetch('./data/yaml/lab-news.yaml');
            if (!response.ok) {
                throw new Error(`Failed to load news data: ${response.status}`);
            }
            const yamlText = await response.text();
            newsData = window.jsyaml.load(yamlText) || [];
            
            // Sort by date (newest first)
            newsData.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            renderNewsTable();
        } catch (error) {
            console.error('Error loading news data:', error);
            showNewsError();
        }
    }

    function renderNewsTable() {
        if (newsData.length === 0) {
            showNoNews();
            return;
        }

        const newsTable = document.createElement('table');
        newsTable.className = 'news-table';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Category</th>
            </tr>
        `;
        newsTable.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        
        newsData.forEach((news) => {
            const row = createNewsRow(news);
            tbody.appendChild(row);
        });
        
        newsTable.appendChild(tbody);
        
        newsContainer.innerHTML = '';
        newsContainer.appendChild(newsTable);
    }

    function createNewsRow(news) {
        const row = document.createElement('tr');
        
        const formattedDate = formatNewsDate(news.date);
        const categoryBadge = news.category ? 
            `<span class="news-category-badge">${news.category}</span>` : '';
        
        row.innerHTML = `
            <td class="news-date-cell">${formattedDate}</td>
            <td class="news-title-cell">
                <div style="margin-bottom: 0.5rem;">${news.title || 'Untitled'}</div>
                <div class="news-content-cell">${news.content || ''}</div>
            </td>
            <td class="news-category-cell">${categoryBadge}</td>
        `;
        
        return row;
    }

    function formatNewsDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
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

    // Initialize news loading
    loadNewsData();
}

// Members Section Management
function initMembersSection() {
    let membersData = [];
    const membersContainer = document.getElementById('members-container');

    async function loadMembersData() {
        try {
            const response = await fetch('./data/yaml/lab-members.yaml');
            if (!response.ok) {
                throw new Error(`Failed to load members data: ${response.status}`);
            }
            const yamlText = await response.text();
            membersData = window.jsyaml.load(yamlText) || [];
            
            // Sort by order or name
            membersData.sort((a, b) => {
                // Sort by order first, then by name
                const orderA = parseInt(a.order) || 999;
                const orderB = parseInt(b.order) || 999;
                
                if (orderA !== orderB) {
                    return orderA - orderB;
                }
                
                return (a.name || '').localeCompare(b.name || '');
            });
            
            renderMembersSection();
        } catch (error) {
            console.error('Error loading members data:', error);
            showMembersError();
        }
    }

    function renderMembersSection() {
        if (membersData.length === 0) {
            showNoMembers();
            return;
        }

        const membersGrid = document.createElement('div');
        membersGrid.className = 'members-grid';

        membersData.forEach((member, index) => {
            const memberCard = createMemberCard(member);
            memberCard.style.animationDelay = `${index * 0.1}s`;
            memberCard.classList.add('fade-in-up');
            membersGrid.appendChild(memberCard);
        });

        membersContainer.innerHTML = '';
        membersContainer.appendChild(membersGrid);
    }

    function createMemberCard(member) {
        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';
        
        // Handle avatar image - 使用更簡單的預設頭像處理
        let avatarHTML;
        if (member.avatar && member.avatar.trim() !== '' && !member.avatar.includes('default-avatar')) {
            avatarHTML = `<img src="${member.avatar}" alt="${member.name || 'Team Member'}" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="default-avatar" style="display: none;">
                             <i class="fas fa-user"></i>
                         </div>`;
        } else {
            avatarHTML = `<div class="default-avatar">
                             <i class="fas fa-user"></i>
                         </div>`;
        }
        
        memberCard.innerHTML = `
            <div class="member-avatar">
                ${avatarHTML}
            </div>
            <h3 class="member-name">${member.name || 'Unknown'}</h3>
            <div class="member-position">${member.position || 'Team Member'}</div>
            <div class="member-organization">${member.organization || ''}</div>
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
            <div class="loading-state">
                <i class="fas fa-users"></i>
                <p>No team members information available.</p>
            </div>
        `;
    }

    // Initialize members loading
    loadMembersData();
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // About section animation
                if (entry.target.classList.contains('lab-about-section')) {
                    const paragraphs = entry.target.querySelectorAll('.intro-paragraph, .mission-paragraph, .philosophy-paragraph');
                    paragraphs.forEach((paragraph, index) => {
                        setTimeout(() => {
                            paragraph.classList.add('fade-in-up');
                        }, index * 200);
                    });
                    
                    const principleCards = entry.target.querySelectorAll('.principle-card');
                    principleCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('fade-in-up');
                        }, (paragraphs.length * 200) + (index * 100));
                    });
                }
                
                // News section animation
                if (entry.target.classList.contains('lab-news-section')) {
                    const newsContainer = entry.target.querySelector('.news-container');
                    if (newsContainer) {
                        setTimeout(() => {
                            newsContainer.classList.add('fade-in-up');
                        }, 100);
                    }
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections
    const sections = document.querySelectorAll('.lab-about-section, .lab-news-section, .lab-members-section');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}