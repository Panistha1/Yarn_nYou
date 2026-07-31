import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UserSidebar from "../components/UserSidebar";
import ProductCard from "../components/ProductCard";

import { getAllProducts, getCategories } from "../api/products";
import { addItemToCart } from "../utils/cartService";
import { notifyCartUpdated } from "../utils/cartService";
import { showSuccess, showError } from "../utils/toast";

import "../styles/home.css";
import "../styles/shop.css";
import "../styles/sidebar.css";




function Shop() {

  const [searchParams] = useSearchParams();

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isCustomer = isLoggedIn && storedUser?.role !== "Admin";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    Promise.all([getAllProducts(), getCategories()])
      .then(([productList, categoryList]) => {
        setProducts(productList);
        setCategories(categoryList);
      })
      .catch((err) => {
        console.error("Shop load error:", err);
        if (err.message.includes("DOCTYPE") || err.message.includes("not valid JSON")) {
          setError("Could not reach the backend. Make sure your backend is running on port 5000 and vite.config.js has the proxy set up.");
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));

  }, []);

  // Was only read once via useState's initial value, so searching from
  // the Navbar while already sitting on /shop updated the URL but never
  // touched this filter — the results just silently stayed the same.
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const handleAddToCart = async (product) => {
    try {
      await addItemToCart(
        {
          product_id: product.product_id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image_url: product.primary_image
        },
        1,
        token
      );
      notifyCartUpdated();
      showSuccess("Added to cart");
    } catch (err) {
      showError(err.message);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "all" || String(product.category_id) === String(activeCategory);

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const shopContent = (
    <>
      <section className="shop-header">
        <h1>Shop Keychains</h1>
        <p>Browse every handmade piece, made one stitch at a time.</p>

        <input
          type="text"
          className="shop-search"
          placeholder="Search crochet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="shop-filters">
          <button
            className={activeCategory === "all" ? "active" : ""}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat.category_id}
              className={String(activeCategory) === String(cat.category_id) ? "active" : ""}
              onClick={() => setActiveCategory(cat.category_id)}
            >
              {cat.category_name}
            </button>
          ))}
        </div>
      </section>

      <section className="products-section shop-grid-section">

        {loading && <p className="shop-status">Loading products...</p>}
        {error && <p className="shop-status shop-error">{error}</p>}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="shop-status">No products found.</p>
        )}

        <div className="shop-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              productId={product.product_id}
              image={
                product.primary_image
                  ? `${product.primary_image}`
                  : "/images/hh.png"
              }
              title={product.name}
              price={`Rs. ${product.price}`}
              stock={product.stock}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>

      </section>
    </>
  );

  // Logged-in customers get the same account shell (sidebar + no duplicate
  // Shop/About/Contact nav links) as the rest of their account area.
  // Guests AND admins get the full public navbar with a visible cart —
  // an admin browsing the store is shopping, not managing it, so the
  // customer account sidebar doesn't apply to them either.
  if (isCustomer) {
    return (
      <>
        <Navbar />

        <div className="user-dashboard-layout">
          <UserSidebar />
          <div className="user-layout-main">
            {shopContent}
          </div>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {shopContent}
      <Footer />
    </>
  );
}

export default Shop;