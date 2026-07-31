import "../styles/myOrders.css";

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import { getMyOrders, getMyOrderById } from "../api/orders";
import { showError } from "../utils/toast";

const STATUS_TABS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function MyOrders() {

  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Order detail is fetched lazily the first time a row is expanded, then
  // cached here by order_id so re-collapsing/expanding doesn't re-fetch.
  const [expandedId, setExpandedId] = useState(null);
  const [detailsById, setDetailsById] = useState({});
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  useEffect(() => {
    getMyOrders(token)
      .then(setOrders)
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (statusFilter !== "All") {
      result = result.filter((o) => o.status === statusFilter);
    }

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((o) => String(o.order_id).includes(term));
    }

    return result;
  }, [orders, statusFilter, searchTerm]);

  const statusClass = (status) => `status-pill status-${status.toLowerCase()}`;

  const toggleExpand = async (orderId) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(orderId);

    if (!detailsById[orderId]) {
      try {
        setLoadingDetailId(orderId);
        const data = await getMyOrderById(orderId, token);
        setDetailsById((prev) => ({ ...prev, [orderId]: data }));
      } catch (err) {
        showError(err.message);
        setExpandedId(null);
      } finally {
        setLoadingDetailId(null);
      }
    }
  };

  return (
    <div className="my-orders-container">

      <div className="my-orders-header">
        <div>
          <h1>My Orders</h1>
          <p className="my-orders-subtext">
            Every order you've placed, with the full item breakdown for each one.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading your orders...</p>
      ) : (
        <>
          <div className="my-orders-filter-row">
            <input
              type="text"
              placeholder="Search by order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="my-orders-status-tabs">
              {STATUS_TABS.map((status) => (
                <button
                  key={status}
                  className={"status-tab" + (statusFilter === status ? " active" : "")}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="my-orders-empty-card">
              <p>
                {orders.length === 0
                  ? "You haven't placed any orders yet."
                  : "No orders match your search/filter."}
              </p>
              {orders.length === 0 && (
                <Link to="/shop" className="browse-btn">Browse Keychains</Link>
              )}
            </div>
          ) : (
            <div className="my-orders-list">
              {filteredOrders.map((order) => {
                const isOpen = expandedId === order.order_id;
                const detail = detailsById[order.order_id];

                return (
                  <div className="my-order-card" key={order.order_id}>

                    <button
                      className="my-order-summary"
                      onClick={() => toggleExpand(order.order_id)}
                    >
                      <div className="my-order-summary-main">
                        <h3>Order #{order.order_id}</h3>
                        <p>
                          {order.item_count} item{order.item_count !== 1 ? "s" : ""} &middot;{" "}
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>

                      <span className={statusClass(order.status)}>{order.status}</span>

                      <p className="my-order-summary-total">
                        Rs. {Number(order.total_amount).toFixed(2)}
                      </p>

                      <span className={"my-order-caret" + (isOpen ? " open" : "")}>▾</span>
                    </button>

                    {isOpen && (
                      <div className="my-order-detail">
                        {loadingDetailId === order.order_id && !detail ? (
                          <p className="loading-text">Loading order details...</p>
                        ) : detail ? (
                          <>
                            <div className="my-order-detail-grid">

                              <div className="my-order-items">
                                {detail.items.map((item) => (
                                  <div className="my-order-item-row" key={item.order_item_id}>
                                    <img
                                      src={item.image_url ? `${item.image_url}` : "/images/hh.png"}
                                      alt={item.product_name}
                                    />
                                    <div className="my-order-item-info">
                                      <span className="my-order-item-name">{item.product_name}</span>
                                      <span className="my-order-item-price">
                                        Rs. {Number(item.price).toFixed(2)} &times; {item.quantity}
                                      </span>
                                    </div>
                                    <span className="my-order-item-total">
                                      Rs. {(Number(item.price) * item.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                              </div>

                              <div className="my-order-meta">
                                <div className="my-order-meta-section">
                                  <span className="section-label">Shipping Address</span>
                                  <p>{detail.order.shipping_address}</p>
                                </div>

                                <div className="my-order-meta-section">
                                  <span className="section-label">Payment</span>
                                  <p>{detail.order.payment_method || "—"}</p>
                                  <p className="my-order-payment-status">
                                    {detail.order.payment_status || "—"}
                                  </p>

                                  {detail.payment_callbacks && detail.payment_callbacks.length > 0 && (
                                    <div className="khalti-callback-log">
                                      <span className="section-label">Khalti Response</span>
                                      {detail.payment_callbacks.map((cb) => (
                                        <div className="khalti-callback-row" key={cb.callback_id}>
                                          <span className={`khalti-status khalti-status-${(cb.status || "unknown").toLowerCase().replace(/\s+/g, "-")}`}>
                                            {cb.status || "Unknown"}
                                          </span>
                                          <span className="khalti-callback-meta">
                                            {cb.transaction_id && <>Txn: {cb.transaction_id} &middot; </>}
                                            {new Date(cb.received_at).toLocaleString()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="my-order-meta-section my-order-total-line">
                                  <span className="section-label">Total</span>
                                  <p>Rs. {Number(detail.order.total_amount).toFixed(2)}</p>
                                </div>
                              </div>

                            </div>
                          </>
                        ) : null}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

    </div>
  );
}

export default MyOrders;