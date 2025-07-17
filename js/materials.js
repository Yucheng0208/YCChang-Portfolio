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
        const langToggleButton = document.getElementById('lang-toggle');
        
        let allCourses = [];
        const yearOptionMap = {};
        const semesterOptionMap = {};

        function updateDropdownLanguage() {
            const isZh = document.body.classList.contains('show-zh');
            const allYearOption = yearFilter.querySelector('option[value="all"]');
            if (allYearOption) {
                allYearOption.textContent = isZh ? '所有學年度' : 'All Academic Years';
            }
            for (const year in yearOptionMap) {
                yearOptionMap[year].textContent = isZh ? `${year} 學年度` : `Academic Year ${year}`;
            }
            const allSemesterOption = semesterFilter.querySelector('option[value="all"]');
            if (allSemesterOption) {
                allSemesterOption.textContent = isZh ? '所有學期' : 'All Semesters';
            }
            for (const semester in semesterOptionMap) {
                semesterOptionMap[semester].textContent = isZh ? `第 ${semester} 學期` : `Semester ${semester}`;
            }
        }
        
        if (langToggleButton) {
            langToggleButton.addEventListener('click', () => {
                document.body.classList.toggle('show-zh');
                updateDropdownLanguage();
            });
        }
        
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
                option.textContent = `${year} (AY)`;
                yearFilter.appendChild(option);
                yearOptionMap[year] = option;
            });
            semesters.sort().forEach(semester => {
                const option = document.createElement('option');
                option.value = semester;
                option.textContent = `Semester ${semester}`;
                semesterFilter.appendChild(option);
                semesterOptionMap[semester] = option;
            });
            updateDropdownLanguage();
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
                        <span class="lang-en">${course.courseName.en}</span>
                        <span class="lang-zh">${course.courseName.zh}</span>
                        <span style="font-size: 0.6em; color: #8b949e; font-weight: normal;">
                            (${course.academicYear}-${course.semester} @ <span class="lang-en">${course.school.en}</span><span class="lang-zh">${course.school.zh}</span>)
                        </span>
                    </h3>
                    <div class="course-details">
                        <p><strong><span class="lang-en">Educational</span><span class="lang-zh">授課學制</span>:</strong> <span class="lang-en">${course.educational.en}</span><span class="lang-zh">${course.educational.zh}</span></p>
                        <p><strong><span class="lang-en">Course Time</span><span class="lang-zh">授課時間</span>:</strong> <span class="lang-en">${course.courseTime.en}</span><span class="lang-zh">${course.courseTime.zh}</span></p>
                        <p><strong><span class="lang-en">Office Hours</span><span class="lang-zh">輔導時間</span>:</strong> <span class="lang-en">${course.officeHours.en}</span><span class="lang-zh">${course.officeHours.zh}</span></p>
                        <p><strong><span class="lang-en">Class</span><span class="lang-zh">授課班級</span>:</strong> <span class="lang-en">${course.class.en}</span><span class="lang-zh">${course.class.zh}</span></p>
                        <p><strong><span class="lang-en">Classroom</span><span class="lang-zh">授課教室</span>:</strong> <span class="lang-en">${course.classroom.en}</span><span class="lang-zh">${course.classroom.zh}</span></p>
                        <p><strong><span class="lang-en">Language</span><span class="lang-zh">授課語言</span>:</strong> <span class="lang-en">${course.language.en}</span><span class="lang-zh">${course.language.zh}</span></p>
                        <p><strong><span class="lang-en">Teaching Assistents</span><span class="lang-zh">課程助教</span>:</strong> <span>${course.ta || 'N/A'}</span></p>
                        <p><strong><span class="lang-en">Description</span><span class="lang-zh">課程簡介</span>:</strong> <span class="lang-en">${course.description.en}</span><span class="lang-zh">${course.description.zh}</span></p>
                    </div>
                    <div class="course-links">
                        <a href="mailto:${course.contactEmailPlaceholder || '#'}" class="btn contact-btn"><span class="lang-en">Contact Me</span><span class="lang-zh">聯繫老師</span></a>
                        ${links.materials ? `<a href="${links.materials}" target="_blank" class="btn"><span class="lang-en">Materials</span><span class="lang-zh">課程教材</span></a>` : ''}
                        ${links.linechat ? `<a href="${links.linechat}" target="_blank" class="btn"><span class="lang-en">LINE Chat</span><span class="lang-zh">LINE 群組</span></a>` : ''}
                        ${links.announcements ? `<a href="${links.announcements}" target="_blank" class="btn"><span class="lang-en">Announcements</span><span class="lang-zh">課程公告</span></a>` : ''}
                        ${links.msteams ? `<a href="${links.msteams}" target="_blank" class="btn"><span class="lang-en">Microsoft Teams</span><span class="lang-zh">Microsoft Teams</span></a>` : ''}
                        ${links.googlemeet ? `<a href="${links.googlemeet}" target="_blank" class="btn"><span class="lang-en">Google Meet</span><span class="lang-zh">Google Meet</span></a>` : ''}
                        ${links.googleclassroom ? `<a href="${links.googleclassroom}" target="_blank" class="btn"><span class="lang-en">Google Classroom</span><span class="lang-zh">Google Classroom</span></a>` : ''}
                        ${links.zuvio ? `<a href="${links.zuvio}" target="_blank" class="btn"><span class="lang-en">Zuvio</span><span class="lang-zh">Zuvio</span></a>` : ''}
                        ${links.github ? `<a href="${links.github}" target="_blank" class="btn"><span class="lang-en">GitHub</span><span class="lang-zh">GitHub</span></a>` : ''}
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
                } else if (activeFilter === 'high-school') {
                    educationalMatch = course.educational && course.educational.en === 'High School';
                } else if (activeFilter === 'university') {
                    educationalMatch = course.educational && course.educational.en === 'University';
                }
                
                const yearMatch = selectedYear === 'all' || course.academicYear === selectedYear;
                const semesterMatch = selectedSemester === 'all' || course.semester === selectedSemester;
                const searchMatch = !searchTerm || 
                    (course.courseName.en && course.courseName.en.toLowerCase().includes(searchTerm)) || 
                    (course.courseName.zh && course.courseName.zh.toLowerCase().includes(searchTerm)) || 
                    (course.description.en && course.description.en.toLowerCase().includes(searchTerm)) || 
                    (course.description.zh && course.description.zh.toLowerCase().includes(searchTerm)) || 
                    (course.school && course.school.en && course.school.en.toLowerCase().includes(searchTerm)) ||
                    (course.school && course.school.zh && course.school.zh.toLowerCase().includes(searchTerm)) ||
                    (course.educational && course.educational.en && course.educational.en.toLowerCase().includes(searchTerm)) ||
                    (course.educational && course.educational.zh && course.educational.zh.toLowerCase().includes(searchTerm));
                
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