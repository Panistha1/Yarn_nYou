import "../styles/adminOrdersList.css";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import { getAllOrders } from "../api/orders";
import { showError } from "../utils/toast";

const ORDERS_PER_PAGE = 10;

function AdminOrdersList() {

  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {

    getAllOrders(token)
      .then((data) => {
        setOrders(data.orders);
        setStats(data.stats);
      })
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false));

  }, []);

  const filteredOrders = useMemo(() => {

    let result = orders;

    if (statusFilter !== "All") {
      result = result.filter((o) => o.status === statusFilter);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (o) =>
          String(o.order_id).includes(term) ||
          o.customer_name.toLowerCase().includes(term) ||
          o.customer_email.toLowerCase().includes(term)
      );
    }

    return result;

  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));

  const pagedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const statusClass = (status) => {
    if (status === "Delivered") return "status-fulfilled";
    if (status === "Cancelled") return "status-cancelled";
    if (status === "Pending") return "status-pending";
    return "status-processing";
  };

  return (
    <div className="admin-orders-container">

      <div className="admin-orders-header">
        <div>
          <h1>Order Management</h1>
          <p className="admin-subtext">Monitor and fulfill your cozy crochet orders.</p>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading orders...</p>
      ) : (
        <>
          <div className="orders-stats-row">

            <div className="stat-card">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{stats.totalOrders}</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Pending Orders</span>
              <span className="stat-value warning">{stats.pendingOrders}</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Completed</span>
              <span className="stat-value success">{stats.completedOrders}</span>
            </div>

            <div className="stat-card">
              <span className="stat-label">Revenue (This Month)</span>
              <span className="stat-value">Rs. {Number(stats.monthRevenue).toFixed(2)}</span>
            </div>

          </div>

          <div className="orders-filter-row">

            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <div className="status-filter-tabs">
              {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
                <button
                  key={s}
                  className={statusFilter === s ? "active" : ""}
                  onClick={() => {
                    setStatusFilter(s);
                    setCurrentPage(1);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

          </div>

          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">
                    {orders.length === 0
                      ? "No orders yet — once customers start checking out, they'll show up here."
                      : "No orders match your search."}
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => (
                  <tr key={order.order_id}>
                    <td className="order-id-cell">#YN-{order.order_id}</td>
                    <td>
                      <div>{order.customer_name}</div>
                      <div className="customer-email">{order.customer_email}</div>
                    </td>
                    <td>{new Date(order.order_date).toLocaleDateString()}</td>
                    <td>
                      <span className="item-count-pill">{order.item_count} items</span>
                    </td>
                    <td>Rs. {Number(order.total_amount).toFixed(2)}</td>
                    <td>
                      <div className="payment-method-cell">{order.payment_method || "—"}</div>
                      <div className={`payment-status-tag payment-status-${(order.payment_status || "pending").toLowerCase()}`}>
                        {order.payment_status || "Pending"}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${statusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order.order_id}`} className="view-order-link">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {filteredOrders.length > 0 && (
            <div className="pagination-row">
              <span>
                Showing {pagedOrders.length} of {filteredOrders.length} orders
              </span>

              <div className="pagination-controls">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </button>
                <span className="page-indicator">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default AdminOrdersList;