import "../styles/adminOrderDetail.css";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

import { getOrderById, updateOrderStatus } from "../api/orders";
import { showSuccess, showError } from "../utils/toast";



function AdminOrderDetail() {

  const { id } = useParams();

  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [paymentCallbacks, setPaymentCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);

  const loadOrder = () => {

    setLoading(true);

    getOrderById(id, token)
      .then((data) => {
        setOrder(data.order);
        setItems(data.items);
        setPaymentCallbacks(data.payment_callbacks || []);
      })
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false));

  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const handleStatusChange = async (newStatus) => {

    try {
      setSavingStatus(true);
      await updateOrderStatus(id, { status: newStatus }, token);
      showSuccess(`Order marked as ${newStatus}`);
      loadOrder();
    } catch (err) {
      showError(err.message);
    } finally {
      setSavingStatus(false);
    }

  };

  if (loading) {
    return <p className="loading-text">Loading order...</p>;
  }

  if (!order) {
    return <p className="loading-text">Order not found.</p>;
  }

  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  return (
    <div className="order-detail-container">

      <div className="order-detail-header">
        <div>
          <Link to="/admin/orders" className="back-link">&larr; Back to Orders</Link>
          <h1>
            Order #YN-{order.order_id}{" "}
            <span className={`status-pill status-${order.status.toLowerCase()}`}>
              {order.status}
            </span>
          </h1>
          <p className="placed-date">
            Placed on {new Date(order.order_date).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="order-detail-grid">

        {/* LEFT COLUMN */}
        <div className="order-left">

          {order.status !== "Delivered" && order.status !== "Cancelled" && (
            <div className="fulfillment-card">
              <h3>📦 Update Order Status</h3>
              <p className="fulfillment-subtext">Move this order to the next stage.</p>

              <div className="other-status-actions">
                <button onClick={() => handleStatusChange("Processing")} disabled={savingStatus}>
                  Mark Processing
                </button>
                <button onClick={() => handleStatusChange("Shipped")} disabled={savingStatus}>
                  Mark Shipped
                </button>
                <button onClick={() => handleStatusChange("Delivered")} disabled={savingStatus}>
                  Mark Delivered
                </button>
                <button
                  className="cancel-action"
                  onClick={() => handleStatusChange("Cancelled")}
                  disabled={savingStatus}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}

          <div className="order-items-card">
            <h3>📦 Order Items</h3>

            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.order_item_id}>
                    <td className="item-cell">
                      <img
                        src={
                          item.image_url
                            ? `${item.image_url}`
                            : "/images/hh.png"
                        }
                        alt={item.product_name}
                      />
                      <div>
                        <div className="item-name">{item.product_name}</div>
                        <div className="item-sku">SKU: {item.sku || "—"}</div>
                        {item.product_description && (
                          <div className="item-description">{item.product_description}</div>
                        )}
                        <div className="item-price">Rs. {Number(item.price).toFixed(2)}</div>
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td className="item-total">
                      Rs. {(Number(item.price) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="order-totals">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="totals-row total-row">
                <span>Total</span>
                <span>Rs. {Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* MIDDLE COLUMN: CUSTOMER */}
        <div className="order-middle">

          <div className="customer-card">

            <div className="customer-avatar">
              {order.customer_name.charAt(0).toUpperCase()}
            </div>
            <h3>{order.customer_name}</h3>
            <p className="customer-since">
              Customer since{" "}
              {new Date(order.customer_since).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric"
              })}
            </p>

            <div className="customer-section">
              <span className="section-label">Contact Info</span>
              <p>✉️ {order.customer_email}</p>
              <p>📞 {order.customer_phone || "Not provided"}</p>
            </div>

            <div className="customer-section">
              <span className="section-label">Shipping Address</span>
              <p>{order.shipping_address}</p>
            </div>

          </div>

          {(order.payment_method || order.payment_status) && (
            <div className="customer-card payment-gateway-card">
              <h3>💳 Payment</h3>

              <div className="customer-section">
                <span className="section-label">Method</span>
                <p>{order.payment_method || "—"}</p>
              </div>

              <div className="customer-section">
                <span className="section-label">Status</span>
                <p>{order.payment_status || "—"}</p>
              </div>

              {order.transaction_id && (
                <div className="customer-section">
                  <span className="section-label">Transaction ID</span>
                  <p>{order.transaction_id}</p>
                </div>
              )}

              {paymentCallbacks.length > 0 && (
                <div className="customer-section khalti-callback-log">
                  <span className="section-label">Khalti Callback Log ({paymentCallbacks.length})</span>

                  {paymentCallbacks.map((cb) => (
                    <div className="admin-khalti-callback" key={cb.callback_id}>
                      <div className="khalti-callback-row">
                        <span className={`khalti-status khalti-status-${(cb.status || "unknown").toLowerCase().replace(/\s+/g, "-")}`}>
                          {cb.status || "Unknown"}
                        </span>
                        <span className="khalti-callback-meta">
                          {new Date(cb.received_at).toLocaleString()}
                        </span>
                      </div>
                      <dl className="khalti-callback-fields">
                        {cb.pidx && (<><dt>pidx</dt><dd>{cb.pidx}</dd></>)}
                        {cb.tidx && (<><dt>tidx</dt><dd>{cb.tidx}</dd></>)}
                        {cb.transaction_id && (<><dt>transaction_id</dt><dd>{cb.transaction_id}</dd></>)}
                        {cb.amount != null && (<><dt>amount</dt><dd>{cb.amount}</dd></>)}
                        {cb.total_amount != null && (<><dt>total_amount</dt><dd>{cb.total_amount}</dd></>)}
                        {cb.mobile && (<><dt>mobile</dt><dd>{cb.mobile}</dd></>)}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default AdminOrderDetail;