// =======================================================
//  課表頁面專用功能 - schedule.js
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    
    (function setupSchedulePage() {
        const pageContainer = document.querySelector('.schedule-page');
        if (!pageContainer) return;
        
        const filterContainer = document.getElementById('schedule-filter');
        const scheduleWrappers = document.querySelectorAll('.schedule-wrapper');
        
        if (!filterContainer) return;
        
        filterContainer.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                return;
            }
            
            const targetScheduleId = e.target.dataset.schedule;
            if (!targetScheduleId) return;
            
            // 移除當前活動狀態
            filterContainer.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            
            // 隱藏所有課表
            scheduleWrappers.forEach(wrapper => {
                wrapper.style.display = 'none';
            });
            
            // 顯示目標課表
            const targetWrapper = document.getElementById(targetScheduleId + '-schedule');
            if (targetWrapper) {
                targetWrapper.style.display = 'block';
            }
        });
    })();
    
});