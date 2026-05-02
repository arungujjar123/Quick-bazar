import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: "",
    stock: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    fetchProducts();
  }, []);

  const pageSize = 4;

  const checkAdminAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
      setLoading(false);
    }
  };

  const getPlaceholderImage = (label) => {
    const text = (label || "Product").toString().slice(0, 16);
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120">' +
      '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#e9dfd4"/><stop offset="100%" stop-color="#d5c3b0"/></linearGradient></defs>' +
      '<rect width="100%" height="100%" fill="url(#g)"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#755e4d" font-family="Arial" font-size="18">' +
      text +
      "</text></svg>";
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setEditForm({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.imageUrl,
      category: product.category || "",
      stock: product.stock || 0,
    });
  };

  const handleSaveEdit = async (productId) => {
    const token = localStorage.getItem("adminToken");
    try {
      // Prepare the data with correct field names for backend
      const updateData = {
        ...editForm,
        imageUrl: editForm.image,
      };
      delete updateData.image;

      await axios.put(
        `${API_BASE_URL}/api/admin/products/${productId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setProducts(
        products.map((p) =>
          p._id === productId
            ? {
                ...p,
                ...editForm,
                price: parseFloat(editForm.price),
                stock: parseInt(editForm.stock),
              }
            : p
        )
      );

      setEditingProduct(null);
      alert("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  const handleDelete = async (productId, productName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProducts(products.filter((p) => p._id !== productId));
      alert("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setEditForm({
      name: "",
      price: "",
      description: "",
      image: "",
      category: "",
      stock: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const filteredProducts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    let output = [...products];

    if (normalized) {
      output = output.filter((product) => {
        return (
          product.name?.toLowerCase().includes(normalized) ||
          product.category?.toLowerCase().includes(normalized) ||
          product.description?.toLowerCase().includes(normalized)
        );
      });
    }

    if (categoryFilter !== "all") {
      output = output.filter(
        (product) => (product.category || "uncategorized") === categoryFilter,
      );
    }

    output.sort((a, b) => {
      if (sortBy === "price") {
        return Number(a.price || 0) - Number(b.price || 0);
      }
      if (sortBy === "stock") {
        return Number(a.stock || 0) - Number(b.stock || 0);
      }
      return (a.name || "").localeCompare(b.name || "");
    });

    return output;
  }, [products, searchTerm, categoryFilter, sortBy]);

  const categories = useMemo(() => {
    const set = new Set(
      products.map((product) => product.category || "uncategorized"),
    );
    return ["all", ...Array.from(set)];
  }, [products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredProducts.length);
  const currentItems = filteredProducts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortBy]);

  const activeStock = products.reduce(
    (sum, product) => sum + Number(product.stock || 0),
    0,
  );
  const categoryCount = categories.filter((value) => value !== "all").length;
  const lowStockCount = products.filter((product) => Number(product.stock || 0) <= 5).length;

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="qb-admin-shell">
      <aside className="qb-admin-left-rail">
        <div className="qb-admin-left-brand">
          <h2>Bazaar Admin</h2>
          <p>Management Portal</p>
        </div>

        <nav className="qb-admin-left-nav">
          <button type="button" onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
          <button type="button" className="active" onClick={() => navigate("/admin/products")}>Products</button>
          <button type="button" onClick={() => navigate("/admin/orders")}>Orders</button>
          <button type="button" onClick={() => navigate("/admin/categories")}>Categories</button>
          <button type="button" onClick={() => navigate("/admin/shops")}>Settings</button>
          <button type="button">Support</button>
        </nav>

        <div className="qb-admin-left-bottom">
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="qb-admin-content products">
        <header className="qb-admin-content-header">
          <div>
            <h1>Products Inventory</h1>
            <p>Manage your artisanal marketplace offerings and stock levels.</p>
          </div>
          <button type="button" onClick={() => navigate("/admin/add-product")}>+ Add New Product</button>
        </header>

        <div className="qb-admin-toolbar-row">
          <div className="qb-admin-toolbar-search">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products by name, SKU, or category..."
            />
          </div>

          <div className="qb-admin-toolbar-actions">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "Filter" : category}
                </option>
              ))}
            </select>

            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
          </div>
        </div>

        <section className="qb-inventory-table-card">
          {products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Add your first product to get started.</p>
            </div>
          ) : (
            <>
              <table className="qb-inventory-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((product) => {
                    const lowStock = Number(product.stock || 0) <= 5;

                    return (
                      <tr key={product._id}>
                        <td>
                          <div className="qb-product-cell">
                            <img
                              src={product.imageUrl || product.image || getPlaceholderImage(product.name)}
                              alt={product.name}
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = getPlaceholderImage(product.name);
                              }}
                            />
                            <div>
                              {editingProduct === product._id ? (
                                <>
                                  <input
                                    value={editForm.name}
                                    onChange={(event) =>
                                      setEditForm({ ...editForm, name: event.target.value })
                                    }
                                  />
                                  <small>SKU: QB-{product._id.slice(-5).toUpperCase()}</small>
                                </>
                              ) : (
                                <>
                                  <strong>{product.name}</strong>
                                  <small>SKU: QB-{product._id.slice(-5).toUpperCase()}</small>
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          {editingProduct === product._id ? (
                            <input
                              value={editForm.category}
                              onChange={(event) =>
                                setEditForm({ ...editForm, category: event.target.value })
                              }
                            />
                          ) : (
                            <span className={`qb-category-pill ${
                              (product.category || "misc").toLowerCase().replace(/\s+/g, "-")
                            }`}>
                              {product.category || "Uncategorized"}
                            </span>
                          )}
                        </td>

                        <td>
                          {editingProduct === product._id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.price}
                              onChange={(event) =>
                                setEditForm({ ...editForm, price: event.target.value })
                              }
                            />
                          ) : (
                            <strong>${Number(product.price || 0).toFixed(2)}</strong>
                          )}
                        </td>

                        <td>
                          {editingProduct === product._id ? (
                            <input
                              type="number"
                              value={editForm.stock}
                              onChange={(event) =>
                                setEditForm({ ...editForm, stock: event.target.value })
                              }
                            />
                          ) : (
                            <span className={`qb-stock-state ${lowStock ? "low" : "ok"}`}>
                              {lowStock
                                ? `Only ${product.stock || 0} left`
                                : `${product.stock || 0} in stock`}
                            </span>
                          )}
                        </td>

                        <td>
                          {editingProduct === product._id ? (
                            <div className="qb-row-actions">
                              <button type="button" onClick={() => handleSaveEdit(product._id)}>
                                Save
                              </button>
                              <button type="button" onClick={cancelEdit}>
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="qb-row-actions icon-only">
                              <button type="button" onClick={() => handleEdit(product)} aria-label="Edit product">
                                ✎
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(product._id, product.name)}
                                aria-label="Delete product"
                              >
                                🗑
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="qb-table-pagination">
                <span>
                  Showing {filteredProducts.length === 0 ? 0 : startIndex + 1} - {endIndex} of {filteredProducts.length} products
                </span>
                <div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }).slice(0, 5).map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        className={currentPage === page ? "active" : ""}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ›
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="qb-inventory-metrics">
          <article>
            <h4>Active Stock</h4>
            <strong>{activeStock.toLocaleString()}</strong>
            <p>+12% increase from last month</p>
          </article>
          <article>
            <h4>Categories</h4>
            <strong>{categoryCount}</strong>
            <p>Spanning your marketplace departments</p>
          </article>
          <article>
            <h4>Low Stock Alerts</h4>
            <strong>{lowStockCount.toString().padStart(2, "0")}</strong>
            <p>Requires immediate restocking</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default AdminProducts;
