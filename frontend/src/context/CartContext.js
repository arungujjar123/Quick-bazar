import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cart, setCart] = useState({ items: [] });

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartItemCount(0);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/cart`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const totalItems = response.data.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      setCartItemCount(totalItems);
      setCart(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);

      // Handle authentication errors
      if (error.response?.status === 401) {
        localStorage.removeItem("token"); // Remove invalid token
        setCartItemCount(0);
      }

      setCartItemCount(0);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "Please login to add items to cart" };
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/cart/add`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local state with the response
      if (response.data.itemCount) {
        setCartItemCount(response.data.itemCount);
      }

      await fetchCartCount(); // Refresh cart count to ensure accuracy
      return {
        success: true,
        message: response.data.message || "Product added to cart successfully!",
      };
    } catch (error) {
      console.error("Error adding to cart:", error);

      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        localStorage.removeItem("token"); // Remove invalid token
        return {
          success: false,
          message: "Your session has expired. Please login again.",
          requiresLogin: true,
        };
      }

      const errorMessage =
        error.response?.data?.message || "Failed to add to cart";
      return { success: false, message: errorMessage };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "Please login to modify cart" };
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/cart/remove`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local state with the response
      if (response.data.itemCount !== undefined) {
        setCartItemCount(response.data.itemCount);
      }

      await fetchCartCount(); // Refresh cart count to ensure accuracy
      return {
        success: true,
        message: response.data.message || "Item removed from cart",
      };
    } catch (error) {
      console.error("Error removing from cart:", error);

      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        localStorage.removeItem("token"); // Remove invalid token
        return {
          success: false,
          message: "Your session has expired. Please login again.",
          requiresLogin: true,
        };
      }

      const errorMessage =
        error.response?.data?.message || "Failed to remove item";
      return { success: false, message: errorMessage };
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "Please login to modify cart" };
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/cart/update`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update local state with the response
      if (response.data.itemCount !== undefined) {
        setCartItemCount(response.data.itemCount);
      }

      await fetchCartCount(); // Refresh cart count to ensure accuracy
      return {
        success: true,
        message: response.data.message || "Cart updated successfully",
      };
    } catch (error) {
      console.error("Error updating cart:", error);

      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        localStorage.removeItem("token"); // Remove invalid token
        return {
          success: false,
          message: "Your session has expired. Please login again.",
          requiresLogin: true,
        };
      }

      const errorMessage =
        error.response?.data?.message || "Failed to update cart";
      return { success: false, message: errorMessage };
    }
  };

  const clearCart = () => {
    setCartItemCount(0);
    setCart({ items: [] });
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  const value = {
    cartItemCount,
    cart,
    cartItems: cart.items || [],
    fetchCartCount,
    addToCart,
    removeFromCart,
    updateQuantity: updateCartItem,
    updateCartItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// This context provides global cart state management across the entire application.
