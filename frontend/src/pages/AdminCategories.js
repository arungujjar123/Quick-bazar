import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editDraft, setEditDraft] = useState({ name: "", description: "" });
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    fetchCategories();
  }, []);

  const checkAdminAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      setError("Category name is required");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
      };
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/categories`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setCategories((prev) => [response.data, ...prev]);
      setNewCategory({ name: "", description: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding category:", error);
      setError(error.response?.data?.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category._id);
    setEditDraft({
      name: category.name || "",
      description: category.description || "",
    });
  };

  const handleUpdateCategory = async (id) => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    if (!editDraft.name.trim()) {
      setError("Category name is required");
      return;
    }

    setError("");

    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/categories/${id}`,
        {
          name: editDraft.name.trim(),
          description: editDraft.description.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setCategories((prev) =>
        prev.map((cat) => (cat._id === id ? response.data : cat)),
      );
      setEditingCategory(null);
    } catch (error) {
      console.error("Error updating category:", error);
      setError(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    setError("");

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      setError(error.response?.data?.message || "Failed to delete category");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    navigate("/admin/login");
  };

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) => {
      const name = (category.name || "").toLowerCase();
      const description = (category.description || "").toLowerCase();
      return name.includes(query) || description.includes(query);
    });
  }, [categories, searchTerm]);

  const totalProducts = categories.reduce(
    (sum, category) => sum + Number(category.productCount || 0),
    0,
  );

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading categories...</div>
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
          <button type="button" onClick={() => navigate("/admin/products")}>Products</button>
          <button type="button" onClick={() => navigate("/admin/orders")}>Orders</button>
          <button type="button" className="active" onClick={() => navigate("/admin/categories")}>Categories</button>
          <button type="button" onClick={() => navigate("/admin/shops")}>Settings</button>
          <button type="button">Support</button>
        </nav>

        <div className="qb-admin-left-bottom with-secondary">
          <button type="button" onClick={() => navigate("/")}>View Shop</button>
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="qb-admin-content categories">
        <header className="qb-admin-content-header">
          <div>
            <h1>Category Management</h1>
            <p>Organize catalog taxonomy and keep product discovery clean.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? "Close Form" : "+ Add Category"}
          </button>
        </header>

        {error && <div className="qb-admin-message error">{error}</div>}

        <section className="qb-categories-stats-row">
          <article>
            <h4>Total Categories</h4>
            <strong>{categories.length}</strong>
            <p>All category groups configured</p>
          </article>
          <article>
            <h4>Total Products Tagged</h4>
            <strong>{totalProducts}</strong>
            <p>Products linked to categories</p>
          </article>
          <article>
            <h4>Search Result</h4>
            <strong>{filteredCategories.length}</strong>
            <p>Matching current filter</p>
          </article>
        </section>

        <section className="qb-categories-toolbar">
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search category by name or description..."
          />
        </section>

        {showAddForm && (
          <section className="qb-category-form-card">
            <h3>Create New Category</h3>
            <p>Add a category to group products and improve storefront discovery.</p>
            <div className="qb-category-form-grid">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory.name}
                onChange={(event) =>
                  setNewCategory({ ...newCategory, name: event.target.value })
                }
              />
              <input
                type="text"
                placeholder="Description"
                value={newCategory.description}
                onChange={(event) =>
                  setNewCategory({
                    ...newCategory,
                    description: event.target.value,
                  })
                }
              />
            </div>

            <div className="qb-category-form-actions">
              <button type="button" onClick={handleAddCategory} disabled={saving}>
                {saving ? "Saving..." : "Save Category"}
              </button>
            </div>
          </section>
        )}

        {filteredCategories.length === 0 ? (
          <div className="empty-state">
            <h3>No categories found</h3>
            <p>Try another search keyword or add a new category.</p>
          </div>
        ) : (
          <section className="qb-admin-categories-grid-modern">
            {filteredCategories.map((category) => (
              <article key={category._id} className="qb-admin-category-card-modern">
                {editingCategory === category._id ? (
                  <>
                    <div className="qb-category-card-edit">
                      <input
                        value={editDraft.name}
                        onChange={(event) =>
                          setEditDraft({ ...editDraft, name: event.target.value })
                        }
                        placeholder="Category name"
                      />
                      <textarea
                        value={editDraft.description}
                        onChange={(event) =>
                          setEditDraft({ ...editDraft, description: event.target.value })
                        }
                        placeholder="Category description"
                      />
                    </div>
                    <div className="qb-category-card-actions edit">
                      <button type="button" onClick={() => handleUpdateCategory(category._id)}>
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingCategory(null)}>
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="qb-category-card-top">
                      <h3>{category.name}</h3>
                      <span>{category.productCount ?? 0} products</span>
                    </div>
                    <p>{category.description || "No description provided."}</p>
                    <div className="qb-category-card-actions">
                      <button type="button" onClick={() => handleEditCategory(category)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default AdminCategories;
