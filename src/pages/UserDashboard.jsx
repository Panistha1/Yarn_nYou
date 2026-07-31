import "../styles/userDashboard.css";

import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { getMyProfile } from "../api/dashboard";
import { getAllProducts } from "../api/products";
import { getMyOrders } from "../api/orders";
import { addToCart } from "../api/cart";
import { fetchCart } from "../utils/cartService";
import { notifyCartUpdated } from "../utils/cartService";
import { showSuccess, showError, showInfo } from "../utils/toast";



function UserDashboard() {

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khalti redirects the customer back here (not a React Router
    // navigation) with ?payment=success|failed|error&orderId=... once
    // they've paid or backed out of the gateway.
    const params = new URLSearchParams(location.search);
    const paymentResult = params.get("payment");

    if (paymentResult === "success") {
      showSuccess("Payment successful! Your order is now being processed.");
    } else if (paymentResult === "failed") {
      showError("Payment was not completed, so the order was cancelled. Feel free to try again.");
    } else if (paymentResult === "error") {
      showError("We couldn't confirm your payment status. Please check your orders below or contact us.");
    }

    if (paymentResult) {
      // Strip the query string so a page refresh doesn't re-trigger the toast.
      navigate("/userdashboard", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    Promise.all([getMyProfile(token), getAllProducts(), getMyOrders(token), fetchCart(token)])
      .then(([profileData, products, orderData, cartData]) => {

        setProfile(profileData);
        setOrders(orderData);
        setCartItemCount(cartData.items.reduce((sum, item) => sum + item.quantity, 0));

        // Prefer products marked "featured"; if none exist yet,
        // fall back to the most recently added ones so this section
        // isn't empty on a brand-new store.
        const featured = products.filter((p) => Boolean(p.featured));
        const fallback = products.slice(0, 4);

        setRecommended((featured.length > 0 ? featured : fallback).slice(0, 4));

      })
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false));

  }, []);

  const handleNotBuiltYet = (featureName) => {
    showInfo(`${featureName} is coming soon!`);
  };

  const handleQuickAdd = async (productId) => {
    try {
      await addToCart(productId, 1, token);
      notifyCartUpdated();
      showSuccess("Added to cart");
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <div className="user-dashboard-page">

      {loading ? (
        <p className="loading-text">Loading your account...</p>
      ) : (
        <>
          {/* HERO / WELCOME BANNER */}
          <div className="dashboard-hero">

            <div className="hero-text">
              <h1>Hello, {profile.name.split(" ")[0]}! 🧶</h1>
              <p>Welcome back to your cozy corner. Your handmade treasures are waiting for you!</p>

              <div className="hero-badges">
                <span className="hero-badge">
                  Member since{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric"
                  })}
                </span>
              </div>

              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  navigate("/login", { state: { from: location.pathname } });
                }}
              >
                Log Out
              </button>
            </div>

            <div className="hero-avatar">
              {profile.name.charAt(0).toUpperCase()}
            </div>

          </div>

          {/* STATS */}
          <div className="dashboard-stats-row">

            <div className="user-stat-card">
              <span className="user-stat-icon">📦</span>
              <div>
                <span className="user-stat-value">{orders.length}</span>
                <span className="user-stat-label">Total Orders</span>
              </div>
            </div>

            <div className="user-stat-card">
              <span className="user-stat-icon">🛍️</span>
              <div>
                <span className="user-stat-value">{cartItemCount}</span>
                <span className="user-stat-label">Items in Cart</span>
              </div>
            </div>

            <div className="user-stat-card">
              <span className="user-stat-icon">💰</span>
              <div>
                <span className="user-stat-value">
                  Rs. {orders.reduce((sum, o) => sum + Number(o.total_amount), 0).toFixed(2)}
                </span>
                <span className="user-stat-label">Total Spent</span>
              </div>
            </div>

          </div>

          <div className="dashboard-main-grid">

            {/* LEFT: RECENT ORDERS */}
            <div className="dashboard-left" id="orders">

              <div className="section-header">
                <h2>Recent Orders</h2>
              </div>

              {orders.length === 0 ? (
                <div className="orders-empty-card">
                  <p>You haven't placed any orders yet.</p>
                  <p className="orders-empty-note">
                    Once you check out, your orders will show up right here.
                  </p>
                  <Link to="/shop" className="browse-btn">
                    Browse Keychains
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.slice(0, 5).map((order) => (
                    <div className="order-row" key={order.order_id}>
                      <div>
                        <h3>Order #{order.order_id}</h3>
                        <p>
                          {order.item_count} item{order.item_count !== 1 ? "s" : ""} &middot;{" "}
                          {new Date(order.order_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`order-status order-status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                      <p className="order-row-total">Rs. {Number(order.total_amount).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* RIGHT: QUICK ACTIONS
            <div className="dashboard-right">

              <h2>Quick Actions</h2>

              
                href="#orders"
                className="quick-action-card"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("orders")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span className="qa-icon">📦</span>
                <div>
                  <h3>My Orders</h3>
                  <p>Track packages, return items, or buy things again.</p>
                </div>
              </a>

              <Link to="/account" className="quick-action-card">
                <span className="qa-icon">📍</span>
                <div>
                  <h3>Addresses</h3>
                  <p>Edit your saved shipping address.</p>
                </div>
              </Link>

              <Link to="/account" className="quick-action-card">
                <span className="qa-icon">👤</span>
                <div>
                  <h3>Profile Info</h3>
                  <p>Edit your personal details and account settings.</p>
                </div>
              </Link>

              <Link to="/contact" className="quick-action-card">
                <span className="qa-icon">❓</span>
                <div>
                  <h3>Need Help?</h3>
                  <p>Contact our friendly support team.</p>
                </div>
              </Link>

            </div> */}

          </div>

          {/* RECOMMENDED PRODUCTS */}
          <div className="recommended-section">

            <span className="recommended-tag">Handpicked for You</span>
            <h2>Recommended Keychains</h2>
            <p className="recommended-subtext">
              A few of our favorites, picked just for you.
            </p>

            {recommended.length === 0 ? (
              <p className="orders-empty-note">No products available yet — check back soon!</p>
            ) : (
              <div className="recommended-grid">
                {recommended.map((product) => (
                  <div className="recommended-card" key={product.product_id}>

                    <div className="recommended-image-wrap">
                      <img
                        src={
                          product.primary_image
                            ? `${product.primary_image}`
                            : "/images/hh.png"
                        }
                        alt={product.name}
                      />
                    </div>

                    <h3>{product.name}</h3>
                    <p className="recommended-price">Rs. {Number(product.price).toFixed(2)}</p>

                    <button
                      className="quick-add-btn"
                      onClick={() => handleQuickAdd(product.product_id)}
                    >
                      Quick Add
                    </button>

                  </div>
                ))}
              </div>
            )}

          </div>

          {/* SUPPORT CTA */}
          <div className="support-cta">
            <h2>Still have questions?</h2>
            <p>Our cozy support team is here to help with your orders.</p>

            <div className="support-cta-buttons">
              <Link to="/contact" className="support-btn outline">
                Chat Now
              </Link>
              <button
                className="support-btn filled"
                onClick={() => handleNotBuiltYet("FAQ page")}
              >
                Visit FAQ
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default UserDashboard;