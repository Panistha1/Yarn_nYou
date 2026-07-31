import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { fetchCart, updateItemQuantity, removeItemFromCart } from "../utils/cartService";
import { notifyCartUpdated } from "../utils/cartService";

import "../styles/cart.css";
import { showError } from "../utils/toast";



function Cart() {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = () => {
    fetchCart(token)
      .then((data) => {
        setItems(data.items);
        setSubtotal(data.subtotal);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guest cart items don't have a cart_item_id (there's no database row
  // yet) — product_id works as the identifier for both cases.
  const itemKey = (item) => item.cart_item_id ?? item.product_id;

  const handleQuantityChange = async (item, quantity) => {
    if (quantity < 1) return;

    if (typeof item.stock === "number" && quantity > item.stock) {
      showError(`Only ${item.stock} in stock`);
      return;
    }

    try {
      await updateItemQuantity(itemKey(item), quantity, token);
      notifyCartUpdated();
      loadCart();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleRemove = async (item) => {
    try {
      await removeItemFromCart(itemKey(item), token);
      notifyCartUpdated();
      loadCart();
    } catch (err) {
      showError(err.message);
    }
  };

  const handleCheckout = () => {
    if (!token) {
      // Guest cart persists in localStorage and gets merged into the
      // account cart automatically right after login.
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <>
      <Navbar />

      <section className="cart-page">
        <Link to="/shop" className="cart-back-link">&larr; Continue Shopping</Link>

        <h1>Your Cart</h1>

        {loading && <p className="shop-status">Loading your cart...</p>}

        {!loading && error && <p className="shop-status shop-error">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="cart-shop-link">Browse the shop</Link>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={itemKey(item)}>
                  <img
                    src={item.image_url ? `${item.image_url}` : "/images/hh.png"}
                    alt={item.name}
                  />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>Rs. {item.price}</p>

                    {item.quantity > item.stock && (
                      <p className="cart-item-warning">Only {item.stock} left in stock</p>
                    )}
                  </div>

                  <div className="cart-item-qty">
                    <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>+</button>
                  </div>

                  <p className="cart-item-total">Rs. {(item.price * item.quantity).toFixed(2)}</p>

                  <button className="cart-item-remove" onClick={() => handleRemove(item)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Subtotal: Rs. {subtotal.toFixed(2)}</h2>
              <button className="checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </section>

      <Footer />
    </>
  );
}

export default Cart;