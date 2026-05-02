import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    lat: "",
    lng: "",
    deliveryRadiusKm: 5,
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    fetchShops();
  }, []);

  const checkAdminAuth = () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  };

  const fetchShops = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/shops/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShops(response.data || []);
    } catch (err) {
      console.error("Error fetching shops:", err);
      setError("Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.address || form.lat === "" || form.lng === "") {
      setError("Name, address, latitude and longitude are required");
      return;
    }

    const latNum = Number(form.lat);
    const lngNum = Number(form.lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      setError("Latitude and longitude must be valid numbers");
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        lat: latNum,
        lng: lngNum,
        deliveryRadiusKm: Number(form.deliveryRadiusKm) || 5,
      };

      const response = await axios.post(`${API_BASE_URL}/api/shops`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShops((prev) => [response.data, ...prev]);
      setForm({
        name: "",
        address: "",
        city: "",
        lat: "",
        lng: "",
        deliveryRadiusKm: 5,
      });
    } catch (err) {
      console.error("Error creating shop:", err);
      setError(err.response?.data?.message || "Failed to create shop");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (shopId) => {
    if (!window.confirm("Delete this shop? This cannot be undone.")) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/shops/${shopId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShops((prev) => prev.filter((shop) => shop._id !== shopId));
    } catch (err) {
      console.error("Error deleting shop:", err);
      setError(err.response?.data?.message || "Failed to delete shop");
    }
  };

  return (
    <div className="admin-dashboard">
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
          <h1 style={{ color: "#333", fontSize: "2rem" }}>Manage Shops</h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="btn btn-primary"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/admin/add-product")}
              className="btn btn-success"
            >
              Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: "2rem" }}>
        <div className="cart-container" style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Create a Shop</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div>
                <label>Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Shop name"
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem" }}
                />
              </div>
              <div>
                <label>City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City / Area"
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem" }}
                />
              </div>
              <div>
                <label>Address *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Street, landmark"
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem" }}
                />
              </div>
              <div>
                <label>Latitude *</label>
                <input
                  name="lat"
                  value={form.lat}
                  onChange={handleChange}
                  placeholder="28.6139"
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem" }}
                />
              </div>
              <div>
                <label>Longitude *</label>
                <input
                  name="lng"
                  value={form.lng}
                  onChange={handleChange}
                  placeholder="77.2090"
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem" }}
                />
              </div>
              <div>
                <label>Delivery Radius (km)</label>
                <input
                  name="deliveryRadiusKm"
                  type="number"
                  min="1"
                  value={form.deliveryRadiusKm}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: "100%", padding: "0.6rem" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
              disabled={saving}
            >
              {saving ? "Saving..." : "Create Shop"}
            </button>
          </form>
        </div>

        {loading ? (
          <div className="loading">Loading shops...</div>
        ) : shops.length === 0 ? (
          <div className="empty-state">
            <h3>No shops created yet</h3>
            <p>Create your first shop to start adding products.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Radius</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shops.map((shop) => (
                  <tr key={shop._id}>
                    <td>{shop.name}</td>
                    <td>{shop.city || "-"}</td>
                    <td>{shop.address}</td>
                    <td>{shop.deliveryRadiusKm} km</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(shop._id)}
                        style={{ padding: "0.35rem 0.75rem" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminShops;
