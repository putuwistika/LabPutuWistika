/**
 * KAWITAN v1.0 - Animation & Core Functions
 * Author: Putu Wistika
 * Description: Every Data Has a Story
 */

// ============================================
// ANIMATION INITIALIZATIONS
// ============================================

function initializeAnimations() {
    console.log('🎨 Initializing KAWITAN animations...');
    
    // Initialize particle effects
    createFloatingParticles();
    
    // Setup scroll animations
    setupScrollAnimations();
    
    // Setup hover effects
    setupHoverEffects();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize search combobox
    initializeSearchCombobox();
}

// ============================================
// SEARCH COMBOBOX FUNCTIONALITY
// ============================================

let availableDataSources = [];
let searchTimeout;

function initializeSearchCombobox() {
    const searchInput = document.getElementById('dataSourceSearch');
    const searchDropdown = document.getElementById('searchDropdown');
    
    if (!searchInput || !searchDropdown) return;
    
    // Input event for search
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterDataSources(e.target.value);
        }, 300);
    });
    
    // Focus event
    searchInput.addEventListener('focus', () => {
        if (availableDataSources.length > 0) {
            showSearchDropdown();
        }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-combobox')) {
            hideSearchDropdown();
        }
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        handleSearchKeyboard(e);
    });
}

function filterDataSources(query) {
    const searchDropdown = document.getElementById('searchDropdown');
    
    if (!query && availableDataSources.length > 0) {
        // Show all if no query
        populateSearchDropdown(availableDataSources);
        showSearchDropdown();
        return;
    }
    
    if (!query) {
        hideSearchDropdown();
        return;
    }
    
    // Filter sources
    const filtered = availableDataSources.filter(source => 
        source.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filtered.length > 0) {
        populateSearchDropdown(filtered, query);
        showSearchDropdown();
    } else {
        searchDropdown.innerHTML = `
            <div class="search-item" style="opacity: 0.5; cursor: default;">
                <i class="fas fa-info-circle search-item-icon"></i>
                <span class="search-item-text">No matching data sources found</span>
            </div>
        `;
        showSearchDropdown();
    }
}

function populateSearchDropdown(sources, query = '') {
    const searchDropdown = document.getElementById('searchDropdown');
    
    searchDropdown.innerHTML = sources.map(source => {
        const displayName = formatFileName(source);
        const highlighted = query ? highlightMatch(displayName, query) : displayName;
        
        return `
            <div class="search-item" data-value="${source}">
                <i class="fas fa-database search-item-icon"></i>
                <span class="search-item-text">${highlighted}</span>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    searchDropdown.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
            const value = item.dataset.value;
            if (value) {
                selectDataSource(value);
            }
        });
    });
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-item-match">$1</span>');
}

function selectDataSource(fileName) {
    const searchInput = document.getElementById('dataSourceSearch');
    searchInput.value = formatFileName(fileName);
    hideSearchDropdown();
    loadSelectedFile(fileName);
}

function showSearchDropdown() {
    const searchDropdown = document.getElementById('searchDropdown');
    searchDropdown.classList.add('show');
}

function hideSearchDropdown() {
    const searchDropdown = document.getElementById('searchDropdown');
    searchDropdown.classList.remove('show');
}

function handleSearchKeyboard(e) {
    const searchDropdown = document.getElementById('searchDropdown');
    const items = searchDropdown.querySelectorAll('.search-item[data-value]');
    const activeItem = searchDropdown.querySelector('.search-item.active');
    
    let currentIndex = -1;
    if (activeItem) {
        currentIndex = Array.from(items).indexOf(activeItem);
    }
    
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateActiveItem(items, currentIndex);
            }
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                updateActiveItem(items, currentIndex);
            }
            break;
            
        case 'Enter':
            e.preventDefault();
            if (activeItem && activeItem.dataset.value) {
                selectDataSource(activeItem.dataset.value);
            }
            break;
            
        case 'Escape':
            hideSearchDropdown();
            break;
    }
}

function updateActiveItem(items, index) {
    items.forEach(item => item.classList.remove('active'));
    if (items[index]) {
        items[index].classList.add('active');
        items[index].scrollIntoView({ block: 'nearest' });
    }
}

// ============================================
// ACTIVE DATA SOURCE INDICATOR
// ============================================

function updateActiveSourceIndicator(fileName) {
    const indicator = document.getElementById('activeSourceName');
    if (indicator) {
        if (fileName) {
            indicator.textContent = formatFileName(fileName);
            indicator.classList.remove('loading');
            
            // Animate the update
            indicator.style.animation = 'fadeInUp 0.5s ease';
            setTimeout(() => {
                indicator.style.animation = '';
            }, 500);
        } else {
            indicator.textContent = 'No source selected';
            indicator.classList.add('loading');
        }
    }
}

// ============================================
// WELCOME SCREEN MANAGEMENT
// ============================================

function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'flex';
        welcomeScreen.style.opacity = '1';
        
        // Reset to initial state (show button, hide search)
        const startBtn = document.getElementById('startExploringBtn');
        const searchContainer = document.getElementById('welcomeSearchContainer');
        if (startBtn) startBtn.style.display = 'inline-flex';
        if (searchContainer) searchContainer.style.display = 'none';
    }
}

function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
        }, 500);
    }
}

function showWelcomeSearch() {
    const startBtn = document.getElementById('startExploringBtn');
    const searchContainer = document.getElementById('welcomeSearchContainer');
    const searchInput = document.getElementById('welcomeDataSourceSearch');
    
    if (startBtn && searchContainer) {
        // Animate button out
        startBtn.style.opacity = '0';
        startBtn.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            startBtn.style.display = 'none';
            searchContainer.style.display = 'block';
            
            // Initialize welcome search
            initializeWelcomeSearch();
            
            // Focus and populate dropdown
            if (searchInput) {
                searchInput.focus();
                if (availableDataSources.length > 0) {
                    populateWelcomeDropdown(availableDataSources);
                    showWelcomeDropdown();
                }
            }
        }, 300);
    }
}

function initializeWelcomeSearch() {
    const searchInput = document.getElementById('welcomeDataSourceSearch');
    const searchDropdown = document.getElementById('welcomeSearchDropdown');
    
    if (!searchInput || !searchDropdown) return;
    
    // Remove old listeners
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    // Input event for search
    newSearchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterWelcomeDataSources(e.target.value);
        }, 300);
    });
    
    // Focus event
    newSearchInput.addEventListener('focus', () => {
        if (availableDataSources.length > 0) {
            populateWelcomeDropdown(availableDataSources);
            showWelcomeDropdown();
        }
    });
    
    // Keyboard navigation
    newSearchInput.addEventListener('keydown', (e) => {
        handleWelcomeSearchKeyboard(e);
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.welcome-search-box')) {
            hideWelcomeDropdown();
        }
    });
}

function filterWelcomeDataSources(query) {
    const searchDropdown = document.getElementById('welcomeSearchDropdown');
    
    if (!query && availableDataSources.length > 0) {
        populateWelcomeDropdown(availableDataSources);
        showWelcomeDropdown();
        return;
    }
    
    if (!query) {
        hideWelcomeDropdown();
        return;
    }
    
    const filtered = availableDataSources.filter(source => 
        source.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filtered.length > 0) {
        populateWelcomeDropdown(filtered, query);
        showWelcomeDropdown();
    } else {
        searchDropdown.innerHTML = `
            <div class="search-item" style="opacity: 0.5; cursor: default;">
                <i class="fas fa-info-circle search-item-icon"></i>
                <span class="search-item-text">No matching data sources found</span>
            </div>
        `;
        showWelcomeDropdown();
    }
}

function populateWelcomeDropdown(sources, query = '') {
    const searchDropdown = document.getElementById('welcomeSearchDropdown');
    
    searchDropdown.innerHTML = sources.map(source => {
        const displayName = formatFileName(source);
        const highlighted = query ? highlightMatch(displayName, query) : displayName;
        
        return `
            <div class="search-item" data-value="${source}">
                <i class="fas fa-database search-item-icon"></i>
                <span class="search-item-text">${highlighted}</span>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    searchDropdown.querySelectorAll('.search-item').forEach(item => {
        item.addEventListener('click', () => {
            const value = item.dataset.value;
            if (value) {
                selectWelcomeDataSource(value);
            }
        });
    });
}

function selectWelcomeDataSource(fileName) {
    // Update both search inputs
    const welcomeSearchInput = document.getElementById('welcomeDataSourceSearch');
    const headerSearchInput = document.getElementById('dataSourceSearch');
    
    if (welcomeSearchInput) {
        welcomeSearchInput.value = formatFileName(fileName);
    }
    if (headerSearchInput) {
        headerSearchInput.value = formatFileName(fileName);
    }
    
    hideWelcomeDropdown();
    
    // Load the file and hide welcome screen after successful load
    loadSelectedFile(fileName);
}

function showWelcomeDropdown() {
    const searchDropdown = document.getElementById('welcomeSearchDropdown');
    if (searchDropdown) {
        searchDropdown.classList.add('show');
    }
}

function hideWelcomeDropdown() {
    const searchDropdown = document.getElementById('welcomeSearchDropdown');
    if (searchDropdown) {
        searchDropdown.classList.remove('show');
    }
}

function handleWelcomeSearchKeyboard(e) {
    const searchDropdown = document.getElementById('welcomeSearchDropdown');
    const items = searchDropdown.querySelectorAll('.search-item[data-value]');
    const activeItem = searchDropdown.querySelector('.search-item.active');
    
    let currentIndex = -1;
    if (activeItem) {
        currentIndex = Array.from(items).indexOf(activeItem);
    }
    
    switch(e.key) {
        case 'ArrowDown':
            e.preventDefault();
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateActiveItem(items, currentIndex);
            }
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                updateActiveItem(items, currentIndex);
            }
            break;
            
        case 'Enter':
            e.preventDefault();
            if (activeItem && activeItem.dataset.value) {
                selectWelcomeDataSource(activeItem.dataset.value);
            }
            break;
            
        case 'Escape':
            hideWelcomeDropdown();
            break;
    }
}

// ============================================
// PARTICLE EFFECTS
// ============================================

function createFloatingParticles() {
    const particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) return;
    
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(0, 113, 227, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle ${Math.random() * 20 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }
}

// Add particle animation CSS
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes floatParticle {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

// ============================================
// SCROLL ANIMATIONS
// ============================================

function setupScrollAnimations() {
    let lastScrollTop = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header hide/show on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        // Add shadow on scroll
        if (scrollTop > 10) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
}

// ============================================
// HOVER EFFECTS
// ============================================

function setupHoverEffects() {
    // Button ripple effect
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = this.querySelector('.btn-ripple');
            if (ripple) {
                ripple.style.animation = 'none';
                setTimeout(() => {
                    ripple.style.animation = '';
                }, 10);
            }
        });
    });
    
    // Magnetic hover effect for FABs
    document.querySelectorAll('.fab').forEach(fab => {
        fab.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.1)`;
        });
        
        fab.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// ============================================
// TOOLTIPS
// ============================================

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[title]');
    
    tooltipElements.forEach(elem => {
        const originalTitle = elem.getAttribute('title');
        elem.removeAttribute('title');
        
        elem.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'custom-tooltip';
            tooltip.textContent = originalTitle;
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 0.5rem 0.75rem;
                border-radius: 8px;
                font-size: 0.875rem;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = elem.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);
            
            elem._tooltip = tooltip;
        });
        
        elem.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                const tooltip = this._tooltip;
                tooltip.style.opacity = '0';
                setTimeout(() => {
                    tooltip.remove();
                }, 300);
                delete this._tooltip;
            }
        });
    });
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Search input clear detection
    const searchInput = document.getElementById('dataSourceSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (e.target.value === '') {
                // Return to welcome screen when search is cleared
                showWelcomeScreen();
                updateActiveSourceIndicator(null);
                currentJsonData = null;
            }
        });
    }
    
    // Scan button
    const scanBtn = document.getElementById('scanBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            animateButton(scanBtn);
            scanJsonFolder();
        });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const icon = refreshBtn.querySelector('i');
            icon.style.animation = 'spin 1s ease';
            setTimeout(() => {
                icon.style.animation = '';
            }, 1000);
            refreshVisualization();
        });
    }
    
    // Fullscreen button
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', toggleFullscreen);
    }
    
    // FAB buttons - REMOVED (zoom controls no longer needed)
    
    // Notification close button
    document.querySelector('.notification-close')?.addEventListener('click', () => {
        hideNotification();
    });
    
    // Context menu
    setupContextMenu();
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
}

// ============================================
// BUTTON ANIMATIONS
// ============================================

function animateButton(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = '';
    }, 200);
}

function animateFab(fabId) {
    const fab = document.getElementById(fabId);
    if (fab) {
        fab.style.animation = 'fabPulse 0.5s ease';
        setTimeout(() => {
            fab.style.animation = '';
        }, 500);
    }
}

// Add FAB pulse animation
const fabPulseStyle = document.createElement('style');
fabPulseStyle.textContent = `
    @keyframes fabPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(fabPulseStyle);

// ============================================
// DATA LOADING FUNCTIONS
// ============================================

async function scanJsonFolder() {
    try {
        showLoading(true, 'Scanning data sources...');
        
        availableDataSources = []; // Reset array
        
        let fileList = [];
        
        try {
            const indexResponse = await fetch('json/index.json');
            if (indexResponse.ok) {
                const indexData = await indexResponse.json();
                fileList = indexData.files || [];
            }
        } catch (error) {
            console.log('Using fallback file list');
        }
        
        if (fileList.length === 0) {
            fileList = [
                'lineageGraph.json',
                'dataflow.json',
                'pipeline.json',
                'schema.json',
                'metadata.json',
                'relations.json',
                'workflow.json',
                'etl.json',
                'transform.json',
                'dependencies.json'
            ];
        }
        
        for (const fileName of fileList) {
            try {
                const testResponse = await fetch(`json/${fileName}`, { method: 'HEAD' });
                if (testResponse.ok) {
                    availableDataSources.push(fileName);
                }
            } catch (error) {
                // File doesn't exist
            }
        }
        
        if (availableDataSources.length > 0) {
            // Populate search dropdown initially
            populateSearchDropdown(availableDataSources);
            showNotification('success', 'Data Sources Found', `${availableDataSources.length} sources available`);
        } else {
            showNotification('warning', 'No Data Sources', 'No JSON files found');
        }
        
    } catch (error) {
        console.error('Error scanning:', error);
        showNotification('error', 'Scan Error', 'Failed to scan data sources');
    } finally {
        showLoading(false);
    }
}

async function loadSelectedFile(fileName) {
    try {
        showLoading(true, `Loading ${formatFileName(fileName)}...`);
        
        const response = await fetch(`json/${fileName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        currentJsonData = json;
        
        if (sqlflow) {
            sqlflow.visualizeJSON(json, { layout: true });
            
            // Update active source indicator
            updateActiveSourceIndicator(fileName);
            
            // Hide welcome screen
            hideWelcomeScreen();
            
            showNotification('success', 'Data Loaded', `${formatFileName(fileName)} loaded successfully`);
        }
    } catch (error) {
        showNotification('error', 'Load Error', `Failed to load ${fileName}`);
        console.error('Error loading file:', error);
        
        // Return to welcome screen on error
        showWelcomeScreen();
        updateActiveSourceIndicator(null);
    } finally {
        showLoading(false);
    }
}

async function loadDefaultData() {
    try {
        showLoading(true, 'Loading default visualization...');
        
        const response = await fetch('json/lineageGraph.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        currentJsonData = json;
        
        if (sqlflow) {
            sqlflow.visualizeJSON(json, { layout: true });
            
            // Update search input
            const searchInput = document.getElementById('dataSourceSearch');
            if (searchInput) {
                searchInput.value = formatFileName('lineageGraph.json');
            }
            
            // Update active source indicator
            updateActiveSourceIndicator('lineageGraph.json');
            
            // Hide welcome screen after loading
            hideWelcomeScreen();
        }
    } catch (error) {
        console.log('Default file not found, showing welcome screen');
        // Keep welcome screen visible
        showWelcomeScreen();
        updateActiveSourceIndicator(null);
    } finally {
        showLoading(false);
    }
}

function refreshVisualization() {
    if (currentJsonData && sqlflow) {
        showLoading(true, 'Refreshing visualization...');
        
        setTimeout(() => {
            sqlflow.visualizeJSON(currentJsonData, { layout: true });
            showNotification('success', 'Refreshed', 'Visualization updated successfully');
            showLoading(false);
        }, 500);
    } else {
        showNotification('warning', 'No Data', 'Please select a data source first');
        showWelcomeScreen();
    }
}

// ============================================
// UI HELPER FUNCTIONS
// ============================================

function showLoading(show, message = 'Loading...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingMessage = document.getElementById('loadingMessage');
    
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('active');
            if (loadingMessage) {
                loadingMessage.textContent = message;
            }
        } else {
            setTimeout(() => {
                loadingOverlay.classList.remove('active');
            }, 300);
        }
    }
}

function showNotification(type, title, message) {
    const notification = document.getElementById('notification');
    const icon = notification.querySelector('.notification-icon');
    const titleEl = notification.querySelector('.notification-title');
    const messageEl = notification.querySelector('.notification-message');
    
    // Clear existing timeout
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
    }
    
    // Remove all type classes
    notification.classList.remove('success', 'error', 'warning');
    
    // Add new type class
    notification.classList.add(type);
    
    // Update icon
    icon.className = 'notification-icon fas';
    switch(type) {
        case 'success':
            icon.classList.add('fa-check-circle');
            break;
        case 'error':
            icon.classList.add('fa-exclamation-circle');
            break;
        case 'warning':
            icon.classList.add('fa-exclamation-triangle');
            break;
    }
    
    // Update content
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Show notification with animation
    notification.classList.add('show');
    
    // Play notification sound (optional)
    playNotificationSound(type);
    
    // Auto hide after 4 seconds
    window.notificationTimeout = setTimeout(() => {
        hideNotification();
    }, 4000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('show');
}

function playNotificationSound(type) {
    // You can add sound effects here if desired
    // const audio = new Audio(`assets/sounds/${type}.mp3`);
    // audio.play().catch(e => console.log('Sound play failed:', e));
}

// ============================================
// STATS UPDATE - REMOVED (no longer needed)
// ============================================

// Function kept for backward compatibility but does nothing
function updateStats(stat, value) {
    // Stats removed per requirement
}

function updateCurrentTime() {
    // Time display removed per requirement
}

// ============================================
// FULLSCREEN MODE
// ============================================

function toggleFullscreen() {
    const container = document.querySelector('.sqlflow-container');
    const btn = document.getElementById('fullscreenBtn');
    const icon = btn.querySelector('i');
    
    if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => {
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
            container.classList.add('fullscreen-mode');
        }).catch(err => {
            console.error('Error entering fullscreen:', err);
            showNotification('error', 'Fullscreen Error', 'Could not enter fullscreen mode');
        });
    } else {
        document.exitFullscreen().then(() => {
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
            container.classList.remove('fullscreen-mode');
        });
    }
}

// Add fullscreen styles
const fullscreenStyle = document.createElement('style');
fullscreenStyle.textContent = `
    .sqlflow-container.fullscreen-mode {
        border-radius: 0;
        height: 100vh !important;
    }
`;
document.head.appendChild(fullscreenStyle);

// ============================================
// CONTEXT MENU
// ============================================

function setupContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    const sqlflowContainer = document.getElementById('sqlflow');
    
    if (sqlflowContainer && contextMenu) {
        sqlflowContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            
            contextMenu.style.display = 'block';
            contextMenu.style.left = `${e.pageX}px`;
            contextMenu.style.top = `${e.pageY}px`;
            
            // Adjust position if menu goes off screen
            const rect = contextMenu.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                contextMenu.style.left = `${e.pageX - rect.width}px`;
            }
            if (rect.bottom > window.innerHeight) {
                contextMenu.style.top = `${e.pageY - rect.height}px`;
            }
        });
        
        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });
    }
}

// Context menu actions
function exportData() {
    if (currentJsonData) {
        const dataStr = JSON.stringify(currentJsonData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportName = `kawitan-export-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
        
        showNotification('success', 'Export Complete', `Data exported as ${exportName}`);
    } else {
        showNotification('warning', 'No Data', 'No data to export');
    }
}

function shareView() {
    // Create shareable link (you can implement your own logic)
    const shareUrl = window.location.href;
    
    if (navigator.share) {
        navigator.share({
            title: 'KAWITAN - Data Visualization',
            text: 'Check out this data lineage visualization',
            url: shareUrl
        }).then(() => {
            showNotification('success', 'Shared', 'View shared successfully');
        }).catch(err => {
            console.log('Share failed:', err);
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('success', 'Link Copied', 'Share link copied to clipboard');
        });
    }
}

function resetView() {
    if (sqlflow) {
        sqlflow.resetView();
        showNotification('success', 'View Reset', 'Visualization reset to default view');
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + F: Fullscreen
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            toggleFullscreen();
        }
        
        // Ctrl/Cmd + R: Refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            refreshVisualization();
        }
        
        // Ctrl/Cmd + E: Export
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            exportData();
        }
        
        // Escape: Exit fullscreen
        if (e.key === 'Escape' && document.fullscreenElement) {
            document.exitFullscreen();
        }
        
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('dataSourceSearch');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatFileName(fileName) {
    const name = fileName.replace('.json', '');
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .trim();
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

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

function monitorPerformance() {
    if (window.performance && performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`📊 KAWITAN loaded in ${loadTime}ms`);
        
        // Report to analytics if needed
        if (loadTime > 3000) {
            console.warn('⚠️ Slow load detected:', loadTime + 'ms');
        }
    }
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
    console.error('Global error:', e);
    showNotification('error', 'System Error', 'An unexpected error occurred');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e);
    showNotification('error', 'System Error', 'An unexpected error occurred');
});

// ============================================
// INITIALIZATION CHECK
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check browser compatibility
    if (!window.fetch || !window.Promise) {
        alert('Your browser is not fully supported. Please use a modern browser for the best experience.');
    }
    
    // Monitor performance
    monitorPerformance();
    
    // Add loaded class to body for animations
    document.body.classList.add('loaded');
    
    console.log('✨ KAWITAN v1.0 - Ready');
    console.log('📝 Made with ❤️ by Putu Wistika');
    console.log('🌟 Every Data Has a Story');
});

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ============================================

window.KAWITAN = {
    version: '1.0',
    author: 'Putu Wistika',
    showNotification,
    showLoading,
    exportData,
    shareView,
    resetView,
    refreshVisualization,
    toggleFullscreen
};

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    showNotification('success', '🎉 Easter Egg Found!', 'You discovered the secret! Welcome to the Matrix of Data.');
    document.body.style.animation = 'matrixEffect 2s ease';
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 2000);
}

// Add matrix effect animation
const matrixStyle = document.createElement('style');
matrixStyle.textContent = `
    @keyframes matrixEffect {
        0%, 100% { filter: hue-rotate(0deg) saturate(1); }
        50% { filter: hue-rotate(180deg) saturate(2); }
    }
`;
document.head.appendChild(matrixStyle);

console.log('🚀 KAWITAN Animations Module Loaded Successfully!');