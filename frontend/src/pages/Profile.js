import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProfileRedesign.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vercel-backend-zeta-green.vercel.app"
    : "http://localhost:5000");

function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const profileRes = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(profileRes.data);
        setFormData({
          name: profileRes.data.name || "",
          email: profileRes.data.email || "",
          phone: profileRes.data.phone || "",
        });

        const ordersRes = await axios.get(`${API_BASE_URL}/api/orders/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(ordersRes.data);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        navigate("/login");
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await axios.put(`${API_BASE_URL}/api/auth/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Update failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return <div className="qb-profile-page"><div className="loading">Loading Profile...</div></div>;

  return (
    <div className="qb-profile-page fade-in">
      <div className="container">
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Account Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Manage your personal information, security, and preferences.</p>
        </header>

        <div className="qb-profile-grid">
          {/* Sidebar */}
          <aside className="qb-profile-side">
            <div className="qb-profile-user-card">
              <div className="qb-avatar-wrapper">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff&size=128`} 
                  alt="User Avatar" 
                />
                <div className="qb-avatar-edit">✎</div>
              </div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <div className="qb-membership-badge">Premium Member</div>
            </div>

            <nav className="qb-profile-nav">
              <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                👤 Profile Details
              </button>
              <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
                📦 Order History
              </button>
              <button className={activeTab === 'addresses' ? 'active' : ''} onClick={() => setActiveTab('addresses')}>
                📍 Saved Addresses
              </button>
              <button className={activeTab === 'payment' ? 'active' : ''} onClick={() => setActiveTab('payment')}>
                💳 Payment Methods
              </button>
            </nav>

            <button 
              onClick={handleLogout}
              style={{ color: '#ef4444', fontWeight: 700, padding: '1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
            >
              ↪ Logout Securely
            </button>
          </aside>

          {/* Main Panels */}
          <main className="qb-profile-main">
            <section className="qb-profile-panel">
              <h2>Personal Information <button style={{ fontSize: '0.9rem', color: 'var(--qb-purple)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsEditing(!isEditing)}>{isEditing ? 'Cancel' : 'Edit'}</button></h2>
              <form onSubmit={handleUpdate}>
                <div className="qb-form-grid">
                  <div className="qb-input-group">
                    <label>First Name</label>
                    <input 
                      value={formData.name.split(' ')[0]} 
                      onChange={(e) => setFormData({...formData, name: e.target.value + ' ' + (formData.name.split(' ')[1] || '')})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="qb-input-group">
                    <label>Last Name</label>
                    <input 
                      value={formData.name.split(' ')[1] || ''} 
                      onChange={(e) => setFormData({...formData, name: (formData.name.split(' ')[0] || '') + ' ' + e.target.value})}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="qb-input-group">
                    <label>Email Address</label>
                    <input 
                      value={formData.email} 
                      disabled={true}
                    />
                  </div>
                  <div className="qb-input-group">
                    <label>Phone Number</label>
                    <input 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 00000 00000"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                {isEditing && (
                  <button type="submit" className="qb-btn-save">
                    💾 Save Changes
                  </button>
                )}
              </form>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
              <section className="qb-profile-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} style={{ color: 'var(--qb-purple)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>View All ›</button>
                </div>
                {orders.length > 0 ? orders.slice(0, 2).map(order => (
                  <div key={order._id} className="qb-mini-order">
                    <div className="qb-order-icon">🛍</div>
                    <div className="info">
                      <strong>Order #QB-{order._id.slice(-4).toUpperCase()}</strong>
                      <span>{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length} Items</span>
                    </div>
                    <span className="qb-order-status-pill delivered">Delivered</span>
                  </div>
                )) : <p>No orders yet.</p>}
              </section>

              <section className="qb-profile-panel">
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 800 }}>Security</h3>
                <div className="qb-input-group" style={{ marginBottom: '1rem' }}>
                  <label>Current Password</label>
                  <input type="password" value="********" disabled />
                </div>
                <div className="qb-input-group" style={{ marginBottom: '1.5rem' }}>
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" disabled />
                </div>
                <button style={{ width: '100%', padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>
                  ↻ Update Password
                </button>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Profile;
