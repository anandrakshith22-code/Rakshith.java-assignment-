# Supermarket Billing System

A modular POS starter with a React + Tailwind cashier interface, Express REST API, and PostgreSQL database managed by Prisma.

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Getting started

1. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL`.
2. Install dependencies with `npm install`.
3. Generate Prisma Client and apply the schema: `npm run db:generate` then `npm run db:migrate`.
4. Optionally load demo products: `npm run db:seed`.
5. Start the API and web app with `npm run dev`.

The Vite app is served at `http://localhost:5173`; the API listens on `http://localhost:4000`. Product search is available at `GET /api/v1/products?search=...`; checkout is `POST /api/v1/bills/checkout`.

## Deploying the frontend to Netlify

The repository includes `netlify.toml` for building and serving the client as a single-page app. Netlify can host the frontend, but the Express API and PostgreSQL database must also be deployed to publicly reachable services for product search and checkout to work.

1. Deploy the API and database, then configure the API's `DATABASE_URL`, `PORT`, and `CLIENT_ORIGIN` environment variables. Set `CLIENT_ORIGIN` to your Netlify site URL.
2. Import the repository into Netlify; it will use the build settings in `netlify.toml`.
3. In the Netlify site environment variables, set `VITE_API_URL` to the API origin (for example, `https://your-api.example.com`, without `/api/v1`), then trigger a new deploy.

When `VITE_API_URL` is unset, the client uses relative API paths, which work with the Vite development proxy locally.

## Checkout contract

```json
{
  "items": [{ "productId": "product-uuid", "quantity": 2 }],
  "paymentMethod": "CASH",
  "customerId": null,
  "couponCode": "OFF10"
}
```

Prices are stored and submitted from the database, never trusted from the client. Product prices are GST-exclusive; checkout applies each product's GST rate, splits GST evenly into CGST and SGST, then applies any valid item discount and bill coupon. The transaction locks inventory rows in a stable order, verifies every requested quantity, decrements stock, and creates the bill and its item snapshots atomically.

Coupon codes in the `OFF<number>` format apply that percentage off the eligible subtotal (for example, `OFF10` gives 10% off), capped at ₹500. Percentages must be between 1 and 100. The legacy `SAVE10` code remains accepted as an alias for `OFF10`. Replace the demo coupon catalog and add staff authentication/authorization before production deployment.
