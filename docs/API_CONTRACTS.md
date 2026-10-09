# API Contracts for Stock Inventra

This document serves as the formal agreement between the frontend application and the future backend implementation. It defines endpoints, data structures, and the exact business rules needed.

## Architecture Guidelines

- **Base URL**: `/api/v1` (managed via `VITE_API_BASE_URL`)
- **Authentication**: Secure HttpOnly cookies (to be implemented).
- **Financial Precision**: Money values must be managed by the backend. Calculations should be done at the database level and stored as integers (e.g., in cents/paise) or precise `Decimal` types.
- **Client Side Trust**: The backend must never trust frontend-calculated values like `grossProfit`, `profitMargin`, `finalAmount`, or `totalCost`.

## Common Response Structures

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success"
}
```

### List (Paginated) Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"]
  }
}
```

---

## 1. Authentication

### `POST /api/v1/auth/login`
- **Auth**: None
- **Body**: `{ "email": "admin@example.com", "password": "password" }`
- **Success**: Returns the authenticated user profile and sets secure cookies.

### `POST /api/v1/auth/logout`
- **Auth**: Required
- **Success**: Clears secure cookies.

### `GET /api/v1/auth/me`
- **Auth**: Required
- **Success**: Returns current user profile.

### `POST /api/v1/auth/change-password`
- **Auth**: Required
- **Body**: `{ "currentPassword": "old", "newPassword": "new" }`

---

## 2. Profile

### `GET /api/v1/profile`
- **Auth**: Required
- **Success**:
```json
{
  "id": "user-123",
  "name": "Admin User",
  "email": "admin@stockinventra.com",
  "role": "ADMIN",
  "avatar": null,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### `PATCH /api/v1/profile`
- **Auth**: Required
- **Body**: Allowed fields: `name`, `avatar`

---

## 3. Products

**Query Parameters:** `?search=term&categoryId=id&status=IN_STOCK&page=1&limit=20&sortBy=createdAt&sortOrder=desc`

### `GET /api/v1/products`
- **Auth**: Required
- **Success**: List of products.

### `GET /api/v1/products/:id`
- **Auth**: Required

### `POST /api/v1/products`
- **Auth**: Required
- **Body**: 
```json
{
  "name": "Premium Coffee",
  "sku": "COF-001",
  "categoryId": "cat-1",
  "purchasePrice": 250,
  "marginPercent": 40,
  "discountPercent": 10,
  "initialStock": 100,
  "lowStockThreshold": 20,
  "description": "High quality beans."
}
```
**Business Rule:** Backend calculates `sellingPrice = purchasePrice + (purchasePrice * marginPercent / 100)` and `finalPrice = sellingPrice - (sellingPrice * discountPercent / 100)`.

### `PATCH /api/v1/products/:id`
- **Auth**: Required
- **Body**: Partial updates. Does NOT accept updates to `currentStock` (must use Inventory Adjustments).

### `DELETE /api/v1/products/:id`
- **Auth**: Required

---

## 4. Categories

### `GET /api/v1/categories`
### `GET /api/v1/categories/:id`
### `POST /api/v1/categories`
### `PATCH /api/v1/categories/:id`
### `DELETE /api/v1/categories/:id`

- **Fields**: `id`, `name`, `description`, `productCount`, `status`, `createdAt`, `updatedAt`

---

## 5. Inventory

### `GET /api/v1/inventory`
- **Query Params**: `search`, `categoryId`, `status`, `page`, `limit`
- **Response Data**: Returns list including `product`, `stockIn`, `sold`, `currentStock`, `minimumStock`, `status`, `lastUpdated`.

### `GET /api/v1/inventory/:productId`
### `GET /api/v1/inventory/movements`
### `POST /api/v1/inventory/adjustments`
- **Auth**: Required
- **Body**: `{ "productId": "id", "type": "ADJUSTMENT", "quantity": 5, "note": "Restock" }`
- **Business Rule**: Modifying `currentStock` directly via product updates is forbidden. Stock MUST change via controlled operations like PURCHASE, SALE, ADJUSTMENT, RETURN.

---

## 6. Sales

### `GET /api/v1/sales`
### `GET /api/v1/sales/:id`
### `POST /api/v1/sales`
- **Auth**: Required
- **Body**:
```json
{
  "items": [
    {
      "productId": "product-id",
      "quantity": 2,
      "discount": 10
    }
  ]
}
```
**Business Rule**: 
1. Validate product exists and has sufficient stock.
2. Read current `purchasePrice` and `sellingPrice`.
3. Calculate subtotal, finalAmount (after item discount), totalCost, grossProfit, and profitMargin.
4. Create Sale, Sale Items, Stock Movement (type: SALE), and decrease inventory. All transactionally.

### `POST /api/v1/sales/:id/cancel`
- **Auth**: Required

---

## 7. Dashboard

### `GET /api/v1/dashboard`
- **Query Param**: `period=thisMonth|last3Months|last6Months|last12Months`
- **Response**: `totalRevenue`, `totalProfit`, `totalProducts`, `currentStock`, `revenueTrend`, `profitTrend`, `topSellingProducts`.

---

## 8. Analytics

### `GET /api/v1/analytics`
- **Query**: `period`, `startDate`, `endDate`
- **Response**: `totalSales`, `totalProfit`, `unitsSold`, `averageOrderValue`, `revenueTrend`, `topSellingProducts`, `stockRecommendations` (Values: `INCREASE`, `MAINTAIN`, `REDUCE`).

---

## 9. Reports

### `GET /api/v1/reports`
### `GET /api/v1/reports/sales`
### `GET /api/v1/reports/profit`
### `GET /api/v1/reports/inventory`
### `GET /api/v1/reports/products`
- Returns analytical payload matching parameters. Future implementations will attach downloadable exports (e.g. `application/pdf` or `text/csv`).

---

## 10. Settings

### `GET /api/v1/settings`
### `PATCH /api/v1/settings`
- **Auth**: Required
- **Data Shape**:
```json
{
  "business": { "businessName": "", "email": "", "phone": "", "address": "", "logo": "" },
  "inventory": { "lowStockThreshold": 20, "defaultMargin": 40, "defaultDiscount": 0 },
  "currency": { "currency": "INR", "taxRate": 18 }
}
```

---

## HTTP Error Codes

- `400`: Validation error
- `401`: Unauthenticated
- `403`: Forbidden
- `404`: Resource not found
- `409`: Conflict
- `422`: Business validation error
- `500`: Internal server error
