// =======================================================
//  教材頁面專用功能 - materials.js
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    
    (function setupMaterialsPage() {
        const pageContainer = document.querySelector('.materials-page');
        if (!pageContainer) return;
        
        const listContainer = document.getElementById('materials-list-container');
        const noResultsDiv = document.getElementById('no-results-materials');
        const schoolFilterContainer = document.getElementById('school-filter');
        const yearFilter = document.getElementById('year-filter');
        const semesterFilter = document.getElementById('semester-filter');
        const searchInput = document.getElementById('materials-search');
        
        let allCourses = [];
        
        async function loadMaterials() {
            try {
                const response = await fetch('./data/yaml/materials.yaml');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const yamlText = await response.text();
                allCourses = window.jsyaml.load(yamlText) || [];
                allCourses.sort((a, b) => {
                    if (a.academicYear !== b.academicYear) return b.academicYear.localeCompare(a.academicYear);
                    return b.semester.localeCompare(a.semester);
                });
                populateFilters();
                filterAndRender();
            } catch (error) {
                console.error('Failed to load or parse materials.yml:', error);
                if (listContainer) {
                    listContainer.innerHTML = '<p style="color: red; text-align: center;">Error loading course data. Please check the console.</p>';
                }
            }
        }

        function populateFilters() {
            const years = [...new Set(allCourses.map(c => c.academicYear))];
            const semesters = [...new Set(allCourses.map(c => c.semester))];
            yearFilter.innerHTML = '<option value="all">All Academic Years</option>';
            semesterFilter.innerHTML = '<option value="all">All Semesters</option>';
            years.sort().reverse().forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = `Academic Year ${year}`;
                yearFilter.appendChild(option);
            });
            semesters.sort().forEach(semester => {
                const option = document.createElement('option');
                option.value = semester;
                option.textContent = `Semester ${semester}`;
                semesterFilter.appendChild(option);
            });
        }

        function renderCourses(courses) {
            listContainer.innerHTML = '';
            if (noResultsDiv) {
                noResultsDiv.style.display = courses.length === 0 ? 'block' : 'none';
            }
            if (courses.length === 0) return;
            
            courses.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.className = 'course-card';
                const links = course.links || {};
                courseCard.innerHTML = `
                    <h3>
                        ${course.courseName}
                        <span style="font-size: 0.6em; color: #8b949e; font-weight: normal;">
                            (${course.academicYear}-${course.semester} @ ${course.school})
                        </span>
                    </h3>
                    <div class="course-details">
                        <p><strong>學制 (Educational)：</strong> ${course.educational}</p>
                        <p><strong>課程時間 (Course Time)：</strong> ${course.courseTime}</p>
                        <p><strong>辦公時間 (Office Hours)：</strong> ${course.officeHours}</p>
                        <p><strong>班級 (Class)：</strong> ${course.class || '無分班 (Non-class)'}</p>
                        <p><strong>教室 (Classroom)：</strong> ${course.classroom}</p>
                        <p><strong>語言 (Language)：</strong> ${course.language}</p>
                        <p><strong>助教 (Teaching Assistents)：</strong> ${course.ta || 'N/A'}</p>
                        <p><strong>簡介 (Description)：</strong></br> ${course.description}</p>
                    </div>
                    <div class="course-links">
                        <a href="mailto:${course.contactEmailPlaceholder || '#'}" class="btn contact-btn">Contact Me</a>
                        ${links.introduction ? `<a href="${links.introduction}" target="_blank" class="btn">Introduction</a>` : ''}
                        ${links.materials ? `<a href="${links.materials}" target="_blank" class="btn">Materials</a>` : ''}
                        ${links.linechat ? `<a href="${links.linechat}" target="_blank" class="btn">LINE Chat</a>` : ''}
                        ${links.announcements ? `<a href="${links.announcements}" target="_blank" class="btn">Announcements</a>` : ''}
                        ${links.msteams ? `<a href="${links.msteams}" target="_blank" class="btn">Microsoft Teams</a>` : ''}
                        ${links.googlemeet ? `<a href="${links.googlemeet}" target="_blank" class="btn">Google Meet</a>` : ''}
                        ${links.googleclassroom ? `<a href="${links.googleclassroom}" target="_blank" class="btn">Google Classroom</a>` : ''}
                        ${links.zuvio ? `<a href="${links.zuvio}" target="_blank" class="btn">Zuvio</a>` : ''}
                        ${links.github ? `<a href="${links.github}" target="_blank" class="btn">GitHub</a>` : ''}
                    </div>`;
                listContainer.appendChild(courseCard);
            });
        }

        function filterAndRender() {
            if (!schoolFilterContainer) return;
            const activeSchoolButton = schoolFilterContainer.querySelector('.active');
            if (!activeSchoolButton) return;
            const activeFilter = activeSchoolButton.dataset.filter;
            const selectedYear = yearFilter.value;
            const selectedSemester = semesterFilter.value;
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            const filteredCourses = allCourses.filter(course => {
                let educationalMatch = false;
                if (activeFilter === 'all') {
                    educationalMatch = true;
                } else if (activeFilter === 'junior-high') {
                    educationalMatch = course.educationalClass === 'Junior High';
                } else if (activeFilter === 'high-school') {
                    educationalMatch = course.educationalClass === 'High School';
                } else if (activeFilter === 'high-school') {
                    educationalMatch = course.educationalClass === 'High School';
                } else if (activeFilter === 'university') {
                    educationalMatch = course.educationalClass === 'University';
                }
                
                const yearMatch = selectedYear === 'all' || course.academicYear === selectedYear;
                const semesterMatch = selectedSemester === 'all' || course.semester === selectedSemester;
                const searchMatch = !searchTerm || 
                    (course.courseName && course.courseName.toLowerCase().includes(searchTerm)) || 
                    (course.description && course.description.toLowerCase().includes(searchTerm)) || 
                    (course.school && course.school && course.school.toLowerCase().includes(searchTerm)) ||
                    (course.educational && course.educational && course.educational.toLowerCase().includes(searchTerm));
                
                return educationalMatch && yearMatch && semesterMatch && searchMatch;
            });
            
            renderCourses(filteredCourses);
        }
        
        if (schoolFilterContainer) {
            schoolFilterContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    const currentActive = schoolFilterContainer.querySelector('.active');
                    if (currentActive) currentActive.classList.remove('active');
                    e.target.classList.add('active');
                    filterAndRender();
                }
            });
        }
        
        if (yearFilter) yearFilter.addEventListener('change', filterAndRender);
        if (semesterFilter) semesterFilter.addEventListener('change', filterAndRender);
        if (searchInput) searchInput.addEventListener('input', filterAndRender);
        
        loadMaterials();
    })();
    
});