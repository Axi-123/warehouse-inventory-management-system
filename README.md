# Warehouse & Inventory Management System (Backend REST API)

A production-grade, enterprise-ready RESTful backend API for managing multi-warehouse inventory, stock movement auditing, automated running balances, inter-warehouse transfers, low-stock threshold alerting, and analytical stock valuation reporting. Built with Node.js, Express.js, MongoDB, and Mongoose following strict MVC architecture and Role-Based Access Control (RBAC).

---

## 📋 Problem Statement
Modern logistics and supply chain operations struggle with inventory discrepancies, untracked stock movement between facilities, overstocking/understocking risks, and lack of real-time visibility into stock valuation. This system resolves these challenges by providing:
- **Centralized Multi-Warehouse Supervision**: Real-time stock tracking across multiple physical locations.
- **Accurate Running Balance Engine**: Prevents negative stock levels using conditional MongoDB update operations.
- **Inter-Warehouse Transfer Workflow**: Multi-step request, review, approval, and rejection workflow for transferring stock across facilities.
- **Complete Audit Trail**: Immutable movement logging for every stock-in, stock-out, transfer, and manual inventory adjustment.
- **Role-Based Security**: Dynamic permissions separating operational staff, facility managers, and enterprise administrators.

---

## ✨ Features & Functional Modules

The project implements **all 13 required functional modules**:

1. **User Registration & Authentication**: User sign-up, secure login, password hashing with `bcryptjs`, and JSON Web Token (JWT) stateless session handling.
2. **Warehouse Management**: Complete CRUD operations for warehouses (name, location, capacity, status) restricted to Admin users.
3. **Item / SKU Master Management**: Centralized item catalog management with SKU codes, categories, unit of measure, unit price, and reorder point thresholds.
4. **Stock-In Recording**: Log incoming inventory batches with reference numbers and auto-update warehouse running balances.
5. **Stock-Out Recording**: Process outgoing stock while enforcing strict non-negative stock safety checks.
6. **Running Stock Balance Engine**: Conditional computation and query mechanism for real-time stock levels per warehouse per SKU.
7. **Inter-Warehouse Transfer Requests**: Initiate inventory movement requests from a source facility to a target facility.
8. **Transfer Approval Workflow**: Dedicated approval/rejection logic for Warehouse Managers/Admins with automatic double-entry balance updates (`TRANSFER_OUT` & `TRANSFER_IN`).
9. **Low-Stock Alert & Reorder Point**: Automatic detection of items falling below designated reorder point thresholds with deficit calculations.
10. **Stock Audit / Adjustment Module**: Controlled manual inventory reconciliation with obligatory reason recording for stock discrepancy corrections.
11. **Movement History Log**: Centralized, filterable audit log capturing all stock activities (IN, OUT, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT) with date range and pagination support.
12. **Manager & Admin Reports**: Analytical reports providing warehouse-wise stock breakdown, total monetary valuation (`quantity * unitPrice`), and fast-moving item analysis.
13. **Role-Based Access Control (RBAC)**: Fine-grained middleware authorization for **Admin**, **Warehouse Manager**, and **Warehouse Staff**.

---

## 🛠 Tech Stack

- **Runtime Environment**: Node.js (v18+)
- **Framework**: Express.js (v4.19)
- **Database**: MongoDB & Mongoose ORM (v8.4)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Validation**: Joi (v17.13)
- **Security**: Helmet, CORS
- **Logging**: Morgan

---

## 📁 Project Folder Structure

```
warehouse-inventory-management-system/
├── postman/
│   └── Warehouse_Inventory_System.postman_collection.json  # Postman v2.1 collection
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── constants/
│   │   ├── movementTypes.js      # Stock movement types (IN, OUT, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT)
│   │   ├── roles.js              # User roles (Admin, Warehouse Manager, Warehouse Staff)
│   │   └── transferStatus.js     # Transfer statuses (PENDING, APPROVED, REJECTED, CANCELLED)
│   ├── controllers/
│   │   ├── auth.controller.js       # Auth & Profile controller
│   │   ├── item.controller.js       # SKU master controller
│   │   ├── movement.controller.js   # Audit log controller
│   │   ├── report.controller.js     # Analytics & reports controller
│   │   ├── stock.controller.js      # Stock operations controller
│   │   ├── transfer.controller.js   # Transfer workflow controller
│   │   ├── user.controller.js       # Admin user management controller
│   │   └── warehouse.controller.js  # Warehouse CRUD controller
│   ├── jobs/
│   │   └── lowStockChecker.js    # Automated low-stock scanner job
│   ├── middlewares/
│   │   ├── auth.middleware.js       # JWT verification middleware
│   │   ├── authorize.middleware.js  # Role-based access control (RBAC) middleware
│   │   ├── error.middleware.js      # Centralized error handler middleware
│   │   └── validate.middleware.js   # Joi payload validator middleware
│   ├── models/
│   │   ├── item.model.js            # SKU Master model
│   │   ├── stockBalance.model.js    # Running stock balance model (compound index)
│   │   ├── stockMovement.model.js   # Audit movement history log model
│   │   ├── transferRequest.model.js # Inter-warehouse transfer model
│   │   ├── user.model.js            # User authentication model
│   │   └── warehouse.model.js       # Warehouse model
│   ├── routes/
│   │   ├── auth.routes.js        # /api/v1/auth routes
│   │   ├── index.js              # Centralized router index
│   │   ├── item.routes.js        # /api/v1/items routes
│   │   ├── movement.routes.js    # /api/v1/movements routes
│   │   ├── report.routes.js      # /api/v1/reports routes
│   │   ├── stock.routes.js       # /api/v1/stock routes
│   │   ├── transfer.routes.js    # /api/v1/transfers routes
│   │   ├── user.routes.js        # /api/v1/users routes
│   │   └── warehouse.routes.js   # /api/v1/warehouses routes
│   ├── services/
│   │   ├── auth.service.js       # Auth business logic
│   │   ├── item.service.js       # Item business logic
│   │   ├── movement.service.js   # Movement history logic
│   │   ├── report.service.js     # Aggregation & reporting logic
│   │   ├── stock.service.js      # Stock balance & movement logic
│   │   ├── transfer.service.js   # Inter-warehouse transfer logic
│   │   ├── user.service.js       # User administration logic
│   │   └── warehouse.service.js  # Warehouse business logic
│   ├── utils/
│   │   ├── apiError.js           # Custom ApiError class
│   │   ├── apiResponse.js        # Standardized ApiResponse formatter
│   │   └── asyncHandler.js       # Async wrapper for route controllers
│   ├── validators/
│   │   ├── auth.validator.js     # Register & Login Joi schemas
│   │   ├── item.validator.js     # Item Joi schemas
│   │   ├── stock.validator.js    # Stock operation Joi schemas
│   │   ├── transfer.validator.js # Transfer Joi schemas
│   │   └── warehouse.validator.js# Warehouse Joi schemas
│   ├── app.js                    # Express app initialization
│   └── server.js                 # Server entry point
├── .env.example                  # Environment configuration template
├── .env                          # Local environment settings
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies & npm scripts
├── postman_collection.json       # Postman Collection JSON (Root copy)
└── README.md                     # Complete project documentation
```

---

## ⚡ Installation & Execution Guide

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB server running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

### Setup Steps

1. **Navigate to project root**:
   ```bash
   cd warehouse-inventory-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Run the Application**:
   - **Development mode (with nodemon auto-reload)**:
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm start
     ```

5. **Verify Server Health**:
   Send a `GET` request to `http://localhost:5000/health`.

---

## 🚀 Postman Collection Usage

 A complete Postman Collection is included at:
- `postman_collection.json` (Root)
- `postman/Warehouse_Inventory_System.postman_collection.json`

### Import Instructions:
1. Open **Postman**.
2. Click **Import** (top left).
3. Select `postman_collection.json`.
4. The collection `baseUrl` is `http://localhost:5000/api/v1`.
5. Public registration creates a `Warehouse Staff` account only. Promote a trusted bootstrap user to `Admin` directly in MongoDB, then log in and store the returned token in `adminToken`.
6. Use the Admin token to create warehouses and an item, register manager/staff users, and assign roles through `/users/:id/role`.
7. Log in as each role and store tokens in `adminToken`, `managerToken`, and `staffToken`. Set `warehouseId`, `secondWarehouseId`, `itemId`, and `transferId` from response data as the sequence progresses.
8. Run requests in module order. Protected requests use `{{token}}` by default; replace it with the role-specific variable when testing authorization boundaries.

### Automated Local Verification

With MongoDB and the development server running, execute the collection-backed verification harness:

```bash
VERIFICATION_ADMIN_EMAIL=admin@example.com VERIFICATION_ADMIN_PASSWORD=your-local-admin-password node scripts/run-api-verification.js
```

It creates isolated test fixtures, assigns Manager and Staff roles through the Admin API, exercises all 13 modules, and reports every request status. It does not stop the server.

---

## 🔑 Environment Variables Reference

| Variable | Description | Default Value |
|---|---|---|
| `PORT` | HTTP Server Port | `5000` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb://127.0.0.1:27017/warehouse_inventory_db` |
| `JWT_SECRET` | Required secret key for JWT signing; never commit the real value | Generate a long random value |
| `JWT_EXPIRES_IN` | Token expiration duration | `7d` |
| `NODE_ENV` | Application environment | `development` |

---

## 🗄 Database Schemas Summary

### 1. `users`
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, hashed with bcrypt, hidden by default)
- `role` (String, enum: `Admin`, `Warehouse Manager`, `Warehouse Staff`)
- `assignedWarehouse` (ObjectId ref `Warehouse`, optional)
- `isActive` (Boolean, default: true)

### 2. `warehouses`
- `name` (String, required, unique)
- `location` (String, required)
- `capacity` (Number, required)
- `isActive` (Boolean, default: true)

### 3. `items`
- `sku` (String, required, unique, uppercase)
- `name` (String, required)
- `category` (String, required)
- `unit` (String, required)
- `unitPrice` (Number, default: 0)
- `reorderPoint` (Number, default: 10)
- `isActive` (Boolean, default: true)

### 4. `stockBalances`
- `warehouse` (ObjectId ref `Warehouse`, required)
- `item` (ObjectId ref `Item`, required)
- `quantity` (Number, required, min: 0)
- **Index**: Compound unique index `{ warehouse: 1, item: 1 }`

### 5. `stockMovements`
- `item` (ObjectId ref `Item`, required)
- `warehouse` (ObjectId ref `Warehouse`, required)
- `movementType` (String, enum: `IN`, `OUT`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT`)
- `quantity` (Number, required)
- `reference` (String)
- `batchNumber` (String)
- `reason` (String)
- `performedBy` (ObjectId ref `User`, required)

### 6. `transferRequests`
- `fromWarehouse` (ObjectId ref `Warehouse`, required)
- `toWarehouse` (ObjectId ref `Warehouse`, required)
- `item` (ObjectId ref `Item`, required)
- `quantity` (Number, required)
- `status` (String, enum: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`)
- `requestedBy` (ObjectId ref `User`, required)
- `reviewedBy` (ObjectId ref `User`)
- `rejectionReason` (String)

---

## 📡 API Endpoint Reference

All API endpoints are prefixed with `/api/v1`.

### 1. Authentication (`/auth`)
| Method | Endpoint | Auth Required | Allowed Roles | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | No | Public | Register new user account |
| `POST` | `/auth/login` | No | Public | Authenticate user & receive JWT token |
| `GET` | `/auth/me` | Yes | All Roles | Fetch current logged-in user profile |

### 2. Warehouse Management (`/warehouses`)
| Method | Endpoint | Auth Required | Allowed Roles | Description |
|---|---|---|---|---|
| `POST` | `/warehouses` | Yes | Admin | Create a new warehouse |
| `GET` | `/warehouses` | Yes | All Roles | List all active warehouses |
| `GET` | `/warehouses/:id` | Yes | All Roles | Get warehouse details |
| `PUT` | `/warehouses/:id` | Yes | Admin | Update warehouse details |
| `DELETE` | `/warehouses/:id` | Yes | Admin | Soft delete a warehouse |

### 3. Item / SKU Master (`/items`)
| Method | Endpoint | Auth Required | Allowed Roles | Description |
|---|---|---|---|---|
| `POST` | `/items` | Yes | Admin, Manager | Create a new SKU / Item |
| `GET` | `/items` | Yes | All Roles | List items (supports `?category=` & `?search=`) |
| `GET` | `/items/low-stock` | Yes | All Roles | List items at or below their reorder point (alias of `/stock/low-stock`) |
| `GET` | `/items/:id` | Yes | All Roles | Get item details |
| `PUT` | `/items/:id` | Yes | Admin, Manager | Update item master details |
| `DELETE` | `/items/:id` | Yes | Admin | Soft delete an item |

### 4. Stock Operations & Engine (`/stock`)
| Method | Endpoint | Auth Required | Allowed Roles | Description |
|---|---|---|---|---|
| `POST` | `/stock/in` | Yes | All Roles | Record incoming stock batch |
| `POST` | `/stock/out` | Yes | All Roles | Record outgoing stock (checks availability) |
| `GET` | `/stock/balance` | Yes | All Roles | Query current stock balances per warehouse/item |
| `GET` | `/stock/low-stock` | Yes | All Roles | Get low stock alert list below reorder points |
| `POST` | `/stock/adjust` | Yes | Admin, Manager | Perform manual stock audit adjustment with reason |

### 5. Inter-Warehouse Transfers (`/transfers`)
| Method | Endpoint | Auth Required | Allowed Roles | Description |
|---|---|---|---|---|
| `POST` | `/transfers` | Yes | All Roles | Create inter-warehouse transfer request |
| `GET` | `/transfers` | Yes | All Roles | List transfer requests (filter by `status`, `fromWarehouse`, `toWarehouse`) |
| `GET` | `/transfers/:id` | Yes | All Roles | Get transfer request details |
| `PATCH` | `/transfers/:id/approve` | Yes | Admin, Manager | Approve transfer & execute stock movement |
| `PATCH` | `/transfers/:id/reject` | Yes | Admin, Manager | Reject transfer with reason |

### 6. Movement History Log (`/movements`)
| Method | Endpoint | Auth Required | Allowed Roles | Description |
|---|---|---|---|---|
| `GET` | `/movements` | Yes | All Roles | Audit trail log (supports `warehouseId`, `itemId`, `movementType`, `startDate`, `endDate`, `page`, `limit`) |
| `GET` | `/movements/:id` | Yes | All Roles | Get specific movement transaction detail |

### 7. Manager & Admin Reports (`/reports`)
| Method | Endpoint | Auth Required | Allowed Roles | Description |
|---|---|---|---|---|
| `GET` | `/reports/warehouse-stock` | Yes | Admin, Manager | Warehouse-wise stock summary report |
| `GET` | `/reports/valuation` | Yes | Admin, Manager | Total stock monetary valuation report |
| `GET` | `/reports/fast-moving` | Yes | Admin, Manager | Fast-moving items report (`?days=30&limit=10`) |

### 8. User & RBAC Administration (`/users`)
| Method | Endpoint | Auth Required | Allowed Roles | Description |
|---|---|---|---|---|
| `GET` | `/users` | Yes | Admin | List all registered users |
| `GET` | `/users/:id` | Yes | Admin | Get user profile detail |
| `PATCH` | `/users/:id/role` | Yes | Admin | Change user role or assigned warehouse |
| `PATCH` | `/users/:id/status` | Yes | Admin | Activate or deactivate user account |

---


## ⚠️ Error Response Format

All errors return a consistent JSON envelope from the centralized error-handling middleware:

| Field | Type | Description |
|---|---|---|
| `success` | boolean | Always `false` for errors |
| `statusCode` | number | HTTP status code |
| `errorCode` | string | Machine-readable code — `VALIDATION_ERROR` (400), `UNAUTHENTICATED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `INTERNAL_ERROR` (anything else) |
| `message` | string | Human-readable explanation |
| `errors` | array | Field-level validation details; empty when not applicable |
| `stack` | string | Included only when `NODE_ENV=development` |

Example (`400 Bad Request`):

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "\"quantity\" must be a positive number",
  "errors": []
}
```

## 🔒 Role Permissions Summary Matrix

| Module / Operation | Admin | Warehouse Manager | Warehouse Staff |
|---|:---:|:---:|:---:|
| User Management & Role Assign | ✅ | ❌ | ❌ |
| Warehouse Create/Update/Delete | ✅ | ❌ | ❌ |
| Item Master Create/Update | ✅ | ✅ | ❌ |
| Item Master Delete | ✅ | ❌ | ❌ |
| Stock In / Stock Out | ✅ | ✅ | ✅ |
| Stock Audit & Adjustment | ✅ | ✅ | ❌ |
| Request Stock Transfer | ✅ | ✅ | ✅ |
| Approve / Reject Transfer | ✅ | ✅ | ❌ |
| View Stock Balances & Logs | ✅ | ✅ | ✅ |
| View Management Reports | ✅ | ✅ | ❌ |

---

## 📝 License
This project is developed for educational and academic showcase purposes.
