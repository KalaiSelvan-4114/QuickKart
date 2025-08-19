# QuickKart - Fashion E-commerce Platform

A full-stack e-commerce platform for fashion with user, shop owner, and admin roles.

## Features

- **User Features**: Browse products, manage cart/wishlist, get AI styling advice
- **Shop Owner Features**: Manage inventory, process orders, track sales
- **Admin Features**: Approve shops, manage platform operations
- **AI Stylist**: Personalized fashion recommendations

## Tech Stack

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary for image uploads
- bcryptjs for password hashing

### Frontend
- React 19 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd quickkart-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/quickkart
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd quickkart-ui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
Sample/
├── quickkart-backend/          # Backend API
│   ├── controllers/           # Route controllers
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── middlewares/          # Authentication middleware
│   └── app.js               # Main server file
└── quickkart-ui/             # Frontend React app
    ├── src/
    │   ├── components/       # Reusable components
    │   ├── pages/           # Page components
    │   ├── api/             # API client
    │   └── App.jsx          # Main app component
    └── tailwind.config.js   # Tailwind configuration
```

## API Endpoints

### Authentication
- `POST /auth/user/signup` - User registration
- `POST /auth/user/login` - User login
- `POST /auth/shop/signup` - Shop registration
- `POST /auth/shop/login` - Shop login
- `POST /auth/admin/login` - Admin login

### User Routes
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/products` - Get available products
- `POST /user/cart/add` - Add to cart
- `GET /user/cart` - Get cart items

### Shop Routes
- `GET /shop/products` - Get shop products
- `POST /shop/products` - Add new product
- `PUT /shop/products/:id` - Update product
- `DELETE /shop/products/:id` - Delete product

### Admin Routes
- `GET /admin/shops/pending` - Get pending shops
- `PUT /admin/shops/:id/approve` - Approve shop

## Default Admin Credentials

- Email: `admin@quickkart.com`
- Password: `admin123`

## Recent Fixes

1. **Fixed Bearer Token Bug**: Updated auth middleware to properly handle Bearer tokens
2. **Added Tailwind CSS**: Properly configured Tailwind CSS with custom components
3. **Improved Error Handling**: Added better error handling in frontend components
4. **Added Route Protection**: Implemented ProtectedRoute component for secure navigation
5. **Fixed Axios Configuration**: Updated API client to use environment variables
6. **Enhanced UI**: Modernized all components with Tailwind CSS styling

## Development

The project is now ready for development with:
- ✅ Proper authentication flow
- ✅ Modern UI with Tailwind CSS
- ✅ Protected routes
- ✅ Error handling
- ✅ Responsive design
