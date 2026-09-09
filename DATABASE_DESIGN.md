# 🗄️ FarmConnect — Database Architecture & Schema Design

## Primary Database: MongoDB

---

### 1. Users Collection (`users`)
Stores profile data across all platform roles (Farmer, Buyer, Seller, Expert, Admin).

```json
{
  "_id": "ObjectId",
  "firebaseUid": "String (unique, indexed)",
  "name": "String",
  "phone": "String (unique)",
  "email": "String (optional)",
  "role": "String (enum: ['farmer', 'buyer', 'seller', 'expert', 'admin'])",
  "language": "String (default: 'en', enum: ['en', 'kn', 'hi'])",
  "location": {
    "state": "String",
    "district": "String",
    "village": "String",
    "coordinates": { "lat": "Number", "lng": "Number" }
  },
  "isVerified": "Boolean (default: false)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
{
  "_id": "ObjectId",
  "farmerId": "ObjectId (ref: 'users', indexed)",
  "cropName": "String (indexed)",
  "category": "String (enum: ['grains', 'pulses', 'vegetables', 'fruits', 'spices', 'oilseeds'])",
  "quantityQuintals": "Number",
  "expectedPricePerQuintal": "Number",
  "harvestDate": "Date",
  "images": ["String (URLs/base64 pointers)"],
  "location": {
    "district": "String",
    "state": "String"
  },
  "status": "String (enum: ['active', 'negotiating', 'sold', 'expired'], default: 'active')",
  "bids": [
    {
      "bidderId": "ObjectId (ref: 'users')",
      "buyerName": "String",
      "offeredPricePerQuintal": "Number",
      "status": "String (enum: ['pending', 'accepted', 'rejected'], default: 'pending')",
      "createdAt": "Date"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
{
  "_id": "ObjectId",
  "sellerId": "ObjectId (ref: 'users', indexed)",
  "title": "String",
  "category": "String (enum: ['seeds', 'fertilizers', 'pesticides', 'equipment', 'organic_inputs'])",
  "brand": "String",
  "price": "Number",
  "discountPrice": "Number",
  "stockQuantity": "Number",
  "unit": "String (enum: ['kg', 'liter', 'packet', 'unit'])",
  "description": "String",
  "images": ["String"],
  "ratings": {
    "average": "Number (default: 0)",
    "count": "Number (default: 0)"
  },
  "createdAt": "Date"
}
{
  "_id": "ObjectId",
  "orderNumber": "String (unique)",
  "buyerId": "ObjectId (ref: 'users')",
  "sellerId": "ObjectId (ref: 'users')",
  "orderType": "String (enum: ['ecom_product', 'farm_yield'])",
  "items": [
    {
      "itemId": "ObjectId",
      "name": "String",
      "quantity": "Number",
      "unitPrice": "Number",
      "totalPrice": "Number"
    }
  ],
  "totalAmount": "Number",
  "paymentStatus": "String (enum: ['pending', 'paid', 'failed', 'refunded'])",
  "paymentMethod": "String (enum: ['upi', 'cod', 'card', 'netbanking'])",
  "deliveryStatus": "String (enum: ['placed', 'confirmed', 'in_transit', 'delivered', 'cancelled'])",
  "shippingAddress": {
    "fullName": "String",
    "phone": "String",
    "street": "String",
    "district": "String",
    "state": "String",
    "pincode": "String"
  },
  "createdAt": "Date"
}
{
  "_id": "ObjectId",
  "commodity": "String (indexed)",
  "market": "String (indexed)",
  "district": "String",
  "state": "String",
  "minPrice": "Number",
  "maxPrice": "Number",
  "modalPrice": "Number",
  "arrivalDate": "Date",
  "updatedAt": "Date"
}