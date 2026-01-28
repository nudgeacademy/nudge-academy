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
    
    // Sort buttons
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
    // Clear previous results
    elements.resultsBody.innerHTML = '';
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
    
    // Show table
    elements.tableContainer.classList.add('visible');
    elements.emptyState.style.display = 'none';
    elements.noResults.style.display = 'none';
    
    // Limit display for performance
    const displayResults = results.slice(0, 200);
    
    // Create rows
    displayResults.forEach((course, index) => {
        const row = createResultRow(course, index);
        elements.resultsBody.appendChild(row);
    });
    
    // Show warning if truncated
    if (results.length > 200) {
        const warningRow = document.createElement('tr');
        warningRow.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px; background: #fef3c7; color: #92400e;">
                <strong>Showing first 200 results.</strong> Use filters to narrow down your search.
            </td>
        `;
        elements.resultsBody.appendChild(warningRow);
    }
}

// ===== Create Result Row =====
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
