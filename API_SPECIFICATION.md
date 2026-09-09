# 🌐 FarmConnect — REST API Specification

Base URL: `/api`

---

## 1. System & Health
* `GET /api/health`
  * Response: `{ status: "ok", service: "FarmConnect API", timestamp: String }`

---

## 2. Authentication & User Profiles (`/api/users`)
* `POST /api/users/sync`
  * Sync Firebase authenticated user record with MongoDB database.
  * Body: `{ firebaseUid, name, phone, email, role, language, location }`
* `GET /api/users/profile`
  * Header: `Authorization: Bearer <token>`
  * Response: User profile object with roles and active listings/orders.
* `PUT /api/users/profile`
  * Update profile details (language preference, delivery address, notification settings).

---

## 3. Farmer Crop Yield Marketplace (`/api/crops`)
* `GET /api/crops`
  * Query parameters: `category`, `district`, `state`, `minPrice`, `maxPrice`
  * Response: Array of crop listings with active status.
* `POST /api/crops`
  * Farmer creates a new crop lot.
  * Body: `{ cropName, category, quantityQuintals, expectedPricePerQuintal, location, images }`
* `GET /api/crops/:id`
  * Detailed view of a single crop yield including bidding history.
* `POST /api/crops/:id/bids`
  * Buyer places an offer/bid on a crop.
  * Body: `{ offeredPricePerQuintal, buyerName, buyerId }`
* `PATCH /api/crops/:id/bids/:bidId`
  * Farmer accepts or rejects a specific buyer bid.
  * Body: `{ status: "accepted" | "rejected" }`

---

## 4. Agri-Commerce Products (`/api/products`)
* `GET /api/products`
  * Query parameters: `category` (seeds/fertilizers/tools), `search`, `sort`
  * Response: Catalog of inputs sold by verified vendors.
* `POST /api/products`
  * Vendor adds new input product.
  * Body: `{ title, category, brand, price, discountPrice, stockQuantity, unit, description }`
* `GET /api/products/:id`
  * Full product specifications and seller details.

---

## 5. Orders & Transactions (`/api/orders`)
* `POST /api/orders`
  * Place an order for either marketplace produce or input supplies.
  * Body: `{ orderType, items: [{ itemId, quantity, unitPrice }], shippingAddress, paymentMethod }`
* `GET /api/orders/my-orders`
  * Fetch authenticated user's order history.
* `GET /api/orders/:id`
  * Track dispatch and shipment status.

---

## 6. AI Vision & Crop Pathology (`/api/ai`)
* `POST /api/ai/diagnose`
  * Payloads supported: `application/json` (`imageBase64`) OR `multipart/form-data` (`leafImage`)
  * Response:
    ```json
    {
      "success": true,
      "diagnosis": {
        "disease": "Tomato Early Blight (Alternaria solani)",
        "severity": "Moderate",
        "symptoms": "Concentric rings and yellow halo",
        "organicRemedy": "Copper sulfate spray and neem oil extract",
        "chemicalRemedy": "Mancozeb 2g/L"
      }
    }
    ```
* `GET /api/ai/history`
  * User's past leaf diagnostic records and treatment outcomes.

---

## 7. Market Intelligence & Mandi Rates (`/api/mandi`)
* `GET /api/mandi/rates`
  * Query parameters: `commodity`, `market`, `state`
  * Response: Modal, minimum, and maximum rates from APMC market records.
* `GET /api/mandi/trends/:commodity`
  * Historical price variance over the past 30 days.

---

## 8. Smart Weather Advisory (`/api/weather`)
* `GET /api/weather/current`
  * Query parameters: `lat`, `lng`
  * Response: Temperature, humidity, precipitation probability, and wind metrics.
* `GET /api/weather/advisory`
  * Agronomic guidance generated from rainfall and temperature forecasts.