/**
 * StockPilot Simple Router
 * Tab-based navigation without history API
 */

import { $, $all, debugLog } from './utils.js';

class SimpleRouter {
  constructor() {
    this.currentTab = 'purchases';
    this.tabHandlers = new Map();
    this.init();
  }

  /**
   * Initialize router
   */
  init() {
    debugLog('Router initialized');
    this.bindTabEvents();
    this.showTab(this.currentTab);
  }

  /**
   * Bind tab click events
   */
  bindTabEvents() {
    const tabButtons = $all('.spa-nav-tab');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = button.getAttribute('data-tab');
        if (tabName) {
          this.navigateToTab(tabName);
        }
      });
    });
  }

  /**
   * Navigate to specific tab
   * @param {string} tabName - Tab name to navigate to
   */
  navigateToTab(tabName) {
    debugLog(`Navigating to tab: ${tabName}`);
    
    // Update active tab button
    this.updateActiveTabButton(tabName);
    
    // Show tab content
    this.showTab(tabName);
    
    // Call tab handler if registered
    const handler = this.tabHandlers.get(tabName);
    if (handler && typeof handler === 'function') {
      try {
        handler(tabName);
      } catch (error) {
        console.error(`Error in tab handler for ${tabName}:`, error);
      }
    }
    
    this.currentTab = tabName;
  }

  /**
   * Update active tab button styling
   * @param {string} tabName - Active tab name
   */
  updateActiveTabButton(tabName) {
    const tabButtons = $all('.spa-nav-tab');
    
    tabButtons.forEach(button => {
      const buttonTab = button.getAttribute('data-tab');
      const isActive = buttonTab === tabName;
      
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive.toString());
    });
  }

  /**
   * Show tab content
   * @param {string} tabName - Tab name to show
   */
  showTab(tabName) {
    const tabSections = $all('.spa-tab-section');
    
    tabSections.forEach(section => {
      const sectionTab = section.id.replace('tab-', '');
      const isActive = sectionTab === tabName;
      
      section.classList.toggle('active', isActive);
      section.style.display = isActive ? 'block' : 'none';
    });
  }

  /**
   * Register tab handler
   * @param {string} tabName - Tab name
   * @param {Function} handler - Handler function
   */
  onTabActivate(tabName, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Tab handler must be a function');
    }
    
    this.tabHandlers.set(tabName, handler);
    debugLog(`Registered handler for tab: ${tabName}`);
  }

  /**
   * Get current tab
   * @returns {string} Current tab name
   */
  getCurrentTab() {
    return this.currentTab;
  }

  /**
   * Check if tab exists
   * @param {string} tabName - Tab name to check
   * @returns {boolean} True if tab exists
   */
  hasTab(tabName) {
    const tabSection = $(`#tab-${tabName}`);
    return tabSection !== null;
  }

  /**
   * Get all available tabs
   * @returns {string[]} Array of tab names
   */
  getAvailableTabs() {
    const tabSections = $all('.spa-tab-section');
    return Array.from(tabSections).map(section => 
      section.id.replace('tab-', '')
    );
  }

  /**
   * Refresh current tab
   */
  refreshCurrentTab() {
    debugLog(`Refreshing current tab: ${this.currentTab}`);
    this.navigateToTab(this.currentTab);
  }

  /**
   * Set tab content
   * @param {string} tabName - Tab name
   * @param {string} content - HTML content
   */
  setTabContent(tabName, content) {
    const tabSection = $(`#tab-${tabName}`);
    if (tabSection) {
      tabSection.innerHTML = content;
      debugLog(`Set content for tab: ${tabName}`);
    } else {
      console.warn(`Tab section not found: ${tabName}`);
    }
  }

  /**
   * Get tab content element
   * @param {string} tabName - Tab name
   * @returns {Element|null} Tab content element
   */
  getTabContent(tabName) {
    return $(`#tab-${tabName}`);
  }

  /**
   * Show loading state for tab
   * @param {string} tabName - Tab name
   * @param {string} message - Loading message
   */
  showTabLoading(tabName, message = 'Loading...') {
    const content = `
      <div class="spa-loading">
        <div class="spa-spinner"></div>
        <p>${message}</p>
      </div>
    `;
    this.setTabContent(tabName, content);
  }

  /**
   * Show error state for tab
   * @param {string} tabName - Tab name
   * @param {string} message - Error message
   * @param {Function} onRetry - Retry callback
   */
  showTabError(tabName, message, onRetry = null) {
    const retryButton = onRetry ? 
      `<button class="btn btn-primary" onclick="(${onRetry.toString()})()">🔄 Try Again</button>` : '';
    
    const content = `
      <div class="spa-error">
        <h4>❌ Error</h4>
        <p>${message}</p>
        ${retryButton}
      </div>
    `;
    this.setTabContent(tabName, content);
  }
}

// Create and export router instance
export const router = new SimpleRouter();

// Export class for testing
export { SimpleRouter };
