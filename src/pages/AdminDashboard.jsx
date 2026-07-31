import "../styles/adminDashboard.css";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { getDashboardStats } from "../api/dashboard";
import { showError } from "../utils/toast";

function AdminDashboard() {

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getDashboardStats(token)
      .then(setStats)
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false));

  }, []);

  return (
    <div className="admin-dashboard-container">

      <h1>Welcome back, {storedUser?.name || "Admin"}</h1>
      <p className="admin-subtext">Here's what's happening with your shop today.</p>

      {loading ? (
        <p className="loading-text">Loading dashboard...</p>
      ) : (
        <>
          <div className="dashboard-stats-grid">

            <div className="dashboard-stat-card">
              <span className="stat-label">Total Products</span>
              <span className="stat-value">{stats.totalProducts}</span>
            </div>

           

            <div className="dashboard-stat-card">
              <span className="stat-label">Out of Stock</span>
              <span className="stat-value danger">{stats.outOfStock}</span>
            </div>

           

            <div className="dashboard-stat-card">
              <span className="stat-label">Total Customers</span>
              <span className="stat-value">{stats.totalCustomers}</span>
            </div>

            <div className="dashboard-stat-card">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{stats.totalOrders}</span>
            </div>

            <div className="dashboard-stat-card">
              <span className="stat-label">Pending Orders</span>
              <span className="stat-value warning">{stats.pendingOrders}</span>
            </div>

            <div className="dashboard-stat-card">
              <span className="stat-label">Revenue This Month</span>
              <span className="stat-value success">Rs. {Number(stats.monthRevenue).toFixed(2)}</span>
            </div>

          </div>

          <div className="dashboard-quick-links">
            <Link to="/admin/add-product" className="quick-link-btn primary">
              + Add New Product
            </Link>
            <Link to="/admin/products" className="quick-link-btn">
              View All Products
            </Link>
            <Link to="/admin/orders" className="quick-link-btn">
              View Orders
            </Link>
          </div>

          <div className="recent-products-section">

            <h2>Recently Added Products</h2>

            {stats.recentProducts.length === 0 ? (
              <p className="empty-text">No products added yet.</p>
            ) : (
              <table className="recent-products-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentProducts.map((p) => (
                    <tr key={p.product_id}>
                      <td>{p.name}</td>
                      <td>Rs. {Number(p.price).toFixed(2)}</td>
                      <td>{p.stock} units</td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default AdminDashboard;