# Flickart - MERN eCommerce Project (Flipkart Clone)

This is a Flipkart clone eCommerce project developed using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It's designed to demonstrate the functionality and features of a modern eCommerce website.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [Environment Variables](#environment-variables)

## Test Users

- **USER**
  - Email: test@test.com
  - Password: test123

- **ADMIN**
  - Email: store@flipkart.com
  - Password: admin123

## Features

- **User Authentication and Authorization:** Implemented user registration, login, and JWT-based authorization for secure access to user-specific data.
- **Product Catalog:** Display products with categories and provide a search functionality for users to find products easily.
- **Shopping Cart Management:** Allow users to add and remove products from their shopping carts, view cart contents, save later, and proceed to checkout.
- **Secure Payment Processing (Stripe Integration):** Implement Stripe payment gateway for secure and convenient online payments. Users can complete purchases using credit/debit cards.
- **User Order History and Order Management:** Store user order history and provide a user-friendly interface for order management, including order status and tracking.
- **Admin Panel for Product Management:** Admin users can manage product listings, categories, and view orders. Accessible via `/dashboard/admin` route (login required).
- **Responsive Design with Tailwind CSS and Material UI:** Utilize Tailwind CSS and Material UI for responsive and visually appealing user interfaces on both mobile and desktop devices.
- **Password Encryption using Bcrypt:** Securely store user passwords by hashing and salting them using the bcrypt library.
- **Image Storage with Cloudinary:** Store and manage product images using Cloudinary for efficient image storage and retrieval.

## Requirements

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed
- MongoDB instance (local or remote)
- Stripe API key (for payment processing)
- Cloudinary account and API credentials

## Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/aashish-dhiman/E-Commerce.git
   cd E-Commerce
   ```

2. **Setup the Backend:**
   - Navigate to the backend directory:
     ```sh
     cd backend
     ```
   - Create a `.env` file and add your environment variables (see the example below).
   - Install the dependencies:
     ```sh
     npm install
     ```
   - Start the backend server:
     ```sh
     npm run dev
     ```

3. **Setup the Frontend:**
   - Navigate to the frontend directory:
     ```sh
     cd ../client
     ```
   - Create a `.env` file and add your environment variables (see the example below).
   - Install the dependencies:
     ```sh
     npm install
     ```
   - Start the frontend development server:
     ```sh
     npm run dev
     ```

4. **Access the Application:**
   - Visit `http://localhost:5173` in your browser to access the Flipkart clone.
   - You can access the admin panel at `http://localhost:5173/dashboard/admin` (login required).

## Environment Variables

### Backend (.env)

```plaintext
PORT=8080
CORS_ORIGINS=https://your-frontend.example
MONGODB_URI=YOUR_MONGODB_BASE_URI/database_name
JWT_SECRET=RANDOM_STRING
CLOUD_NAME=CLOUDINARY_CLOUD_NAME
CLOUD_API_KEY=CLOUDINARY_API_KEY
CLOUD_SECRET=CLOUDINARY_SECRET_KEY
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
FLIPKART_AFFILIATE_ID=YOUR_FLIPKART_AFFILIATE_TRACKING_ID
FLIPKART_AFFILIATE_TOKEN=YOUR_FLIPKART_AFFILIATE_API_TOKEN
```

### Frontend (.env)

```plaintext
VITE_API=http://localhost:8080
VITE_STRIPE_PUBLISH_KEY=YOUR_STRIPE_PUBLISH_KEY
VITE_SERVER_URL=SERVER_BASE_URL_WITHOUT_TRAILING_SLASH (in case you want deployed server url- https://e-commerce-mgtd.onrender.com without any / at end)
VITE_DEMO_API_URL=https://fakestoreapi.com
```

For local development, `VITE_SERVER_URL` can be `http://localhost:8080` (the frontend also accepts the older `VITE_API` name). When the frontend is deployed on a different origin, set `CORS_ORIGINS` in `backend/.env` to its full origin, such as `https://shop.example.com`. Multiple origins can be comma-separated. Restart both servers after changing environment values.

### Flipkart Affiliate product catalog

The product catalog uses the official Affiliate API only when valid Affiliate API access is configured. Register at [Flipkart Affiliate](https://affiliate.flipkart.com/registerme), then generate the tracking ID and API token from the [API Token page](https://affiliate.flipkart.com/api/api-token) after signing in. See the [Affiliate API overview](https://affiliate.flipkart.com/api-docs/af_overview.html), [product API reference](https://affiliate.flipkart.com/api-docs/af_prod_ref.html), and [registration instructions](https://affiliate.flipkart.com/api-docs/af_register.html).

Put the generated values in `backend/.env` only:

```plaintext
FLIPKART_AFFILIATE_ID=your_tracking_id
FLIPKART_AFFILIATE_TOKEN=your_api_token
```

Do not add Affiliate credentials to `client/.env` or commit `backend/.env`. The Affiliate ID and token are sent by the Express backend as `Fk-Affiliate-Id` and `Fk-Affiliate-Token` headers. When either setting is missing, the catalog clearly identifies itself as demo data from Fake Store API. Once credentials are present, upstream authentication or API errors are shown instead of silently falling back to demo data. Affiliate products link to Flipkart using the official product URL; they do not enter the MongoDB-backed checkout flow.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve this project.
# Ritesh_flipkart

## Local fake payments

Checkout offers Stripe card payment and Cash on Delivery. Cash on Delivery places the order immediately, reserves current MongoDB stock, and records payment as due on delivery. Card payments use Stripe Checkout.

For local development without Stripe credentials, set both environment values:

```plaintext
# backend/.env
NODE_ENV=development
PAYMENT_MODE=fake

# client/.env
VITE_PAYMENT_MODE=fake
```

Restart the backend and Vite after changing environment files. Fake payments are accepted only when `NODE_ENV` is `development` or `test`; they create a local order and reduce stock using current MongoDB product data. They do not contact Stripe or move real money. Leave `PAYMENT_MODE=stripe` for Stripe Checkout.
