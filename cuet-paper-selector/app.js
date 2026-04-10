/**
 * CUET UG Paper Selector 2025
 * Application Logic
 */

// ===== Global State =====
let allCourses = [];
let filteredResults = [];
let currentSort = { field: null, direction: 'asc' };

// ===== DOM Elements =====
const elements = {
    universitySelect: document.getElementById('university-select'),
    courseSelect: document.getElementById('course-select'),
    categorySelect: document.getElementById('category-select'),
    streamSelect: document.getElementById('stream-select'),
    searchBtn: document.getElementById('search-btn'),
    resetBtn: document.getElementById('reset-btn'),
    tableSearch: document.getElementById('table-search'),
    resultsBody: document.getElementById('results-body'),
    resultsCount: document.getElementById('results-count'),
    tableContainer: document.querySelector('.table-container'),
    emptyState: document.getElementById('empty-state'),
    noResults: document.getElementById('no-results'),
    loadingState: document.getElementById('loading-state'),
    statUniversities: document.getElementById('stat-universities'),
    statCourses: document.getElementById('stat-courses'),
    statCategories: document.getElementById('stat-categories'),
    mobileCards: document.getElementById('mobile-cards'),
    resultCards: document.getElementById('result-cards'),
};

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', async () => {
    showLoading(true);
    
    try {
        await loadData();
        populateFilters();
        setupEventListeners();
        updateStats();
        showLoading(false);
        
        // Hide preloader after everything is loaded
        hidePreloader();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to load data. Please refresh the page.');
        hidePreloader();
    }
});

// ===== Preloader =====
function hidePreloader() {
    const preloader = document.getElementById('js-preloader');
    if (preloader) {
        preloader.classList.add('loaded');
    }
    
    // Initialize mobile menu after preloader
    initMobileMenu();
    initHeaderScroll();
}

// ===== Mobile Menu Toggle =====
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });
        
        // Close menu when clicking a nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                nav.classList.remove('active');
            });
        });
    }
}

// ===== Header Scroll Effect =====
function initHeaderScroll() {
    const header = document.querySelector('.header-area');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

// ===== Data Loading =====
async function loadData() {
    try {
        const response = await fetch('cuet-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allCourses = data.universities || [];
        console.log(`Loaded ${allCourses.length} courses`);
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// ===== Populate Filter Dropdowns =====
function populateFilters() {
    // Get unique universities with their short names
    const universities = [...new Map(
        allCourses.map(c => [c.university_name, {
            name: c.university_name,
            short: c.university_short,
            location: c.location
        }])
    ).values()].sort((a, b) => a.name.localeCompare(b.name));
    
    // Get unique courses (using standard_course_name)
    const courses = [...new Set(allCourses.map(c => c.standard_course_name))].sort();
    
    // Get unique categories
    const categories = [...new Set(allCourses.map(c => c.course_category))].sort();
    
    // Populate university dropdown
    universities.forEach(uni => {
        const option = document.createElement('option');
        option.value = uni.name;
        option.textContent = `${uni.name} (${uni.short})`;
        option.title = uni.location;
        elements.universitySelect.appendChild(option);
    });
    
    // Populate course dropdown
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        elements.courseSelect.appendChild(option);
    });
    
    // Populate category dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        elements.categorySelect.appendChild(option);
    });
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Search button
    elements.searchBtn.addEventListener('click', performSearch);
    
    // Reset button
    elements.resetBtn.addEventListener('click', resetFilters);
    
    // University change - update course options
    elements.universitySelect.addEventListener('change', updateCourseOptions);
    
    // Category change - update course options
    elements.categorySelect.addEventListener('change', updateCourseOptions);
    
    // Table search
    elements.tableSearch.addEventListener('input', debounce(filterTableResults, 300));
    
    // Sort buttons (still functional for table - kept for print)
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const field = btn.dataset.sort;
            handleSort(field);
        });
    });
    
    // Enter key to search
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('filter-select')) {
            performSearch();
        }
    });
}

// ===== Update Course Options Based on Selected Filters =====
function updateCourseOptions() {
    const selectedUniversity = elements.universitySelect.value;
    const selectedCategory = elements.categorySelect.value;
    
    // Filter courses based on selections
    let relevantCourses = allCourses;
    
    if (selectedUniversity) {
        relevantCourses = relevantCourses.filter(c => c.university_name === selectedUniversity);
    }
    
    if (selectedCategory) {
        relevantCourses = relevantCourses.filter(c => c.course_category === selectedCategory);
    }
    
    // Get unique courses (using standard_course_name)
    const courses = [...new Set(relevantCourses.map(c => c.standard_course_name))].sort();
    
    // Save current selection
    const currentSelection = elements.courseSelect.value;
    
    // Clear and repopulate
    elements.courseSelect.innerHTML = '<option value="">All Courses</option>';
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        elements.courseSelect.appendChild(option);
    });
    
    // Restore selection if still valid
    if (courses.includes(currentSelection)) {
        elements.courseSelect.value = currentSelection;
    }
}

// ===== Search / Filter Logic =====
function performSearch() {
    const selectedUniversity = elements.universitySelect.value;
    const selectedCourse = elements.courseSelect.value;
    const selectedCategory = elements.categorySelect.value;
    const selectedStream = elements.streamSelect.value;
    
    // Start with all courses
    filteredResults = [...allCourses];
    
    // Apply filters
    if (selectedUniversity) {
        filteredResults = filteredResults.filter(c => c.university_name === selectedUniversity);
    }
    
    if (selectedCourse) {
        filteredResults = filteredResults.filter(c => c.standard_course_name === selectedCourse);
    }
    
    if (selectedCategory) {
        filteredResults = filteredResults.filter(c => c.course_category === selectedCategory);
    }
    
    if (selectedStream) {
        filteredResults = filteredResults.filter(c => {
            const stream = c.stream_12th.toLowerCase();
            if (selectedStream === 'Any') {
                return stream === 'any' || stream.includes('any');
            }
            return stream === 'any' || 
                   stream.includes('any') || 
                   stream.toLowerCase().includes(selectedStream.toLowerCase());
        });
    }
    
    // Render results
    renderResults(filteredResults);
}

// ===== Render Results =====
function renderResults(results) {
    // Clear all result containers
    elements.resultsBody.innerHTML = '';
    elements.mobileCards.innerHTML = '';
    elements.resultCards.innerHTML = '';
    elements.tableSearch.value = '';
    
    // Update count
    updateResultsCount(results.length);
    
    // Handle empty results
    if (results.length === 0) {
        elements.tableContainer.classList.remove('visible');
        elements.emptyState.style.display = 'none';
        elements.noResults.style.display = 'block';
        return;
    }
    
    // Show results
    elements.tableContainer.classList.add('visible');
    elements.emptyState.style.display = 'none';
    elements.noResults.style.display = 'none';
    
    // Limit display for performance
    const displayResults = results.slice(0, 200);
    
    // Create cards (primary view) and table rows (for print)
    displayResults.forEach((course, index) => {
        // Table row (kept for print)
        const row = createResultRow(course, index);
        elements.resultsBody.appendChild(row);
        
        // Result card (primary view)
        const card = createResultCard(course, index);
        elements.resultCards.appendChild(card);
    });
    
    // Show warning if truncated
    if (results.length > 200) {
        const warningRow = document.createElement('tr');
        warningRow.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px; background: var(--color-warning-bg); color: var(--color-warning-dark);">
                <strong>Showing first 200 results.</strong> Use filters to narrow down your search.
            </td>
        `;
        elements.resultsBody.appendChild(warningRow);
        
        const warningCard = document.createElement('div');
        warningCard.className = 'result-cards-warning';
        warningCard.innerHTML = '<strong>Showing first 200 results.</strong> Use filters to narrow down your search.';
        elements.resultCards.appendChild(warningCard);
    }
}

// ===== Create Result Row (kept for print/accessibility) =====
function createResultRow(course, index) {
    const row = document.createElement('tr');
    row.style.animationDelay = `${index * 0.02}s`;
    
    // Format GT (General Test) requirement
    const gatClass = course.cuet_general_test_req?.toLowerCase() === 'yes' ? 'yes' : 'no';
    const gatText = course.cuet_general_test_req || 'Not specified';
    const gatIcon = gatClass === 'yes' ? '✔' : '✗';
    
    row.innerHTML = `
        <td>
            <div class="cell-university">${escapeHtml(course.university_name)}</div>
            <span class="cell-university-short">${escapeHtml(course.university_short)} • ${escapeHtml(course.location)}</span>
        </td>
        <td>
            <div class="cell-course">${escapeHtml(course.course_name)}</div>
            <span class="cell-category">${escapeHtml(course.course_category)}</span>
        </td>
        <td>${escapeHtml(course.cuet_language_req || 'Not specified')}</td>
        <td>${escapeHtml(course.cuet_domain_subjects_req || 'Not specified')}</td>
        <td><span class="cell-gat ${gatClass}">${gatIcon} ${escapeHtml(gatText)}</span></td>
        <td class="cell-stream">${escapeHtml(course.stream_12th || 'Any')}</td>
        <td class="cell-notes">${escapeHtml(course.comments || '-')}</td>
    `;
    
    return row;
}

// ===== SVG Icon Set =====
const ICONS = {
    language: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>',
    books: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    clipboard: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
    graduation: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>',
    notes: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    x: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
};

// ===== Create Result Card (primary view for all screens) =====
function createResultCard(course, index) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${Math.min(index * 0.04, 2)}s`;
    
    const gatClass = course.cuet_general_test_req?.toLowerCase() === 'yes' ? 'yes' : 'no';
    const gatText = course.cuet_general_test_req || 'Not specified';
    const gatIcon = gatClass === 'yes' ? ICONS.check : ICONS.x;
    const notes = course.comments || '';
    
    let notesHtml = '';
    if (notes && notes !== '-' && notes.trim()) {
        notesHtml = `
            <div class="card-notes">
                <div class="card-field-label"><span class="field-icon">${ICONS.notes}</span> Eligibility Notes</div>
                <div class="card-field-value">${escapeHtml(notes)}</div>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="card-header">
            <div class="card-university">${escapeHtml(course.university_name)}</div>
            <div class="card-university-meta">
                ${ICONS.pin}
                ${escapeHtml(course.university_short)} • ${escapeHtml(course.location)}
            </div>
            <div class="card-course">${escapeHtml(course.course_name)}</div>
            <span class="card-category-badge">${escapeHtml(course.course_category)}</span>
        </div>
        <div class="card-body">
            <div class="card-field">
                <div class="card-field-label"><span class="field-icon">${ICONS.language}</span> Language Paper</div>
                <div class="card-field-value">${escapeHtml(course.cuet_language_req || 'Not specified')}</div>
            </div>
            <div class="card-field">
                <div class="card-field-label"><span class="field-icon">${ICONS.books}</span> Domain Subjects</div>
                <div class="card-field-value">${escapeHtml(course.cuet_domain_subjects_req || 'Not specified')}</div>
            </div>
            <div class="card-inline-fields">
                <div class="card-inline-field">
                    <div class="card-field-label"><span class="field-icon">${ICONS.clipboard}</span> General Test</div>
                    <div class="card-field-value"><span class="gat-badge ${gatClass}">${gatIcon} ${escapeHtml(gatText)}</span></div>
                </div>
                <div class="card-inline-field">
                    <div class="card-field-label"><span class="field-icon">${ICONS.graduation}</span> 12th Stream</div>
                    <div class="card-field-value">${escapeHtml(course.stream_12th || 'Any')}</div>
                </div>
            </div>
        </div>
        ${notesHtml}
    `;
    
    return card;
}

// ===== Filter Table Results (In-table Search) =====
function filterTableResults() {
    const searchTerm = elements.tableSearch.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderResults(filteredResults);
        return;
    }
    
    const searchResults = filteredResults.filter(course => {
        return (
            course.university_name?.toLowerCase().includes(searchTerm) ||
            course.university_short?.toLowerCase().includes(searchTerm) ||
            course.standard_course_name?.toLowerCase().includes(searchTerm) ||
            course.course_name?.toLowerCase().includes(searchTerm) ||
            course.course_category?.toLowerCase().includes(searchTerm) ||
            course.cuet_domain_subjects_req?.toLowerCase().includes(searchTerm) ||
            course.cuet_language_req?.toLowerCase().includes(searchTerm) ||
            course.comments?.toLowerCase().includes(searchTerm)
        );
    });
    
    renderResults(searchResults);
}

// ===== Sorting =====
function handleSort(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    
    filteredResults.sort((a, b) => {
        let aVal, bVal;
        
        if (field === 'university') {
            aVal = a.university_name || '';
            bVal = b.university_name || '';
        } else if (field === 'course') {
            aVal = a.standard_course_name || '';
            bVal = b.standard_course_name || '';
        }
        
        const comparison = aVal.localeCompare(bVal);
        return currentSort.direction === 'asc' ? comparison : -comparison;
    });
    
    renderResults(filteredResults);
    updateSortIcons(field);
}

function updateSortIcons(activeField) {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        const icon = btn.querySelector('.sort-icon');
        if (btn.dataset.sort === activeField) {
            icon.textContent = currentSort.direction === 'asc' ? '↑' : '↓';
        } else {
            icon.textContent = '↕';
        }
    });
}

// ===== Reset Filters =====
function resetFilters() {
    elements.universitySelect.value = '';
    elements.courseSelect.value = '';
    elements.categorySelect.value = '';
    elements.streamSelect.value = '';
    elements.tableSearch.value = '';
    
    // Reset course dropdown to show all
    populateCourseDropdown(allCourses);
    
    // Reset display
    filteredResults = [];
    elements.tableContainer.classList.remove('visible');
    elements.mobileCards.innerHTML = '';
    elements.resultCards.innerHTML = '';
    elements.noResults.style.display = 'none';
    elements.emptyState.style.display = 'block';
    updateResultsCount(0, true);
}

function populateCourseDropdown(courses) {
    const uniqueCourses = [...new Set(courses.map(c => c.standard_course_name))].sort();
    elements.courseSelect.innerHTML = '<option value="">All Courses</option>';
    uniqueCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        elements.courseSelect.appendChild(option);
    });
}

// ===== Update Results Count =====
function updateResultsCount(count, reset = false) {
    if (reset) {
        elements.resultsCount.textContent = 'Select filters and click "Show CUET Papers" to see results';
        return;
    }
    
    if (count === 0) {
        elements.resultsCount.innerHTML = 'No matching programs found';
    } else if (count === 1) {
        elements.resultsCount.innerHTML = 'Found <strong>1</strong> matching program';
    } else {
        elements.resultsCount.innerHTML = `Found <strong>${count}</strong> matching programs`;
    }
}

// ===== Update Statistics =====
function updateStats() {
    const universities = new Set(allCourses.map(c => c.university_name));
    const categories = new Set(allCourses.map(c => c.course_category));
    
    elements.statUniversities.textContent = universities.size;
    elements.statCourses.textContent = allCourses.length;
    elements.statCategories.textContent = categories.size;
}

// ===== UI States =====
function showLoading(show) {
    elements.loadingState.style.display = show ? 'block' : 'none';
    elements.emptyState.style.display = show ? 'none' : 'block';
}

function showError(message) {
    elements.loadingState.innerHTML = `
        <div class="empty-icon">❌</div>
        <h3 class="empty-title">Error Loading Data</h3>
        <p class="empty-text">${message}</p>
    `;
}

// ===== Utility Functions =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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

// ===== Export for testing =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        performSearch,
        resetFilters,
        handleSort
    };
}
