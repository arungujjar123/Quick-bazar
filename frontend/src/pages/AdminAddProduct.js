import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminAddProduct() {
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
    stock: "",
    shopId: "",
  });
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [shopsError, setShopsError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "Groceries",
    "Dairy & Bakery",
    "Fruits & Vegetables",
    "Snacks & Drinks",
    "Beauty & Personal Care",
    "Household Items",
    "Stationery",
    "Other",
  ];

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLoading(false);
      navigate("/admin/login");
      return;
    }

    const fetchShops = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/shops/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const shopList = response.data || [];
        setShops(shopList);
        if (shopList.length > 0) {
          setProduct((prev) => ({
            ...prev,
            shopId: prev.shopId || shopList[0]._id,
          }));
        }
      } catch (error) {
        console.error("Error fetching shops:", error);
        setShopsError("Failed to load shops");
      } finally {
        setShopsLoading(false);
      }
    };

    fetchShops();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Validation
    if (!product.name || !product.price || !product.description) {
      alert("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!product.shopId) {
      alert("Please select a shop for this product");
      setLoading(false);
      return;
    }

    if (parseFloat(product.price) <= 0) {
      alert("Price must be greater than 0");
      setLoading(false);
      return;
    }

    try {
      const imageUrl = product.image.trim();
      const productData = {
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock) || 0,
        imageUrl: imageUrl || undefined,
      };

      // Remove the old image field
      delete productData.image;
      if (!productData.imageUrl) {
        delete productData.imageUrl;
      }

      await axios.post(`${API_BASE_URL}/api/admin/products`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Product added successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      alert(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProduct({
      name: "",
      price: "",
      description: "",
      image: "",
      category: "",
      stock: "",
      shopId: product.shopId,
    });
  };

  return (
    <div className="admin-dashboard">
      {/* Admin Header */}
      <div className="admin-header">
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 0",
          }}
        >
          <h1 style={{ color: "#333", fontSize: "2rem" }}>
            ➕ Add New Product
          </h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button
              onClick={() => navigate("/admin/products")}
              className="btn btn-primary"
            >
              📦 All Products
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="btn btn-success"
            >
              🏠 Dashboard
            </button>
          </div>
        </div>
      </div>

      <div
        className="container"
        style={{ marginTop: "2rem", maxWidth: "800px" }}
      >
        <div className="cart-container">
          {shopsLoading && <div className="loading">Loading shops...</div>}
          {!shopsLoading && shops.length === 0 && (
            <div className="empty-state" style={{ marginBottom: "1rem" }}>
              <h3>No shop found</h3>
              <p>Create a shop before adding products.</p>
              <button
                type="button"
                onClick={() => navigate("/admin/shops")}
                className="btn btn-primary"
              >
                Create Shop
              </button>
            </div>
          )}
          {shopsError && (
            <div className="error-message" style={{ marginBottom: "1rem" }}>
              {shopsError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* Product Name */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                  required
                  placeholder="Enter product name"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>

              {/* Price */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.price}
                  onChange={(e) =>
                    setProduct({ ...product, price: e.target.value })
                  }
                  required
                  placeholder="0.00"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Description *
              </label>
              <textarea
                value={product.description}
                onChange={(e) =>
                  setProduct({ ...product, description: e.target.value })
                }
                required
                placeholder="Enter detailed product description"
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              {/* Shop */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Shop *
                </label>
                <select
                  value={product.shopId}
                  onChange={(e) =>
                    setProduct({ ...product, shopId: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="">Select shop</option>
                  {shops.map((shop) => (
                    <option key={shop._id} value={shop._id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Category
                </label>
                <select
                  value={product.category}
                  onChange={(e) =>
                    setProduct({ ...product, category: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={product.stock}
                  onChange={(e) =>
                    setProduct({ ...product, stock: e.target.value })
                  }
                  placeholder="0"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "2px solid #e0e0e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>

            {/* Image URL */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Image URL
              </label>
              <input
                type="url"
                value={product.image}
                onChange={(e) =>
                  setProduct({ ...product, image: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>

            {/* Image Preview */}
            {product.image && (
              <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                <p
                  style={{
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Preview:
                </p>
                <img
                  src={product.image}
                  alt="Product preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <div
                  style={{
                    display: "none",
                    color: "#d9534f",
                    fontStyle: "italic",
                    marginTop: "0.5rem",
                  }}
                >
                  Failed to load image. Please check the URL.
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "2rem",
              }}
            >
              <button
                type="submit"
                disabled={loading || shopsLoading || shops.length === 0}
                className="btn btn-primary"
                style={{
                  padding: "0.75rem 2rem",
                  fontSize: "1rem",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Adding Product..." : "➕ Add Product"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="btn btn-danger"
                style={{
                  padding: "0.75rem 2rem",
                  fontSize: "1rem",
                }}
              >
                🔄 Reset Form
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/products")}
                className="btn btn-success"
                style={{
                  padding: "0.75rem 2rem",
                  fontSize: "1rem",
                }}
              >
                📦 View All Products
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminAddProduct;
