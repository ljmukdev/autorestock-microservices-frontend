/**
 * StockPilot Modal Component
 * Reusable modal functionality
 */

import { debugLog } from '../core/config.js';

class Modal {
  constructor(id, options = {}) {
    this.id = id;
    this.options = {
      closable: true,
      backdrop: true,
      keyboard: true,
      ...options
    };
    this.isOpen = false;
    this.element = null;
  }

  /**
   * Create modal element
   * @param {string} title - Modal title
   * @param {string} content - Modal content
   * @param {string} footer - Modal footer
   * @returns {HTMLElement} Modal element
   */
  create(title, content, footer = '') {
    const modalHtml = `
      <div id="${this.id}" class="modal-overlay" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            ${this.options.closable ? '<button class="close-btn" id="' + this.id + '-close">&times;</button>' : ''}
          </div>
          <div class="modal-body">
            ${content}
          </div>
          ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        </div>
      </div>
    `;

    // Remove existing modal if present
    const existing = document.getElementById(this.id);
    if (existing) {
      existing.remove();
    }

    // Create new modal
    const temp = document.createElement('div');
    temp.innerHTML = modalHtml;
    this.element = temp.firstElementChild;
    document.body.appendChild(this.element);

    this.bindEvents();
    debugLog(`Modal created: ${this.id}`);
    return this.element;
  }

  /**
   * Show modal
   * @param {string} title - Modal title
   * @param {string} content - Modal content
   * @param {string} footer - Modal footer
   */
  show(title, content, footer = '') {
    if (!this.element) {
      this.create(title, content, footer);
    } else {
      // Update content
      const titleEl = this.element.querySelector('.modal-title');
      const bodyEl = this.element.querySelector('.modal-body');
      const footerEl = this.element.querySelector('.modal-footer');
      
      if (titleEl) titleEl.textContent = title;
      if (bodyEl) bodyEl.innerHTML = content;
      if (footerEl) footerEl.innerHTML = footer;
    }

    this.element.style.display = 'flex';
    this.isOpen = true;
    document.body.classList.add('no-scroll');
    debugLog(`Modal shown: ${this.id}`);
  }

  /**
   * Hide modal
   */
  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      this.isOpen = false;
      document.body.classList.remove('no-scroll');
      debugLog(`Modal hidden: ${this.id}`);
    }
  }

  /**
   * Toggle modal visibility
   */
  toggle() {
    if (this.isOpen) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Destroy modal
   */
  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
      this.isOpen = false;
      document.body.classList.remove('no-scroll');
      debugLog(`Modal destroyed: ${this.id}`);
    }
  }

  /**
   * Bind modal events
   */
  bindEvents() {
    if (!this.element) return;

    // Close button
    const closeBtn = this.element.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Backdrop click
    if (this.options.backdrop) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.hide();
        }
      });
    }

    // Keyboard events
    if (this.options.keyboard) {
      const keyHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.hide();
        }
      };
      
      document.addEventListener('keydown', keyHandler);
      
      // Store handler for cleanup
      this.keyHandler = keyHandler;
    }
  }

  /**
   * Update modal content
   * @param {string} content - New content
   */
  updateContent(content) {
    if (this.element) {
      const bodyEl = this.element.querySelector('.modal-body');
      if (bodyEl) {
        bodyEl.innerHTML = content;
      }
    }
  }

  /**
   * Update modal title
   * @param {string} title - New title
   */
  updateTitle(title) {
    if (this.element) {
      const titleEl = this.element.querySelector('.modal-title');
      if (titleEl) {
        titleEl.textContent = title;
      }
    }
  }

  /**
   * Check if modal is open
   * @returns {boolean} Modal open status
   */
  isModalOpen() {
    return this.isOpen;
  }

  /**
   * Get modal element
   * @returns {HTMLElement|null} Modal element
   */
  getElement() {
    return this.element;
  }
}

// Create modal instances for common use cases
export const purchaseModal = new Modal('purchase-modal');
export const confirmModal = new Modal('confirm-modal');
export const errorModal = new Modal('error-modal');

// Export class for custom modals
export { Modal };
