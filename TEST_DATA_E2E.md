# QuickBazaar End-to-End Test Data

Use this data to verify the complete flow:

1. Admin registers
2. Admin creates shop and products
3. Customer registers and logs in
4. Customer adds products to cart and places order

## 1) Admin Registration Data

- Name: Aarav Merchant
- Email: aarav.merchant@quickbazaar.test
- Password: Admin@123
- Confirm Password: Admin@123
- Admin Access Key (secretKey): MINIMART_ADMIN_2024

Notes:
- If your backend `.env` has `ADMIN_SECRET_KEY`, use that value instead of `MINIMART_ADMIN_2024`.

## 2) Shop Creation Data (Admin -> Manage Shops)

Create at least one shop with this sample:

- Shop Name: Heritage Bakes
- City: San Francisco
- Address: 220 Market Street
- Latitude: 37.7749
- Longitude: -122.4194
- Delivery Radius (km): 7

Optional second shop:

- Shop Name: Bloom & Vine
- City: San Francisco
- Address: 88 Valencia Street
- Latitude: 37.7599
- Longitude: -122.4148
- Delivery Radius (km): 5

## 3) Product Data (Admin -> Add Product)

Add these products to the shop(s):

### Product A
- Name: Sea Salt Rosemary Focaccia
- Price: 8.00
- Description: Slow-fermented focaccia topped with rosemary and sea salt.
- Category: Bakery
- Stock Quantity: 30
- Image URL: https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=900&q=80

### Product B
- Name: Pure Wildflower Honey
- Price: 12.50
- Description: Raw wildflower honey from local apiaries.
- Category: Pantry
- Stock Quantity: 25
- Image URL: https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80

### Product C
- Name: Herbed Artisan Goat Cheese
- Price: 14.20
- Description: Small-batch goat cheese infused with seasonal herbs.
- Category: Dairy
- Stock Quantity: 18
- Image URL: https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=900&q=80

### Product D
- Name: Morning Flake Box
- Price: 18.50
- Description: Freshly baked butter croissants, box of 6.
- Category: Bakery
- Stock Quantity: 12
- Image URL: https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80

## 4) Customer Registration Data

- Name: Mia Customer
- Email: mia.customer@quickbazaar.test
- Phone: +1 (415) 555-0101
- Password: Customer@123
- Confirm Password: Customer@123

## 5) Checkout / Address Data

Use these values on checkout:

- Full Name: Mia Customer
- Phone: +1 (415) 555-0101
- Street Address: 450 Mission Street
- City: San Francisco
- State: California
- ZIP: 94105

## 6) Verification Checklist

- Admin register succeeds and redirects to dashboard.
- Admin can create at least one shop.
- Admin can add products linked to that shop.
- Customer register succeeds.
- Customer login succeeds.
- Customer can see products on home/category/product pages.
- Customer can add products to cart.
- Cart updates quantity and totals correctly.
- Checkout places order successfully.
- Customer sees order in Orders page.
- Admin sees new order in Admin Orders page and can update status.

## 7) Useful Troubleshooting

- Admin register failing with secret key error:
  - Confirm backend `ADMIN_SECRET_KEY` and use exact same value in UI.
- Add Product failing with shop required:
  - Create a shop first in Admin Shops page.
- No products visible to customer:
  - Confirm products were created successfully and have stock > 0.
