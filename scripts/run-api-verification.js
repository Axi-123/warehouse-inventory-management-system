const fs = require('fs');

const collection = JSON.parse(fs.readFileSync('postman_collection.json', 'utf8'));
const baseUrl = 'http://localhost:5000/api/v1';
const variables = { baseUrl, token: '', adminToken: '', managerToken: '', staffToken: '', warehouseId: '', secondWarehouseId: '', itemId: '', transferId: '', movementId: '', userId: '' };
const runId = Date.now();
const adminEmail = process.env.VERIFICATION_ADMIN_EMAIL;
const adminPassword = process.env.VERIFICATION_ADMIN_PASSWORD;
const managerPassword = `Manager-${runId}-test`;
const staffPassword = `Staff-${runId}-test`;
const results = [];

function findRequest(name, items = collection.item) {
  for (const item of items) {
    if (item.name === name && item.request) return item.request;
    if (item.item) {
      const found = findRequest(name, item.item);
      if (found) return found;
    }
  }
  return null;
}

function replaceVariables(value) {
  return value
    .replace(/\{\{\$timestamp\}\}/g, String(runId))
    .replace(/\{\{([^}]+)\}\}/g, (_, key) => variables[key] ?? '');
}

async function execute(name, token, bodyOverride, pathOverride) {
  const definition = findRequest(name);
  if (!definition) throw new Error(`Collection request not found: ${name}`);
  const rawUrl = pathOverride || definition.url.raw;
  const url = replaceVariables(rawUrl);
  let body;
  if (bodyOverride !== undefined) {
    body = bodyOverride;
  } else if (definition.body?.raw) {
    body = JSON.parse(replaceVariables(definition.body.raw));
  }

  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(url, {
    method: definition.method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = {}; }
  results.push({ name, status: response.status });
  return { status: response.status, data };
}

function report(label, response) {
  console.log(`${response.status >= 200 && response.status < 300 ? 'PASS' : 'FAIL'} ${label}: ${response.status}`);
}

async function main() {
  if (!adminEmail || !adminPassword) {
    throw new Error('Set VERIFICATION_ADMIN_EMAIL and VERIFICATION_ADMIN_PASSWORD before running verification');
  }

  let response;

  response = await execute('Register User', '', { name: 'Collection Test User', email: `collection-${runId}@warehouse.com`, password: `Collection-${runId}-test` });
  report('1. Register User', response);

  response = await execute('Login User', '', { email: adminEmail, password: adminPassword });
  report('1. Login Admin', response);
  variables.adminToken = response.data?.data?.token;
  variables.token = variables.adminToken;

  response = await execute('Get Profile (Me)', variables.adminToken); report('1. Get Profile', response);

  const warehouseBody = (name) => ({ name, location: 'Collection Test Zone', capacity: 1000 });
  response = await execute('Create Warehouse', variables.adminToken, warehouseBody(`Collection Central ${runId}`)); report('2. Create Warehouse', response);
  variables.warehouseId = response.data?.data?._id;
  response = await execute('Create Warehouse', variables.adminToken, warehouseBody(`Collection East ${runId}`)); report('2. Create Second Warehouse', response);
  variables.secondWarehouseId = response.data?.data?._id;
  response = await execute('Get All Warehouses', variables.adminToken); report('2. Get Warehouses', response);
  response = await execute('Get Warehouse By ID', variables.adminToken); report('2. Get Warehouse By ID', response);
  response = await execute('Update Warehouse', variables.adminToken, { location: 'Updated Collection Zone' }); report('2. Update Warehouse', response);

  const itemBody = { sku: `COL-${runId}`, name: 'Collection Test Item', category: 'Testing', unit: 'piece', unitPrice: 10, reorderPoint: 5 };
  response = await execute('Create Item (SKU)', variables.adminToken, itemBody); report('3. Create Item', response);
  variables.itemId = response.data?.data?._id;
  response = await execute('Get All Items', variables.adminToken); report('3. Get Items', response);
  response = await execute('Get Item By ID', variables.adminToken); report('3. Get Item By ID', response);
  response = await execute('Update Item', variables.adminToken, { unitPrice: 12, reorderPoint: 5 }); report('3. Update Item', response);

  response = await execute('Stock-In Recording', variables.adminToken, { warehouseId: variables.warehouseId, itemId: variables.itemId, quantity: 20, reference: 'COL-IN', batchNumber: 'COL-B1' }); report('4. Stock In', response);
  response = await execute('Stock-Out Recording', variables.adminToken, { warehouseId: variables.warehouseId, itemId: variables.itemId, quantity: 3, reference: 'COL-OUT', reason: 'Collection test' }); report('5. Stock Out', response);
  response = await execute('Get Running Stock Balances', variables.adminToken); report('6. Stock Balance', response);
  response = await execute('Get Low-Stock Alerts', variables.adminToken); report('9. Low Stock', response);
  response = await execute('Stock Audit Adjustment', variables.adminToken, { warehouseId: variables.warehouseId, itemId: variables.itemId, newQuantity: 8, reason: 'Collection audit test' }); report('10. Stock Adjustment', response);

  const managerEmail = `collection-manager-${runId}@warehouse.com`;
  const staffEmail = `collection-staff-${runId}@warehouse.com`;
  response = await execute('Register User', '', { name: 'Collection Manager', email: managerEmail, password: managerPassword }); report('13. Register Manager', response);
  const managerId = response.data?.data?.user?._id;
  response = await execute('Register User', '', { name: 'Collection Staff', email: staffEmail, password: staffPassword }); report('13. Register Staff', response);
  const staffId = response.data?.data?.user?._id;
  variables.userId = managerId;
  response = await execute('Update User Role', variables.adminToken, { role: 'Warehouse Manager', assignedWarehouse: variables.warehouseId }); report('13. Assign Manager Role', response);
  variables.userId = staffId;
  response = await execute('Update User Role', variables.adminToken, { role: 'Warehouse Staff', assignedWarehouse: variables.warehouseId }); report('13. Assign Staff Role', response);
  response = await execute('Login User', '', { email: managerEmail, password: managerPassword }); report('13. Login Manager', response); variables.managerToken = response.data?.data?.token;
  response = await execute('Login User', '', { email: staffEmail, password: staffPassword }); report('13. Login Staff', response); variables.staffToken = response.data?.data?.token;
  variables.userId = managerId;
  response = await execute('Get All Users', variables.adminToken); report('13. Get Users', response);
  response = await execute('Get User By ID', variables.adminToken); report('13. Get User By ID', response);

  response = await execute('Create Transfer Request', variables.staffToken, { fromWarehouseId: variables.warehouseId, toWarehouseId: variables.secondWarehouseId, itemId: variables.itemId, quantity: 2 }); report('7. Create Transfer', response);
  variables.transferId = response.data?.data?._id;
  response = await execute('Get All Transfer Requests', variables.managerToken); report('7. Get Transfers', response);
  response = await execute('Get Transfer Request By ID', variables.managerToken); report('7. Get Transfer By ID', response);
  response = await execute('Approve Transfer Request', variables.adminToken); report('8. Approve Transfer', response);

  response = await execute('Get Movement History', variables.adminToken); report('11. Movement History', response);
  variables.movementId = response.data?.data?.movements?.[0]?._id;
  if (variables.movementId) { response = await execute('Get Movement By ID', variables.adminToken); report('11. Movement By ID', response); }
  response = await execute('Warehouse-wise Stock Summary', variables.adminToken); report('12. Warehouse Report', response);
  response = await execute('Stock Valuation Report', variables.adminToken); report('12. Valuation Report', response);
  response = await execute('Fast-Moving Items Report', variables.managerToken); report('12. Fast-Moving Report', response);

  response = await execute('Create Transfer Request', variables.staffToken, { fromWarehouseId: variables.warehouseId, toWarehouseId: variables.secondWarehouseId, itemId: variables.itemId, quantity: 1 });
  const rejectionId = response.data?.data?._id;
  variables.transferId = rejectionId;
  response = await execute('Reject Transfer Request', variables.managerToken); report('8. Reject Transfer', response);

  response = await execute('Toggle User Status', variables.adminToken); report('13. Toggle User Status', response);
  response = await execute('Toggle User Status', variables.adminToken); report('13. Restore User Status', response);

  response = await execute('Delete Item', variables.adminToken, undefined, `${variables.baseUrl}/items/${variables.itemId}`); report('3. Delete Item', response);
  response = await execute('Delete Warehouse', variables.adminToken, undefined, `${variables.baseUrl}/warehouses/${variables.secondWarehouseId}`); report('2. Delete Second Warehouse', response);

  const failed = results.filter((result) => result.status < 200 || result.status >= 300);
  console.log(`SUMMARY total=${results.length} passed=${results.length - failed.length} failed=${failed.length}`);
  if (failed.length) console.log(`FAILED_REQUESTS ${failed.map((result) => `${result.name}=${result.status}`).join(', ')}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
