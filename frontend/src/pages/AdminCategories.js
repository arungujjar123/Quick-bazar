import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminShared.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory) return;
    const token = localStorage.getItem("adminToken");
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/categories`,
        { name: newCategory },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories([...categories, response.data]);
      setNewCategory("");
    } catch (error) {
      alert("Failed to add category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categories.filter((c) => c._id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  if (loading) return <div className="qb-admin-shell"><div className="loading" style={{ margin: 'auto' }}>Loading Taxonomy...</div></div>;

  return (
    <div className="qb-admin-shell fade-in">
      <aside className="qb-admin-sidebar">
        <div className="qb-admin-brand-block">
          <div className="logo-icon">QB</div>
          <div><h2>QuickBazaar</h2><p>Admin Portal</p></div>
        </div>
        <nav className="qb-admin-menu">
          <button onClick={() => navigate("/admin/dashboard")}>📊 Dashboard</button>
          <button onClick={() => navigate("/admin/products")}>📦 Inventory</button>
          <button onClick={() => navigate("/admin/orders")}>🧾 Orders</button>
          <button onClick={() => navigate("/admin/support")}>🤖 AI Agent</button>
          <button className="active" onClick={() => navigate("/admin/categories")}>📁 Categories</button>
          <button onClick={() => navigate("/admin/settings")}>⚙️ Settings</button>
        </nav>
        <div className="qb-admin-sidebar-bottom">
          <button onClick={() => navigate("/")}>🏠 View Store</button>
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      <main className="qb-admin-main">
        <header className="qb-admin-topbar">
          <div>
            <h1>Categories</h1>
            <p>Organize your products into logical collections.</p>
          </div>
        </header>

        <section className="qb-admin-card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
          <h3>Add New Category</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <input 
              style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--admin-border)' }}
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)} 
              placeholder="e.g. Organic Vegetables"
            />
            <button className="qb-admin-btn-add" type="submit">+ Add</button>
          </form>
        </section>

        <section className="qb-admin-card">
          <table className="qb-admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td style={{ fontWeight: 700 }}>{cat.name}</td>
                  <td>{cat.productCount || 0} items</td>
                  <td>
                    <button onClick={() => handleDelete(cat._id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

export default AdminCategories;
