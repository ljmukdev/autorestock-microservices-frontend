/**
 * StockPilot Home View
 * Dashboard and overview functionality
 */

import { debugLog } from '../core/config.js';
import { delegate } from '../core/dom.js';

class HomeView {
  constructor() {
    this.isInitialized = false;
    this.container = null;
  }

  /**
   * Initialize home view
   * @param {Element} container - Container element
   */
  async init(container) {
    this.container = container;
    debugLog('Initializing home view');

    try {
      this.render();
      this.bindEvents();
      this.isInitialized = true;
      debugLog('Home view initialized');
    } catch (error) {
      debugLog('Error initializing home view', error);
    }
  }

  /**
   * Render home view
   */
  render() {
    if (!this.container) {
      debugLog('No container for home view');
      return;
    }

    const html = `
      <div class="card">
        <h3 class="section-title">🏠 StockPilot Dashboard</h3>
        <p>Welcome to StockPilot - Your automated inventory management system.</p>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number stat-primary">0</div>
            <div class="stat-label">Total Purchases</div>
          </div>
          <div class="stat-card">
            <div class="stat-number stat-success">0</div>
            <div class="stat-label">Items in Stock</div>
          </div>
          <div class="stat-card">
            <div class="stat-number stat-warning">0</div>
            <div class="stat-label">Pending Sales</div>
          </div>
          <div class="stat-card">
            <div class="stat-number stat-info">£0.00</div>
            <div class="stat-label">Total Investment</div>
          </div>
        </div>

        <div class="card">
          <h4 class="section-title-small">Quick Actions</h4>
          <div class="nav-buttons">
            <button class="nav-btn" data-go-tab="purchases">🛒 View Purchases</button>
            <button class="nav-btn" data-go-tab="inventory">📦 Manage Inventory</button>
            <button class="nav-btn" data-go-tab="sales">💰 View Sales</button>
            <button class="nav-btn" data-go-tab="reports">📈 Generate Reports</button>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
    debugLog('Home view rendered');
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    if (!this.container) return;

    // Local delegation limited to this view root
    delegate('click', '[data-go-tab]', (e, el) => {
      const tab = el.getAttribute('data-go-tab');
      window.router?.navigateToTab?.(tab);
    }, this.container);
  }

  /**
   * Refresh view
   */
  async refresh() {
    if (!this.isInitialized) return;
    debugLog('Refreshing home view');
    this.render();
    this.bindEvents();
  }

  /**
   * Destroy view
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.isInitialized = false;
    debugLog('Home view destroyed');
  }
}

// Create and export view instance
export const homeView = new HomeView();

// Export class for testing
export { HomeView };
