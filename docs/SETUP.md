# biozah setup

## Firebase

Create a Firebase project and enable Authentication > Email/Password and Cloud Firestore. Create a Firebase web app and set the `NEXT_PUBLIC_FIREBASE_*` variables. Create a Firebase service-account key and set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` server-side. Never put the private key in a `NEXT_PUBLIC_*` variable.

Deploy [firestore.rules](../firestore.rules). Browser clients are denied direct data access; authenticated Next.js server routes use Firebase Admin after verifying the admin session.

On server startup, `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` create the default Firebase Auth user only when that email does not exist. Existing users are not overwritten. `ADMIN_EMAILS` remains the explicit administrator allowlist.

## Firestore collections

### `categories/{categoryId}`

`name`, `slug`, `description`, `image_url`, `active`, `created_at`, `updated_at`

### `products/{productId}`

`name`, `slug`, `description`, `category_id`, `price`, `currency`, `image_url`, `image_public_id`, `stock`, `active`, `featured`, `created_at`, `updated_at`

### `orders/{orderId}`

`order_id`, `customer_name`, `email`, `phone`, `wilaya`, `commune`, `address`, `delivery_method`, `payment_method`, `subtotal`, `delivery_cost`, `total`, `status`, `items`, `created_at`, `updated_at`

`items` is an embedded immutable array containing `product_id`, `product_name`, `quantity`, `unit_price`, and `subtotal`, preserving historical names and prices.

## Legacy data migration

The old Sheets implementation has been removed from the application. Before changing the old source, export the `Categories`, `Products`, and `Orders` data to JSON shaped like:

```json
{
  "categories": [{ "id": "cat-1", "name": "Skincare", "slug": "skincare", "description": "", "image_url": "", "active": true }],
  "products": [{ "id": "product-1", "name": "Example", "slug": "example", "description": "", "category_id": "cat-1", "price": 1000, "currency": "DZD", "image_url": "", "image_public_id": "", "stock": 5, "active": true, "featured": false }],
  "orders": [{ "order_id": "BZ-1", "customer_name": "Example", "email": "customer@example.com", "items": [] }],
  "orderItems": [{ "order_id": "BZ-1", "product_id": "product-1", "product_name": "Example", "quantity": 1, "unit_price": 1000, "subtotal": 1000 }]
}
```

Run manually with the project environment loaded:

```bash
node scripts/firestore-import.mjs migration/firestore-export.json
```

The default mode skips existing document IDs and never deletes source data. Use `--overwrite` only after reviewing the export and a Firestore backup. The script is never run automatically.

## Cloudinary and deployment

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. Images remain in Cloudinary; Firestore stores only the URL and public ID. Admin uploads use signed direct uploads and the API secret stays server-only.

Set `RESEND_API_KEY` and `ORDER_EMAIL_FROM` for confirmations. Run `npm install`, then `npm run dev`. For Firebase App Hosting or Vercel, configure the same server-only variables and deploy `firestore.rules` through the Firebase CLI.
