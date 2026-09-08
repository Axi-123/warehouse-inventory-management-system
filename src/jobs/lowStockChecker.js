const StockService = require('../services/stock.service');

/**
 * Periodically checks for inventory items below reorder points
 * and logs alerts. Can be connected to notification/email services in production.
 */
const runLowStockCheck = async () => {
  try {
    const lowStockAlerts = await StockService.getLowStockAlerts({});
    if (lowStockAlerts.length > 0) {
      console.log(`[JOB: LowStockChecker] Warning: ${lowStockAlerts.length} item(s) below reorder point:`);
      lowStockAlerts.forEach((alert) => {
        console.log(
          `  - [Warehouse: ${alert.warehouse?.name}] SKU: ${alert.item?.sku} (${alert.item?.name}) | Available: ${alert.currentQuantity} | Reorder Threshold: ${alert.reorderPoint}`
        );
      });
    } else {
      console.log('[JOB: LowStockChecker] Stock level health check passed. No items below reorder point.');
    }
  } catch (error) {
    console.error(`[JOB: LowStockChecker] Error checking low stock: ${error.message}`);
  }
};

module.exports = { runLowStockCheck };
