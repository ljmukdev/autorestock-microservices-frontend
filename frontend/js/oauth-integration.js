/**
 * OAuth Integration for StockPilot Frontend
 * Provides seamless eBay OAuth integration for purchase syncing
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Add OAuth scripts if not already loaded
    if (!document.getElementById('oauth-handler-script')) {
        const oauthHandlerScript = document.createElement('script');
        oauthHandlerScript.id = 'oauth-handler-script';
        oauthHandlerScript.src = 'js/oauth-handler.js';
        document.head.appendChild(oauthHandlerScript);
    }

    if (!document.getElementById('oauth-api-wrapper-script')) {
        const oauthWrapperScript = document.createElement('script');
        oauthWrapperScript.id = 'oauth-api-wrapper-script';
        oauthWrapperScript.src = 'js/oauth-api-wrapper.js';
        document.head.appendChild(oauthWrapperScript);
    }

    // Wait for OAuth components to load
    setTimeout(() => {
        initializeOAuthIntegration();
    }, 1000);
});

/**
 * Initialize OAuth integration
 */
function initializeOAuthIntegration() {
    // Override syncFromPurchases function if it exists
    if (typeof window.syncFromPurchases === 'function') {
        window.originalSyncFromPurchases = window.syncFromPurchases;
        window.syncFromPurchases = newSyncFromPurchases;
    }

    // Add OAuth button to sync buttons if they exist
    addOAuthSyncButtons();

    // Listen for OAuth success events
    document.addEventListener('oauthSuccess', handleOAuthSuccess);
    document.addEventListener('apiRequestSuccess', handleApiRequestSuccess);
}

/**
 * New sync function with OAuth integration
 */
async function newSyncFromPurchases() {
    try {
        showMessage('🔄 Syncing delivered purchases to inventory...', 'info');
        
        let purchases = [];
        
        // Try to get purchases from eBay API first with OAuth handling
        if (typeof window.oauthApiWrapper !== 'undefined') {
            try {
                const response = await window.oauthApiWrapper.getPurchases({ limit: 100 });
                
                if (response.oauth_required) {
                    // OAuth modal will be shown automatically
                    return;
                }
                
                if (response.success && response.data && response.data.data) {
                    // Convert eBay data to our format
                    purchases = convertEbayPurchasesToFormat(response.data.data);
                    showMessage(`✅ Retrieved ${purchases.length} purchases from eBay`, 'success');
                } else {
                    throw new Error('eBay API returned no data');
                }
            } catch (error) {
                console.log('eBay API failed, trying fallback:', error.message);
                purchases = await getFallbackPurchases();
            }
        } else {
            purchases = await getFallbackPurchases();
        }
        
        // Continue with original sync logic
        await syncPurchasesToInventory(purchases);
        
    } catch (error) {
        console.error('Sync error:', error);
        showMessage(`❌ Sync failed: ${error.message}`, 'error');
    }
}

/**
 * Get fallback purchases from local API or localStorage
 */
async function getFallbackPurchases() {
    let purchases = [];
    
    // Try local API first
    if (typeof salesAPIAvailable !== 'undefined' && salesAPIAvailable) {
        try {
            const response = await fetch(API_CONFIG.purchases);
            if (response.ok) {
                purchases = await response.json();
            } else {
                throw new Error('Local API failed');
            }
        } catch (error) {
            purchases = JSON.parse(localStorage.getItem('stockpilot_purchases') || '[]');
        }
    } else {
        purchases = JSON.parse(localStorage.getItem('stockpilot_purchases') || '[]');
    }
    
    return purchases;
}

/**
 * Convert eBay purchases to our format
 */
function convertEbayPurchasesToFormat(ebayData) {
    const purchases = [];
    
    if (ebayData.recentPurchases && Array.isArray(ebayData.recentPurchases)) {
        ebayData.recentPurchases.forEach((item, index) => {
            purchases.push({
                id: `ebay_${index}_${Date.now()}`,
                purchase_date: item.date || new Date().toISOString().split('T')[0],
                platform: 'eBay',
                brand: extractBrand(item.title),
                model: extractModel(item.title),
                product_name: item.title,
                purchase_price: item.price || 0,
                total_paid: item.price || 0,
                delivery_status: 'Delivered', // Assume delivered for eBay purchases
                seller: item.seller || 'Unknown',
                notes: `eBay purchase: ${item.title}`,
                source: 'ebay-oauth',
                created_at: new Date().toISOString()
            });
        });
    }
    
    return purchases;
}

/**
 * Extract brand from product title
 */
function extractBrand(title) {
    const brands = ['Apple', 'Samsung', 'Sony', 'Bose', 'Sonos', 'LG', 'Samsung'];
    const titleLower = title.toLowerCase();
    
    for (const brand of brands) {
        if (titleLower.includes(brand.toLowerCase())) {
            return brand;
        }
    }
    
    return 'Unknown';
}

/**
 * Extract model from product title
 */
function extractModel(title) {
    // Simple model extraction - take first few words after brand
    const words = title.split(' ');
    if (words.length > 2) {
        return words.slice(1, 4).join(' ');
    }
    return title;
}

/**
 * Sync purchases to inventory
 */
async function syncPurchasesToInventory(purchases) {
    if (typeof window.inventoryData === 'undefined') {
        window.inventoryData = JSON.parse(localStorage.getItem('stockpilot_inventory') || '[]');
    }
    
    // Find delivered purchases that aren't already in inventory
    const deliveredPurchases = purchases.filter(purchase => 
        purchase.delivery_status === 'Delivered' &&
        !window.inventoryData.some(item => item.purchase_id === purchase.id)
    );
    
    let syncedCount = 0;
    
    deliveredPurchases.forEach(purchase => {
        const inventoryItem = {
            id: Date.now() + syncedCount,
            purchase_id: purchase.id,
            identifier: `PUR-${purchase.id}`,
            name: purchase.product_name || `${purchase.brand} ${purchase.model}`,
            brand: purchase.brand,
            model: purchase.model,
            generation: purchase.generation,
            part_name: purchase.product_name || `${purchase.brand} ${purchase.model}`,
            category: purchase.category || 'Electronics',
            condition: 'Good',
            status: 'available',
            cost_price: purchase.total_paid,
            selling_price: purchase.total_paid * 1.5, // 50% markup as default
            part_value: purchase.total_paid,
            quantity: 1,
            notes: `Auto-synced from purchase: ${purchase.notes || 'N/A'}`,
            created_at: new Date().toISOString()
        };
        
        window.inventoryData.push(inventoryItem);
        syncedCount++;
    });
    
    // Save to localStorage
    localStorage.setItem('stockpilot_inventory', JSON.stringify(window.inventoryData));
    
    showMessage(`✅ Successfully synced ${syncedCount} items from purchases!`, 'success');
    
    // Refresh display if function exists
    if (typeof window.displayInventory === 'function') {
        window.displayInventory();
    } else if (typeof window.processInventoryData === 'function') {
        window.processInventoryData();
    }
}

/**
 * Add OAuth sync buttons
 */
function addOAuthSyncButtons() {
    // Find sync buttons and add OAuth functionality
    const syncButtons = document.querySelectorAll('button[onclick*="syncFromPurchases"], .btn-sync');
    
    syncButtons.forEach(button => {
        // Add OAuth indicator
        if (!button.querySelector('.oauth-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'oauth-indicator';
            indicator.innerHTML = ' 🔐';
            indicator.title = 'eBay OAuth enabled';
            button.appendChild(indicator);
        }
    });
}

/**
 * Handle OAuth success
 */
function handleOAuthSuccess(event) {
    console.log('OAuth success:', event.detail);
    
    // Show success message
    if (typeof showMessage === 'function') {
        showMessage('✅ eBay authentication successful! Retrying sync...', 'success');
    }
    
    // Retry the sync after a short delay
    setTimeout(() => {
        if (typeof newSyncFromPurchases === 'function') {
            newSyncFromPurchases();
        }
    }, 2000);
}

/**
 * Handle API request success
 */
function handleApiRequestSuccess(event) {
    console.log('API request success:', event.detail);
    
    // Process the successful API response
    if (event.detail.data) {
        const purchases = convertEbayPurchasesToFormat(event.detail.data);
        syncPurchasesToInventory(purchases);
    }
}

/**
 * Show message helper
 */
function showMessage(message, type = 'info') {
    // Try to use existing message system
    if (typeof window.showMessage === 'function') {
        window.showMessage(message, type);
        return;
    }
    
    // Try to use existing status system
    if (typeof window.showStatus === 'function') {
        window.showStatus(message, type);
        return;
    }
    
    // Fallback: console log
    console.log(`[${type.toUpperCase()}] ${message}`);
}

// Export for global access
window.initializeOAuthIntegration = initializeOAuthIntegration;
window.newSyncFromPurchases = newSyncFromPurchases;


