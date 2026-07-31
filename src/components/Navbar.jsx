import "../styles/navbar.css";

import { useEffect, useState } from "react";

import {
  FaShoppingBag,
  FaUser,
  FaSearch
} from "react-icons/fa";

import { Link, useNavigate, useLocation } from "react-router-dom";

import { fetchCart } from "../utils/cartService";

function Navbar({ showLinks = true }) {

  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [authState, setAuthState] = useState(() => ({
    token: localStorage.getItem("token"),
    user: JSON.parse(localStorage.getItem("user") || "null")
  }));

  const { token, user: storedUser } = authState;

  // Logged in only counts if BOTH pieces are present and match — never
  // trust token alone, since a partially-cleared localStorage would
  // otherwise let the icon and its link destination disagree.
  const isLoggedIn = Boolean(token && storedUser);

  useEffect(() => {

    const loadCartCount = () => {
      const currentToken = localStorage.getItem("token");

      fetchCart(currentToken)
        .then((data) => {
          const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(totalItems);
        })
        .catch((err) => {
          setCartCount(0);

          // Token is dead (expired, tampered with, or from before a
          // JWT_SECRET change). Clear the stale session so the navbar
          // stops pretending we're logged in.
          if (
            currentToken &&
            (err.message === "No token provided" ||
              err.message === "Invalid or expired token")
          ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setAuthState({ token: null, user: null });
          }
        });
    };

    loadCartCount();

    window.addEventListener("cart-updated", loadCartCount);
    return () => window.removeEventListener("cart-updated", loadCartCount);

  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("search") || "");
  }, [location.search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    navigate(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : "/shop");
  };

  return (
    <nav className="navbar">

      <Link to="/" className="nav-btn logo-link">
        <span className="logo">yarn_nyou</span>
      </Link>

      {showLinks && (
        <ul className="nav-links">

          <li>
            <Link to="/" className="nav-btn">
              Home
            </Link>
          </li>

          <li>
            <Link to="/shop" className="nav-btn">
              Shop
            </Link>
          </li>

          <li>
            <Link to="/contact" className="nav-btn">
              Contact
            </Link>
          </li>

        </ul>
      )}

      <div className={showLinks ? "nav-right" : "nav-right nav-right--expand"}>
        <form onSubmit={handleSearchSubmit} className="nav-search-form" role="search">
          <input
            type="search"
            placeholder="Search crochet..."
            aria-label="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="nav-search-btn" aria-label="Submit search">
            <FaSearch />
          </button>
        </form>

        <Link to="/cart" className="nav-btn cart-link" aria-label="Cart">
          <FaShoppingBag className="icon" />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        <Link
          to={isLoggedIn ? (storedUser.role === "Admin" ? "/admin/dashboard" : "/userdashboard") : "/login"}
          className="nav-btn nav-account"
        >
          {isLoggedIn && storedUser.name ? (
            <>
              <span className="nav-avatar">
                {storedUser.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="nav-account-name">{storedUser.name.split(" ")[0]}</span>
            </>
          ) : (
            <>
              <FaUser className="icon" />
              <span className="nav-account-name">Sign In</span>
            </>
          )}
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;