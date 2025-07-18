// =======================================================
//  成績查詢頁面專用功能 - grades.js
// =======================================================

document.addEventListener('DOMContentLoaded', function() {
    
    (function setupGradeInquiryPage() {
        const pageContainer = document.querySelector('.grade-inquiry-page');
        if (!pageContainer) return;

        // 元素獲取
        const schoolSelect = document.getElementById('school-select');
        const courseSelect = document.getElementById('course-select');
        const studentIdInput = document.getElementById('student-id-input');
        const searchBtn = document.getElementById('search-btn');
        const langToggleBtn = document.getElementById('lang-toggle');
        const resultsContainer = document.getElementById('grade-results-container');
        const noResultsMessage = document.getElementById('no-results-message');
        const loadingIndicator = document.getElementById('loading-indicator');
        const resultCourseName = document.getElementById('result-course-name');
        const resultCourseCode = document.getElementById('result-course-code');
        const resultStudentId = document.getElementById('result-student-id');
        const gradeDetailsBody = document.getElementById('grade-details-body');
        
        const summaryCards = {
            assignments: document.querySelector('#card-assignments .score .value'),
            dailyPerformance: document.querySelector('#card-daily-performance .score .value'),
            attendance: document.querySelector('#card-attendance .score .value'),
            midterm: document.querySelector('#card-midterm .score .value'),
            final: document.querySelector('#card-final .score .value'),
            bonus: document.querySelector('#card-bonus .score .value'),
        };
        
        const subtotalScoreEl = document.getElementById('subtotal-score');
        const bonusScoreEl = document.getElementById('bonus-score');
        const finalTotalScoreEl = document.getElementById('final-total-score');
        
        // 圖表相關元素
        const adminControlsContainer = document.getElementById('admin-controls-container');
        const chartOptionsBtn = document.getElementById('chart-options-btn');
        const chartOptionsDropdown = document.getElementById('chart-options-dropdown');
        const chartContainer = document.getElementById('grade-chart-container');
        const chartCheckboxes = chartOptionsDropdown.querySelectorAll('input[type="checkbox"]');

        let availableCourses = [];
        let gradeChart = null;
        let currentStudentDataForChart = [];
        
        // 標頭翻譯字典
        const headerTranslations = {
            'HW': { en: 'Homework', zh: '作業' },
            'Quiz': { en: 'Quiz', zh: '小考' },
            'Bonus': { en: 'Bonus', zh: '加分' },
            'Daily': {en: 'Daily', zh: '日常'},
            'Participation': {en: 'Participation', zh: '參與分數'},
            'Attendance': { en: 'Attendance', zh: '點名分數' },
            'Midterm': { en: 'Midterm', zh: '期中' },
            'Final': { en: 'Final', zh: '期末' },
        };
        
        // 核心功能函式
        function isChinese() {
            return document.body.classList.contains('show-zh');
        }

        function getDisplayName(header) {
            const lang = isChinese() ? 'zh' : 'en';
            if (headerTranslations[header]) {
                return headerTranslations[header][lang];
            }
            const match = header.match(/^([a-zA-Z]+)(\d+)$/);
            if (match) {
                const base = match[1];
                const number = match[2];
                if (headerTranslations[base]) {
                    return `${headerTranslations[base][lang]} ${number}`;
                }
            }
            return header;
        }

        function showLoading(show) {
            loadingIndicator.style.display = show ? 'block' : 'none';
            [searchBtn, studentIdInput, schoolSelect, courseSelect].forEach(el => el.disabled = show);
        }
    
        function hideAllResults() {
            resultsContainer.style.display = 'none';
            noResultsMessage.style.display = 'none';
        }
    
        async function loadCourses() {
            try {
                await waitForJsYaml();
                
                const response = await fetch('./data/yaml/grades.yaml');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const yamlText = await response.text();
                availableCourses = window.jsyaml.load(yamlText) || [];
                loadSchools();
            } catch (error) {
                console.error('Failed to load grades.yaml:', error);
                schoolSelect.disabled = true;
                courseSelect.disabled = true;
                schoolSelect.innerHTML = '<option>Error loading courses</option>';
            }
        }

        function waitForJsYaml(timeout = 1000) {
            return new Promise((resolve, reject) => {
                if (typeof window.jsyaml !== 'undefined' && typeof window.jsyaml.load === 'function') {
                    resolve();
                    return;
                }
                setTimeout(() => {
                    if (typeof window.jsyaml !== 'undefined' && typeof window.jsyaml.load === 'function') {
                        resolve();
                    } else {
                        reject(new Error('js-yaml library is not available.'));
                    }
                }, 100);
            });
        }
        
        function loadSchools() {
            schoolSelect.options.length = 1;
            const schoolMap = new Map();
            availableCourses.forEach(c => {
                if (c.school && c.school_id && c.school_id !== 'NA' && c.school_id.trim() !== '' && c.school.en && c.school.zh && !schoolMap.has(c.school_id)) {
                    schoolMap.set(c.school_id, c.school);
                }
            });
            schoolMap.forEach((school, id) => {
                const option = new Option(isChinese() ? school.zh : school.en, id);
                schoolSelect.add(option);
            });
            updateSchoolSelectLanguage();
        }
        
        function loadCoursesForSchool(schoolId) {
            courseSelect.options.length = 1;
            courseSelect.disabled = !schoolId;
            if (!schoolId) return;
            availableCourses.filter(c => c.school_id === schoolId).forEach(c => {
                const text = isChinese() ? `${c.name.zh} (${c.code})` : `${c.name.en} (${c.code})`;
                const option = new Option(text, c.id);
                courseSelect.add(option);
            });
            updateCourseSelectLanguage();
        }
        
        function updateSchoolSelectLanguage() {
            const isZh = isChinese();
            Array.from(schoolSelect.options).forEach(opt => {
                if (opt.value === "") {
                    opt.textContent = isZh ? "請選擇學校" : "Please select a school";
                } else {
                    const course = availableCourses.find(c => c.school_id === opt.value);
                    if (course) opt.textContent = isZh ? course.school.zh : course.school.en;
                }
            });
        }
        
        function updateCourseSelectLanguage() {
            const isZh = isChinese();
            Array.from(courseSelect.options).forEach(opt => {
                if (opt.value === "") {
                    opt.textContent = isZh ? "請選擇一門課程" : "Please select a course";
                } else {
                    const course = availableCourses.find(c => c.id === opt.value);
                    if (course) opt.textContent = isZh ? `${course.name.zh} (${course.code})` : `${course.name.en} (${course.code})`;
                }
            });
        }
    
        // 自定義彈窗功能
        function createModal() {
            const modal = document.createElement('div');
            modal.className = 'custom-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title"></h3>
                    </div>
                    <div class="modal-body">
                        <p class="modal-message"></p>
                        <div class="modal-input-container">
                            <input type="password" class="modal-input" maxlength="20" />
                            <button type="button" class="modal-toggle-password" title="顯示/隱藏密碼">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <div class="modal-error"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn modal-btn-secondary" data-action="cancel">
                            <span class="lang-en">Cancel</span>
                            <span class="lang-zh">取消</span>
                        </button>
                        <button class="modal-btn modal-btn-primary" data-action="confirm">
                            <span class="lang-en">Confirm</span>
                            <span class="lang-zh">確認</span>
                        </button>
                    </div>
                </div>
            `;
            
            document.body.style.overflow = 'hidden';
            document.body.appendChild(modal);
            
            modal.cleanup = function() {
                document.body.style.overflow = '';
            };
            
            return modal;
        }

        function showAccessCodeModal() {
            return new Promise((resolve) => {
                const modal = createModal();
                const titleEl = modal.querySelector('.modal-title');
                const messageEl = modal.querySelector('.modal-message');
                const inputEl = modal.querySelector('.modal-input');
                const toggleBtn = modal.querySelector('.modal-toggle-password');
                const errorEl = modal.querySelector('.modal-error');
                const cancelBtn = modal.querySelector('[data-action="cancel"]');
                const confirmBtn = modal.querySelector('[data-action="confirm"]');

                titleEl.innerHTML = isChinese() ? '🔐 輸入查詢代碼' : '🔐 Enter Access Code';
                messageEl.innerHTML = isChinese() 
                    ? '請輸入六位數查詢代碼 (由大小寫英文字母和數字組成)' 
                    : 'Please enter the 6-digit access code (consisting of uppercase/lowercase letters and numbers)';
                inputEl.placeholder = '＊＊＊＊＊＊';

                let isPasswordVisible = false;
                toggleBtn.addEventListener('click', () => {
                    isPasswordVisible = !isPasswordVisible;
                    const iconEl = toggleBtn.querySelector('i');
                    if (isPasswordVisible) {
                        inputEl.type = 'text';
                        iconEl.className = 'fas fa-eye-slash';
                        toggleBtn.title = isChinese() ? '隱藏密碼' : 'Hide password';
                    } else {
                        inputEl.type = 'password';
                        iconEl.className = 'fas fa-eye';
                        toggleBtn.title = isChinese() ? '顯示密碼' : 'Show password';
                    }
                });

                setTimeout(() => modal.classList.add('show'), 10);
                inputEl.focus();

                inputEl.addEventListener('input', () => {
                    const value = inputEl.value;
                    const isValidStudentCode = validateAccessCode(value);
                    const isValidAdminCode = value.startsWith('ADMIN_');
                    
                    if (value.length > 0 && !isValidStudentCode && !isValidAdminCode) {
                        errorEl.textContent = isChinese() 
                            ? '格式錯誤！請輸入6位英文字母和數字，或管理者代碼' 
                            : 'Invalid format! Please enter 6 letters and numbers, or admin code';
                        errorEl.style.display = 'block';
                        confirmBtn.disabled = true;
                        confirmBtn.style.opacity = '0.5';
                    } else {
                        errorEl.style.display = 'none';
                        confirmBtn.disabled = false;
                        confirmBtn.style.opacity = '1';
                    }
                });

                inputEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const value = inputEl.value;
                        if (validateAccessCode(value) || value.startsWith('ADMIN_')) {
                            confirmBtn.click();
                        }
                    }
                });

                cancelBtn.addEventListener('click', () => {
                    modal.classList.remove('show');
                    setTimeout(() => {
                        modal.cleanup();
                        modal.remove();
                    }, 300);
                    resolve(null);
                });

                confirmBtn.addEventListener('click', () => {
                    const code = inputEl.value.trim();
                    if (validateAccessCode(code) || code.startsWith('ADMIN_')) {
                        modal.classList.remove('show');
                        setTimeout(() => {
                            modal.cleanup();
                            modal.remove();
                        }, 300);
                        resolve(code);
                    }
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        cancelBtn.click();
                    }
                });
            });
        }

        function showAlert(message, isError = false) {
            return new Promise((resolve) => {
                const modal = createModal();
                const titleEl = modal.querySelector('.modal-title');
                const messageEl = modal.querySelector('.modal-message');
                const inputEl = modal.querySelector('.modal-input');
                const toggleBtn = modal.querySelector('.modal-toggle-password');
                const errorEl = modal.querySelector('.modal-error');
                const cancelBtn = modal.querySelector('[data-action="cancel"]');
                const confirmBtn = modal.querySelector('[data-action="confirm"]');

                inputEl.style.display = 'none';
                toggleBtn.style.display = 'none';
                errorEl.style.display = 'none';
                cancelBtn.style.display = 'none';

                titleEl.innerHTML = isError 
                    ? (isChinese() ? '❌ 錯誤' : '❌ Error')
                    : (isChinese() ? '✅ 提示' : '✅ Notice');
                messageEl.textContent = message;
                messageEl.style.textAlign = 'center';

                if (isError) {
                    messageEl.style.color = '#ff6b6b';
                }

                setTimeout(() => modal.classList.add('show'), 10);
                confirmBtn.focus();

                confirmBtn.innerHTML = isChinese() ? '確定' : 'OK';
                confirmBtn.addEventListener('click', () => {
                    modal.classList.remove('show');
                    setTimeout(() => {
                        modal.cleanup();
                        modal.remove();
                    }, 300);
                    resolve();
                });

                document.addEventListener('keydown', function enterHandler(e) {
                    if (e.key === 'Enter') {
                        document.removeEventListener('keydown', enterHandler);
                        confirmBtn.click();
                    }
                });

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        confirmBtn.click();
                    }
                });
            });
        }

        // 驗證函數
        function validateAccessCode(code) {
            const codeRegex = /^[a-zA-Z0-9]{6}$/;
            return codeRegex.test(code);
        }

        function validateStudentId(studentId) {
            if (studentId === 'YCCADMIN') return true;
            const format1 = /^S[0-9]{8}$/;
            const format2 = /^[0-9]{9}$/;
            const format3 = /^[A-Z][0-9]{8}$/;
            const format4 = /^[0-9]{3}[A-Z]{0,2}[0-9]{3,5}$/;
            return format1.test(studentId) || format2.test(studentId) || format3.test(studentId) || format4.test(studentId);
        }

        // 查詢相關函數
        async function performSearch() {
            adminControlsContainer.style.display = 'none';
            chartContainer.style.display = 'none';
            if (gradeChart) {
                gradeChart.destroy();
                gradeChart = null;
            }

            const courseId = courseSelect.value;
            const studentId = studentIdInput.value.trim().toUpperCase();

            if (!courseId || !studentId) {
                await showAlert(isChinese() ? '請選擇課程並輸入學號。' : 'Please select a course and enter your Student ID.', true);
                return;
            }

            if (!validateStudentId(studentId)) {
                await showAlert(isChinese() 
                    ? '學號格式錯誤！請輸入有效的學號格式。' 
                    : 'Invalid Student ID format! Please enter a valid Student ID.', true);
                return;
            }
            
            showLoading(true);
            const studentExists = await checkStudentExists(courseId, studentId);
            showLoading(false);
            
            if (!studentExists) {
                await showAlert(isChinese() 
                    ? '找不到該學號的資料。請確認學號是否正確。' 
                    : 'No data found for this Student ID.Please verify the Student ID.', true);
                return;
            }

            const accessCode = await showAccessCodeModal();
            if (accessCode === null) return;

            if (studentId === 'YCCADMIN') {
                const isAdminMode = await checkAdminCode(courseId, accessCode);
                if (isAdminMode) {
                    await showAllGrades(courseId);
                    return;
                } else {
                    await showAlert(isChinese() 
                        ? '管理者代碼錯誤！請確認您輸入的代碼是否正確。' 
                        : 'Admin code is incorrect! Please verify the code you entered.', true);
                    return;
                }
            }
            
            if (!validateAccessCode(accessCode)) {
                await showAlert(isChinese() 
                    ? '代碼格式錯誤！請輸入六位由大小寫英文字母和數字組成的代碼。' 
                    : 'Invalid code format! Please enter a 6-character code consisting of uppercase/lowercase letters and numbers.', true);
                return;
            }
    
            hideAllResults();
            showLoading(true);
    
            try {
                await waitForPapaParse();
                
                const selectedCourse = availableCourses.find(c => c.id === courseId);
                if (!selectedCourse) throw new Error('Course not found');
                
                const csvPath = selectedCourse.csv_path;
                const response = await fetch(csvPath);
                if (!response.ok) throw new Error(`Could not load grade file: ${csvPath} (Status: ${response.status})`);
                
                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async (results) => {
                        await processGradeData(results.data, studentId, selectedCourse, accessCode);
                    },
                    error: (error) => { throw new Error('Failed to parse CSV file.'); }
                });
    
            } catch (error) {
                console.error('Search failed:', error);
                noResultsMessage.style.display = 'block';
                await showAlert(isChinese() ? `查詢失敗：${error.message}` : `Search failed: ${error.message}`, true);
            } finally {
                showLoading(false);
            }
        }

        async function checkStudentExists(courseId, studentId) {
            try {
                await waitForPapaParse();
                
                const selectedCourse = availableCourses.find(c => c.id === courseId);
                if (!selectedCourse) throw new Error('Course not found');
                
                const csvPath = selectedCourse.csv_path;
                const response = await fetch(csvPath);
                if (!response.ok) throw new Error(`Could not load grade file: ${csvPath}`);
                
                const csvText = await response.text();
                
                return new Promise((resolve) => {
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            const studentRows = results.data.slice(3);
                            const studentData = studentRows.find(row => row.ID && row.ID.toUpperCase() === studentId);
                            resolve(!!studentData);
                        },
                        error: () => { resolve(false); }
                    });
                });
                
            } catch (error) {
                console.error('Error checking student existence:', error);
                return false;
            }
        }

        async function checkAdminCode(courseId, accessCode) {
            try {
                await waitForPapaParse();
                
                const selectedCourse = availableCourses.find(c => c.id === courseId);
                if (!selectedCourse) return false;
                
                const csvPath = selectedCourse.csv_path;
                const response = await fetch(csvPath);
                if (!response.ok) return false;
                
                const csvText = await response.text();
                
                return new Promise((resolve) => {
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: (results) => {
                            const studentRows = results.data.slice(3);
                            const adminRow = studentRows.find(row => row.ID && row.ID.toUpperCase() === 'YCCADMIN');
                            
                            if (adminRow) {
                                const adminCode = adminRow.Code || adminRow.code;
                                resolve(adminCode === accessCode);
                            } else {
                                resolve(false);
                            }
                        },
                        error: () => { resolve(false); }
                    });
                });
                
            } catch (error) {
                console.error('Error checking admin code:', error);
                return false;
            }
        }

        function waitForPapaParse(timeout = 1000) {
            return new Promise((resolve, reject) => {
                if (typeof Papa !== 'undefined' && typeof Papa.parse === 'function') {
                    resolve();
                    return;
                }
                setTimeout(() => {
                    if (typeof Papa !== 'undefined' && typeof Papa.parse === 'function') {
                        resolve();
                    } else {
                        reject(new Error('Papa Parse library is not available.'));
                    }
                }, 100);
            });
        }

        async function processGradeData(data, studentId, courseInfo, accessCode) {
            const config = {};
            const configRows = data.slice(0, 4); 
            const headers = Object.keys(data[0] || {});

            headers.forEach(h => { config[h] = {}; });
            configRows.forEach(row => {
                const keyName = row.ID; 
                if (keyName) {
                    headers.forEach(h => {
                        if (h !== 'ID') {
                            config[h][keyName] = row[h];
                        }
                    });
                }
            });

            const studentRows = data.slice(4); 
            const studentData = studentRows.find(row => row.ID && row.ID.toUpperCase() === studentId);

            if (!studentData) {
                noResultsMessage.style.display = 'block';
                await showAlert(isChinese() ? '找不到該學號的資料。' : 'No data found for this Student ID.', true);
                return;
            }

            const studentAccessCode = studentData.Code || studentData.code;
            if (!studentAccessCode || studentAccessCode !== accessCode) {
                await showAlert(isChinese() 
                    ? '查詢代碼錯誤！請確認您輸入的代碼是否正確。' 
                    : 'Access code is incorrect! Please verify the code you entered.', true);
                return;
            }

            renderResults(studentData, config, courseInfo);
            resultsContainer.style.display = 'block';
        }

        function renderResults(student, config, courseInfo) {
            document.querySelector('.grade-summary-cards').style.display = 'grid';
            
            const gradeDetailsSection = document.querySelector('.grade-details');
            const gradeDetailsTitle = gradeDetailsSection.querySelector('h3');
            if (gradeDetailsTitle) gradeDetailsTitle.style.display = 'block';
            
            const thead = gradeDetailsSection.querySelector('thead');
            if (thead) thead.style.display = 'table-header-group';
            
            const tfoot = gradeDetailsSection.querySelector('tfoot');
            if (tfoot) tfoot.style.display = 'table-footer-group';
            
            const bonusCard = document.getElementById('card-bonus');
            if (bonusCard) {
                const cardTitle = bonusCard.querySelector('h3');
                if (cardTitle) {
                    cardTitle.innerHTML = '<span class="lang-en">Bonus</span><span class="lang-zh">額外加分</span>';
                }
                bonusCard.classList.remove('final-avg');
                bonusCard.classList.add('bonus');
            }
            
            resultCourseName.innerHTML = `<span class="lang-en">${courseInfo.name.en}</span><span class="lang-zh">${courseInfo.name.zh}</span>`;
            resultCourseCode.textContent = courseInfo.code;
            resultStudentId.textContent = student.ID;
            gradeDetailsBody.innerHTML = '';
    
            const categoryTotals = { assignments: 0, dailyPerformance: 0, attendance: 0, midterm: 0, final: 0 };
            const categoryWeights = { assignments: 0, dailyPerformance: 0, attendance: 0, midterm: 0, final: 0 };
            let totalBonus = 0;
            let subtotal = 0;
    
            Object.keys(student).forEach(key => {
                if (key === 'ID' || key === 'Code' || key === 'code' || !config[key] || !config[key].category) return;
    
                const displayName = getDisplayName(key);
                if (!displayName) return;
                
                const score = parseFloat(student[key]) || 0;
                const weight = parseFloat(config[key].weight) || 0;
                const category = config[key].category;
                
                if (category === 'code') return;
                
                const weightedScore = score * weight;
                
                if (category !== 'bonus') {
                    subtotal += weightedScore;
                    if (category in categoryTotals) {
                        categoryTotals[category] += weightedScore;
                        categoryWeights[category] += weight;
                    }
                } else {
                    totalBonus += score;
                }
    
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${displayName}</td>
                    <td>${score.toFixed(1)}</td>
                    <td>${(weight * 100).toFixed(0)}%</td>
                    <td>${weightedScore.toFixed(2)}</td>
                `;
                gradeDetailsBody.appendChild(row);
            });
    
            Object.keys(summaryCards).forEach(cat => {
                if (summaryCards[cat]) {
                    if (cat === 'bonus') {
                        summaryCards[cat].textContent = totalBonus.toFixed(1);
                    } else if (categoryWeights[cat] > 0) {
                        const categoryAverage = (categoryTotals[cat] / categoryWeights[cat]);
                        summaryCards[cat].textContent = categoryAverage.toFixed(1);
                    } else {
                        summaryCards[cat].textContent = '--';
                    }
                }
            });
    
            subtotalScoreEl.textContent = subtotal.toFixed(2);
            bonusScoreEl.textContent = `+${totalBonus.toFixed(2)}`;
            const finalScore = Math.min(100, subtotal + totalBonus);
            finalTotalScoreEl.textContent = finalScore.toFixed(2);
        }

        function updateDynamicLanguage() {
            updateSchoolSelectLanguage();
            updateCourseSelectLanguage();
            const isZh = isChinese();
            if (studentIdInput) {
                 studentIdInput.placeholder = isZh ? studentIdInput.dataset.placeholderZh : studentIdInput.dataset.placeholderEn;
            }
        }

        // 在您現有的 grades.js 檔案中，在 renderResults 函數之後添加以下缺少的函數：

        // ===== 補上缺少的管理者功能 =====
        
        async function showAllGrades(courseId) {
            hideAllResults();
            showLoading(true);
    
            try {
                await waitForPapaParse();
                const selectedCourse = availableCourses.find(c => c.id === courseId);
                if (!selectedCourse) throw new Error('Course not found');
                
                const csvPath = selectedCourse.csv_path;
                const response = await fetch(csvPath);
                if (!response.ok) throw new Error(`Could not load grade file: ${csvPath}`);
                
                const csvText = await response.text();
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: async (results) => {
                        await renderAllGrades(results.data, selectedCourse);
                    },
                    error: (error) => { throw new Error('Failed to parse CSV file.'); }
                });
    
            } catch (error) {
                console.error('Show all grades failed:', error);
                await showAlert(isChinese() ? `查詢失敗：${error.message}` : `Search failed: ${error.message}`, true);
            } finally {
                showLoading(false);
            }
        }

        async function renderAllGrades(data, courseInfo) {
            const config = {};
            const configRows = data.slice(0, 4);
            const headers = Object.keys(data[0] || {});

            headers.forEach(h => { config[h] = {}; });
            configRows.forEach(row => {
                const keyName = row.ID;
                if (keyName) {
                    headers.forEach(h => {
                        if (h !== 'ID') {
                            config[h][keyName] = row[h];
                        }
                    });
                }
            });

            const studentRows = data.slice(4).filter(row => 
                row.ID && row.ID.toUpperCase() !== 'YCCADMIN'
            );

            resultCourseName.innerHTML = `<span class="lang-en">${courseInfo.name.en}</span><span class="lang-zh">${courseInfo.name.zh}</span>`;
            resultCourseCode.textContent = courseInfo.code;
            resultStudentId.innerHTML = `<span class="lang-en">All Students (Admin View)</span><span class="lang-zh">全班成績 (管理者檢視)</span>`;

            const categoryWeights = {};
            headers.forEach(h => {
                if (h !== 'ID' && config[h] && config[h].category && config[h].category !== 'code') {
                    const category = config[h].category;
                    const weight = parseFloat(config[h].weight) || 0;
                    if (!categoryWeights[category]) {
                        categoryWeights[category] = 0;
                    }
                    categoryWeights[category] += weight;
                }
            });

            const cardsContainer = document.querySelector('.grade-summary-cards');
            cardsContainer.style.display = 'grid';
            
            const allCards = cardsContainer.querySelectorAll('.card');
            allCards.forEach(card => card.style.display = 'none');
            
            let bonusTotal = 0;
            let finalScoreTotal = 0;
            let studentCount = 0;
            
            studentRows.forEach(student => {
                if (!student.ID) return;
                let studentBonusTotal = 0;
                let studentFinalScoreTotal = 0;
                let finalScoreWeight = 0;
                
                headers.forEach(h => {
                    if (h !== 'ID' && config[h] && config[h].category && config[h].category !== 'code') {
                        const score = parseFloat(student[h]) || 0;
                        const weight = parseFloat(config[h].weight) || 0;
                        const category = config[h].category;
                        
                        if (category === 'bonus') {
                            studentBonusTotal += score;
                        } else if (category === 'final') {
                            studentFinalScoreTotal += score * weight;
                            finalScoreWeight += weight;
                        }
                    }
                });
                
                bonusTotal += studentBonusTotal;
                if (finalScoreWeight > 0) {
                    finalScoreTotal += (studentFinalScoreTotal / finalScoreWeight);
                }
                studentCount++;
            });
            
            const finalScoreAverage = studentCount > 0 ? (finalScoreTotal / studentCount) : 0;

            const cardMappings = {
                'assignments': 'card-assignments',
                'dailyPerformance': 'card-daily-performance', 
                'attendance': 'card-attendance',
                'midterm': 'card-midterm',
                'final': 'card-final'
            };
            
            Object.keys(cardMappings).forEach(category => {
                const cardId = cardMappings[category];
                const card = document.getElementById(cardId);
                if (card && categoryWeights[category] > 0) {
                    card.style.display = 'block';
                    const scoreElement = card.querySelector('.score .value');
                    if (scoreElement) {
                        const percentage = (categoryWeights[category] * 100).toFixed(0);
                        scoreElement.textContent = `${percentage}%`;
                    }
                    const scoreContainer = card.querySelector('.score');
                    if (scoreContainer) {
                        scoreContainer.innerHTML = `<span class="value">${(categoryWeights[category] * 100).toFixed(0)}%</span>`;
                    }
                }
            });

            const bonusCard = document.getElementById('card-bonus');
            if (bonusCard) {
                bonusCard.style.display = 'block';
                const cardTitle = bonusCard.querySelector('h3');
                if (cardTitle) {
                    cardTitle.innerHTML = '<span class="lang-en">Final Avg</span><span class="lang-zh">期末平均</span>';
                }
                const scoreContainer = bonusCard.querySelector('.score');
                if (scoreContainer) {
                    const avgLabel = isChinese() ? '平均' : 'AVG';
                    scoreContainer.innerHTML = `<span class="value">${finalScoreAverage.toFixed(1)}</span> <small>(${avgLabel})</small>`;
                }
                bonusCard.classList.remove('bonus');
                bonusCard.classList.add('final-avg');
            }
            
            const gradeDetailsSection = document.querySelector('.grade-details');
            const gradeDetailsTitle = gradeDetailsSection.querySelector('h3');
            if (gradeDetailsTitle) gradeDetailsTitle.style.display = 'none';
            
            const thead = gradeDetailsSection.querySelector('thead');
            if (thead) thead.style.display = 'none';
            
            const tfoot = gradeDetailsSection.querySelector('tfoot');
            if (tfoot) tfoot.style.display = 'none';

            gradeDetailsBody.innerHTML = '';
            
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `
                <th><span class="lang-en">Rank</span><span class="lang-zh">排名</span></th>
                <th><span class="lang-en">Student ID</span><span class="lang-zh">學號</span></th>
                <th><span class="lang-en">Assignments</span><span class="lang-zh">平時成績</span></th>
                <th><span class="lang-en">Daily Performance</span><span class="lang-zh">日常表現</span></th>
                <th><span class="lang-en">Attendance</span><span class="lang-zh">點名</span></th>
                <th><span class="lang-en">Midterm</span><span class="lang-zh">期中</span></th>
                <th><span class="lang-en">Final</span><span class="lang-zh">期末</span></th>
                <th><span class="lang-en">Bonus</span><span class="lang-zh">加分</span></th>
                <th><span class="lang-en">Final Score</span><span class="lang-zh">總分</span></th>
            `;
            gradeDetailsBody.appendChild(headerRow);

            const studentDataForProcessing = studentRows.map(student => {
                if (!student.ID) return null;

                const categoryScores = { assignments: 0, dailyPerformance: 0, attendance: 0, midterm: 0, final: 0, bonus: 0 };
                const categoryWeightedScores = { assignments: 0, dailyPerformance: 0, attendance: 0, midterm: 0, final: 0 };

                headers.forEach(h => {
                    if (h !== 'ID' && config[h] && config[h].category && config[h].category !== 'code') {
                        const score = parseFloat(student[h]) || 0;
                        const weight = parseFloat(config[h].weight) || 0;
                        const category = config[h].category;
                        
                        if (category === 'bonus') {
                            categoryScores.bonus += score;
                        } else if (categoryScores.hasOwnProperty(category)) {
                            categoryWeightedScores[category] += score * weight;
                        }
                    }
                });

                Object.keys(categoryWeightedScores).forEach(category => {
                    if (categoryWeights[category] > 0) {
                        categoryScores[category] = categoryWeightedScores[category] / categoryWeights[category];
                    }
                });

                const subtotal = Object.values(categoryWeightedScores).reduce((sum, score) => sum + score, 0);
                const finalScore = Math.min(100, subtotal + categoryScores.bonus);

                return { id: student.ID, ...categoryScores, finalScore: finalScore };
            }).filter(student => student !== null);

            studentDataForProcessing.sort((a, b) => b.finalScore - a.finalScore);
            
            studentDataForProcessing.forEach((student, index) => {
                const rank = index + 1;
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>#${rank}</strong></td>
                    <td><strong>${student.id}</strong></td>
                    <td>${student.assignments.toFixed(1)}</td>
                    <td>${student.dailyPerformance.toFixed(1)}</td>
                    <td>${student.attendance.toFixed(1)}</td>
                    <td>${student.midterm.toFixed(1)}</td>
                    <td>${student.final.toFixed(1)}</td>
                    <td>+${student.bonus.toFixed(1)}</td>
                    <td><strong style="color: var(--tech-cyan);">${student.finalScore.toFixed(2)}</strong></td>
                `;
                gradeDetailsBody.appendChild(row);
            });

            const categoryAverages = { assignments: 0, dailyPerformance: 0, attendance: 0, midterm: 0, final: 0, bonus: 0, finalScore: 0 };
            studentDataForProcessing.forEach(student => {
                Object.keys(categoryAverages).forEach(category => {
                    categoryAverages[category] += student[category] || 0;
                });
            });
            if (studentDataForProcessing.length > 0) {
                Object.keys(categoryAverages).forEach(category => {
                    categoryAverages[category] = categoryAverages[category] / studentDataForProcessing.length;
                });
            }

            const classAverageRow = document.createElement('tr');
            classAverageRow.classList.add('class-average-row');
            classAverageRow.innerHTML = `
                <td colspan="2" style="text-align: center;"><strong><span class="lang-en">Class Average</span><span class="lang-zh">班級平均</span></strong></td>
                <td><strong>${categoryAverages.assignments.toFixed(1)}</strong></td>
                <td><strong>${categoryAverages.dailyPerformance.toFixed(1)}</strong></td>
                <td><strong>${categoryAverages.attendance.toFixed(1)}</strong></td>
                <td><strong>${categoryAverages.midterm.toFixed(1)}</strong></td>
                <td><strong>${categoryAverages.final.toFixed(1)}</strong></td>
                <td><strong>+${categoryAverages.bonus.toFixed(1)}</strong></td>
                <td><strong style="color: var(--tech-cyan);">${categoryAverages.finalScore.toFixed(2)}</strong></td>
            `;
            gradeDetailsBody.appendChild(classAverageRow);

            // 儲存資料並設置圖表UI
            currentStudentDataForChart = studentDataForProcessing;
            setupAdminUI();

            resultsContainer.style.display = 'block';
        }

        // ===== 圖表相關功能 =====
        
        function setupAdminUI() {
            adminControlsContainer.style.display = 'flex';
            chartCheckboxes.forEach(cb => cb.checked = false);
            
            // 獲取全選和清除選擇按鈕
            const selectAllBtn = document.getElementById('select-all-options');
            const clearAllBtn = document.getElementById('clear-all-options');
            
            // 設置全選按鈕的點擊事件
            if (selectAllBtn) {
                selectAllBtn.onclick = function(event) {
                    event.stopPropagation();
                    chartCheckboxes.forEach(cb => cb.checked = true);
                    updateChart();
                };
            }
            
            // 設置清除選擇按鈕的點擊事件
            if (clearAllBtn) {
                clearAllBtn.onclick = function(event) {
                    event.stopPropagation();
                    chartCheckboxes.forEach(cb => cb.checked = false);
                    updateChart();
                };
            }
            
            if (chartOptionsBtn) {
                chartOptionsBtn.onclick = function(event) {
                    event.stopPropagation();
                    chartOptionsDropdown.classList.toggle('show');
                };
            }

            chartCheckboxes.forEach(checkbox => {
                checkbox.onchange = () => updateChart();
            });

            window.onclick = function(event) {
                if (!event.target.matches('.admin-btn, .admin-btn *')) {
                    if (chartOptionsDropdown.classList.contains('show')) {
                        chartOptionsDropdown.classList.remove('show');
                    }
                }
            };
        }

        function updateChart() {
            const checkedOptions = Array.from(chartCheckboxes)
                                        .filter(cb => cb.checked)
                                        .map(cb => ({ 
                                            value: cb.value, 
                                            label: isChinese() ? cb.parentElement.querySelector('.lang-zh').textContent.trim() : cb.parentElement.querySelector('.lang-en').textContent.trim()
                                        }));
            
            if (checkedOptions.length === 0) {
                chartContainer.style.display = 'none';
                if (gradeChart) {
                    gradeChart.destroy();
                    gradeChart = null;
                }
                return;
            }

            chartContainer.style.display = 'block';

            const labels = ['0~9', '10~19', '20~29', '30~39', '40~49', '50~59', '60-~69', '70~79', '80~89', '90~99+'];
            const datasets = [];
            const colors = ['#3fb950', '#58a6ff', '#f7b731', '#a371f7', '#f778ba', '#e85656'];

            checkedOptions.forEach((option, index) => {
                const distribution = Array(10).fill(0);
                
                currentStudentDataForChart.forEach(student => {
                    const score = student[option.value];
                    if (score >= 100) {
                        distribution[0]++;
                    } else if (score >= 0) {
                        const bucketIndex = 9 - Math.floor(score / 10);
                        distribution[bucketIndex]++;
                    }
                });

                datasets.push({
                    label: option.label,
                    data: distribution.reverse(),
                    backgroundColor: colors[index % colors.length],
                    borderColor: colors[index % colors.length].replace('0.7', '1'),
                    borderWidth: 1
                });
            });

            if (gradeChart) {
                gradeChart.destroy();
            }

            const ctx = document.getElementById('grade-distribution-chart').getContext('2d');
            gradeChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: isChinese() ? '成績分佈長條圖' : 'Grade Distribution Chart',
                            color: '#c9d1d9',
                            font: { size: 18 }
                        },
                        legend: {
                            labels: { color: '#c9d1d9' }
                        }
                    },
                    scales: {
                        x: {
                            title: { 
                                display: true, 
                                text: isChinese() ? '成績級距' : 'Score Range',
                                color: '#c9d1d9'
                            },
                            ticks: { color: '#c9d1d9' }
                        },
                        y: {
                            title: { 
                                display: true, 
                                text: isChinese() ? '人數' : 'Number of Students',
                                color: '#c9d1d9'
                            },
                            ticks: { 
                                color: '#c9d1d9',
                                stepSize: 1,
                                beginAtZero: true
                            }
                        }
                    }
                }
            });
        }
       
        // 事件監聽器
        schoolSelect.addEventListener('change', (e) => {
            loadCoursesForSchool(e.target.value);
            hideAllResults();
        });
        
        studentIdInput.addEventListener('input', (e) => {
            const studentId = e.target.value.trim().toUpperCase();
            const isValid = !studentId || validateStudentId(studentId);
            
            if (studentId && !isValid) {
                studentIdInput.classList.add('invalid');
                studentIdInput.title = isChinese() ? '學號格式不正確' : 'Invalid Student ID format';
            } else {
                studentIdInput.classList.remove('invalid');
                studentIdInput.title = '';
            }
        });
        
        searchBtn.addEventListener('click', performSearch);
        studentIdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        if (langToggleBtn) {
            langToggleBtn.addEventListener('click', () => {
                document.body.classList.toggle('show-zh');
                updateDynamicLanguage();
            });
        }
    
        // 頁面初始化
        loadCourses();
        const isZh = isChinese();
        if (studentIdInput) {
            studentIdInput.placeholder = isZh ? studentIdInput.dataset.placeholderZh : studentIdInput.dataset.placeholderEn;
        }
    })();

    
    
});