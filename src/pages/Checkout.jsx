import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { fetchCart } from "../utils/cartService";
import { createOrder } from "../api/orders";
import { getMyProfile, updateProfile } from "../api/dashboard";
import { notifyCartUpdated } from "../utils/cartService";

import "../styles/checkout.css";
import { showError } from "../utils/toast";

const PAYMENT_OPTIONS = [
  {
    value: "Cash on Delivery",
    label: "Cash on Delivery",
    icon: "💵",
    note: "Pay in cash when your order arrives at your door."
  },
  {
    value: "Khalti",
    label: "Khalti",
    icon: "📲",
    note: "Pay instantly with your Khalti wallet."
  }
];

function Checkout() {

  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    shipping_address: "",
    phone: "",
    payment_method: "Cash on Delivery"
  });

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    Promise.all([fetchCart(token), getMyProfile(token)])
      .then(([cartData, profileData]) => {
        if (cartData.items.length === 0) {
          navigate("/cart");
          return;
        }
        setItems(cartData.items);
        setSubtotal(cartData.subtotal);
        setProfile(profileData);
        setFormData((prev) => ({
          ...prev,
          shipping_address: profileData.address || "",
          phone: profileData.phone || ""
        }));
      })
      .catch(() => navigate("/cart"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: null });
    }
  };

  const handlePaymentSelect = (value) => {
    setFormData({ ...formData, payment_method: value });
  };

  const validate = () => {
    const errors = {};

    if (!formData.shipping_address.trim()) {
      errors.shipping_address = "Shipping address is required";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{7,15}$/.test(formData.phone.trim())) {
      errors.phone = "Enter a valid phone number";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setPlacing(true);

      // Phone lives on the user's profile, not on the order — keep it
      // in sync so the seller always has an up-to-date contact number.
      if (profile && formData.phone !== profile.phone) {
        await updateProfile(
          {
            name: profile.name,
            phone: formData.phone,
            gender: profile.gender,
            dob: profile.dob ? profile.dob.slice(0, 10) : "",
            address: profile.address
          },
          token
        );
      }

      const result = await createOrder(
        {
          shipping_address: formData.shipping_address,
          payment_method: formData.payment_method
        },
        token
      );

      notifyCartUpdated();

      // Khalti orders come back with a payment_url — send the customer
      // there to actually pay. Khalti will redirect them back to
      // /userdashboard itself once they're done.
      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }

      navigate("/userdashboard", { state: { orderId: result.orderId, justPlaced: true } });
    } catch (err) {
      showError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="shop-status">Loading checkout...</p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="checkout-page">

        <div className="checkout-header-row">
          <Link to="/cart" className="checkout-back-link">&larr; Back to Cart</Link>
          <h1>Checkout</h1>
        </div>

        <div className="checkout-grid">

          <form className="checkout-form" onSubmit={handleSubmit} noValidate>

            <div className="checkout-section">
              <h2>Shipping Details</h2>

              <label>
                Shipping Address <span className="required-mark">*</span>
              </label>
              <textarea
                name="shipping_address"
                placeholder="Street, city, district..."
                value={formData.shipping_address}
                onChange={handleChange}
                rows={3}
                className={fieldErrors.shipping_address ? "input-error" : ""}
              />
              {fieldErrors.shipping_address && (
                <span className="field-error-text">{fieldErrors.shipping_address}</span>
              )}

              <label>
                Phone Number <span className="required-mark">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="98XXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                className={fieldErrors.phone ? "input-error" : ""}
              />
              {fieldErrors.phone && (
                <span className="field-error-text">{fieldErrors.phone}</span>
              )}
            </div>

            <div className="checkout-section">
              <h2>Payment Method</h2>

              <div className="payment-options">
                {PAYMENT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={
                      "payment-option" +
                      (formData.payment_method === option.value ? " selected" : "")
                    }
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={option.value}
                      checked={formData.payment_method === option.value}
                      onChange={() => handlePaymentSelect(option.value)}
                    />
                    <span className="payment-option-icon">{option.icon}</span>
                    <span className="payment-option-text">
                      <span className="payment-option-label">{option.label}</span>
                      <span className="payment-option-note">{option.note}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={placing}>
              {placing ? "Placing Order..." : `Place Order — Rs. ${subtotal.toFixed(2)}`}
            </button>

          </form>

          <div className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-summary-items">
              {items.map((item) => (
                <div className="checkout-summary-item" key={item.cart_item_id}>
                  <img
                    src={item.image_url ? `${item.image_url}` : "/images/hh.png"}
                    alt={item.name}
                  />
                  <div className="checkout-summary-item-info">
                    <span className="checkout-summary-item-name">{item.name}</span>
                    <span className="checkout-summary-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-summary-item-price">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-summary-total">
              <span>Total</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
          </div>

        </div>

      </section>

      <Footer />
    </>
  );
}

export default Checkout;