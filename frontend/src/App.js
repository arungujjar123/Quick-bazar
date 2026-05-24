import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import Offers from "./pages/Offers";
import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminOrders from "./pages/AdminOrders";
import AdminCategories from "./pages/AdminCategories";
import AdminShops from "./pages/AdminShops";
import AdminSupport from "./pages/AdminSupport";
import Navbar from "./Navbar";
import { CartProvider } from "./context/CartContext";
import SupportChatWidget from "./components/SupportChatWidget";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const UserLayout = ({ children }) => (
    <div>
      <Navbar />
      {children}
      <Footer />
      <SupportChatWidget />
    </div>
  );

  return (
    <CartProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
          // it adopt the new features of React Router v7
        }}
      >
        <Routes>
          {/* Admin Routes (no navbar) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/add-product" element={<AdminAddProduct />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/shops" element={<AdminShops />} />
          <Route path="/admin/support" element={<AdminSupport />} />

          {/* Regular Routes (with navbar) */}
          <Route
            path="/"
            element={
              <UserLayout>
                <Home />
              </UserLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <UserLayout>
                <ProductDetail />
              </UserLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <UserLayout>
                <Cart />
              </UserLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <UserLayout>
                <Checkout />
              </UserLayout>
            }
          />
          <Route
            path="/orders"
            element={
              <UserLayout>
                <Orders />
              </UserLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <UserLayout>
                <Profile />
              </UserLayout>
            }
          />
          <Route
            path="/categories"
            element={
              <UserLayout>
                <Categories />
              </UserLayout>
            }
          />
          <Route
            path="/offers"
            element={
              <UserLayout>
                <Offers />
              </UserLayout>
            }
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
