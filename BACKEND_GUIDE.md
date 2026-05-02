# 🚀 MINI E-COMMERCE BACKEND - COMPLETE REBUILD GUIDE

## 📋 Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Step-by-Step Setup](#setup-process)
4. [API Endpoints](#api-endpoints)
5. [Database Collections](#database-collections)
6. [Workflow Explanation](#workflow)

---

## 🛠️ Tech Stack

### Backend Technologies

| Technology        | Purpose                    | Why Use It?                                         |
| ----------------- | -------------------------- | --------------------------------------------------- |
| **Node.js**       | Runtime Environment        | JavaScript ko server-side run karne ke liye         |
| **Express.js**    | Web Framework              | REST API banane ke liye (routing, middleware)       |
| **MongoDB Atlas** | Cloud Database             | NoSQL database for flexible data storage            |
| **Mongoose**      | ODM (Object Data Modeling) | MongoDB ke saath easy interaction                   |
| **JWT**           | Authentication             | Token-based authentication (stateless)              |
| **bcryptjs**      | Password Hashing           | Passwords ko encrypt karne ke liye (security)       |
| **CORS**          | Cross-Origin Sharing       | Frontend se backend ko requests allow karne ke liye |
| **dotenv**        | Environment Variables      | Sensitive data (.env file) manage karne ke liye     |

---

## 📁 Project Structure

```
backend/
├── index.js                 # Main server entry point
├── package.json             # Dependencies & scripts
├── .env                     # Environment variables (NOT in git)
│
├── models/                  # Database Schemas (Mongoose Models)
│   ├── User.js              # Regular user schema
│   ├── Admin.js             # Admin user schema
│   ├── Product.js           # Product catalog schema
│   ├── Cart.js              # Shopping cart schema
│   ├── Order.js             # Order management schema
│   └── Category.js          # Product categories
│
├── routes/                  # API Route Handlers
│   ├── auth.js              # User authentication routes
│   ├── admin.js             # Admin panel routes
│   ├── product.js           # Product listing/search routes
│   ├── cart.js              # Cart operations routes
│   ├── order.js             # Order creation/history routes
│
├── middleware/              # Custom Middleware
│   ├── auth.js              # JWT verification for users
│   └── adminAuth.js         # JWT verification for admins
│
└── seed.js                  # Database seeding script (optional)
```

---

## ⚙️ STEP-BY-STEP SETUP PROCESS

### STEP 1: Project Initialize Karo

```bash
# New folder create karo
mkdir backend
cd backend

# npm initialize karo (package.json create hoga)
npm init -y
```

### STEP 2: Dependencies Install Karo

```bash
# Production dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken

# Development dependencies
npm install --save-dev nodemon
```

**package.json scripts add karo:**

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### STEP 3: Environment Variables Setup (.env file)

Create `.env` file in backend root:

```env
# MongoDB Connection String (MongoDB Atlas se milega)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/minimart?retryWrites=true&w=majority

# JWT Secret Key (koi bhi random string, secure rakho)
JWT_SECRET=your_super_secret_jwt_key_here_12345

# Server Port
PORT=5000

# Admin Secret Key (admin registration ke liye)
ADMIN_SECRET_KEY=MINIMART_ADMIN_2024

```

### STEP 4: Main Server File (index.js) Create Karo

```javascript
// 1. Environment variables load
require("dotenv").config();

// 2. Packages import
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 3. Routes import
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const adminRoutes = require("./routes/admin");

// 4. Express app setup
const app = express();
app.use(cors());
app.use(express.json());

// 5. Routes mount
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// 6. MongoDB connection & server start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB error:", err));
```

### STEP 5: Models Create Karo (Database Schemas)

**User.js:**

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
```

**Product.js:**

```javascript
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: String,
    category: { type: String, required: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
```

**Cart.js:**

```javascript
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
```

**Order.js:**

```javascript
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number,
    },
  ],
  total_amount: Number,
  payment_method: { type: String, default: "cod" },
  payment_status: { type: String, default: "pending" },
  order_status: { type: String, default: "confirmed" },
  shipping_address: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
```

### STEP 6: Middleware Create Karo

**middleware/auth.js (User Authentication):**

```javascript
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

**middleware/adminAuth.js (Admin Authentication):**

```javascript
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

### STEP 7: Routes Create Karo

**routes/auth.js (User Authentication):**

Key endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (JWT token milta hai)
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

**routes/product.js (Products):**

Key endpoints:

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search?q=phone` - Search products
- `GET /api/products/featured` - Get featured products

**routes/cart.js (Shopping Cart):**

Key endpoints:

- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart/add` - Add item to cart (protected)
- `POST /api/cart/update` - Update quantity (protected)
- `POST /api/cart/remove` - Remove item (protected)

**routes/order.js (Orders):**

Key endpoints:

- `POST /api/orders/checkout` - Create order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `DELETE /api/orders/:id` - Delete order (protected)

**routes/admin.js (Admin Panel):**

Key endpoints:

- `POST /api/admin/register` - Admin registration
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard stats (protected)
- Admin CRUD for products, orders, etc.

---

## 🔄 COMPLETE WORKFLOW

### 1️⃣ USER REGISTRATION FLOW

```
User fills form → Frontend POST /api/auth/register
→ Backend validates → Password hash (bcrypt)
→ Save to MongoDB → Response: "User registered"
```

### 2️⃣ USER LOGIN FLOW

```
User enters credentials → Frontend POST /api/auth/login
→ Backend finds user → Password verify (bcrypt.compare)
→ Generate JWT token → Response: { token }
→ Frontend stores in localStorage
```

### 3️⃣ PROTECTED ROUTE FLOW

```
Frontend request → Headers: Authorization: Bearer <token>
→ auth middleware → JWT verify
→ Extract userId → req.userId set
→ Route handler executes → Response sent
```

### 4️⃣ ADD TO CART FLOW

```
User clicks "Add to Cart" → POST /api/cart/add { productId, quantity }
→ auth middleware (verify user)
→ Find/Create cart for user
→ Check if product already in cart
→ Update quantity or add new item
→ Save to MongoDB → Response: updated cart
```

### 5️⃣ CHECKOUT FLOW

```
User clicks checkout → POST /api/payment/simple-checkout { address }
→ auth middleware verifies user
→ Get user's cart from DB
→ Calculate total amount
→ Create Order document
→ Clear cart
→ Response: order confirmation
```

---

## 🗄️ DATABASE COLLECTIONS

| Collection     | Purpose            | Key Fields                                                    |
| -------------- | ------------------ | ------------------------------------------------------------- |
| **users**      | Regular users      | name, email, password (hashed), phone                         |
| **admins**     | Admin users        | name, email, password (hashed), role                          |
| **products**   | Product catalog    | name, description, price, image, category, stock              |
| **carts**      | Shopping carts     | user (ref), items[{product, quantity}]                        |
| **orders**     | Order history      | user (ref), items, total_amount, payment_status, order_status |
| **categories** | Product categories | name, description, isActive                                   |

---

## 🔐 SECURITY FEATURES

1. **Password Hashing**: bcrypt se passwords encrypt (10 rounds)
2. **JWT Authentication**: Stateless token-based auth (1 day expiry)
3. **Protected Routes**: Middleware se unauthorized access block
4. **Admin Separation**: Alag authentication for admin users
5. **Input Validation**: Required fields, unique emails, etc.

---

## 🚀 HOW TO START

```bash
# Backend directory mein jao
cd backend

# Dependencies install karo
npm install

# .env file create karo aur variables add karo
# MongoDB URI, JWT_SECRET, PORT, etc.

# Development mode mein run karo (auto-restart on file changes)
npm run dev

# Production mode mein run karo
npm start
```

**Server running message:**

```
✅ MongoDB Atlas connected successfully
🚀 Server running on port 5000
```

---

## 📝 NEXT STEPS

1. ✅ Backend files sabhi mein detailed comments add ho gaye
2. 🔨 Dubara project banane ke liye:
   - Steps follow karo is guide se
   - MongoDB Atlas account create karo
   - .env file setup karo
   - npm install → npm run dev
3. 🎨 Frontend setup karoge toh axios se API calls karo
4. 🧪 Postman/Thunder Client se API test karo

---

## 🔧 USEFUL COMMANDS

```bash
# Install specific package
npm install package-name

# Remove package
npm uninstall package-name

# Update all packages
npm update

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Check for vulnerabilities
npm audit
npm audit fix
```

---

## 📚 IMPORTANT FILES TO CHECK

All files mentioned in this guide have been updated with **comprehensive Hindi/English comments** explaining:

- What each section does
- Why we use specific approaches
- How data flows through the system
- Example usage and data structures

Check these files for detailed explanations:

- ✅ `backend/index.js` - Complete server setup
- ✅ `backend/models/*.js` - All database schemas
- ✅ `backend/middleware/*.js` - Authentication logic
- ✅ `backend/routes/auth.js` - User authentication with full flow

---

**Happy Coding! 🎉**

Kisi step mein doubt ho toh code files ke comments check karo - sabhi details wahan explain ki gayi hain!
