import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { getProductById } from "../api/products";
import { addItemToCart } from "../utils/cartService";
import { notifyCartUpdated } from "../utils/cartService";
import { showSuccess, showError } from "../utils/toast";

import "../styles/shop.css";



function ProductDetail() {

  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {

    getProductById(id)
      .then((data) => {
        setProduct(data);
        const primary = data.images?.find((img) => img.is_primary) || data.images?.[0];
        setActiveImage(primary ? `${primary.image_url}` : "/images/hh.png");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

  }, [id]);

  const handleAddToCart = async () => {

    const token = localStorage.getItem("token");

    try {
      setAdding(true);
      await addItemToCart(
        {
          product_id: product.product_id,
          name: product.name,
          price: product.price,
          stock: product.stock,
          image_url: activeImage
        },
        quantity,
        token
      );
      notifyCartUpdated();
      showSuccess("Added to cart");
    } catch (err) {
      showError(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p className="shop-status">Loading product...</p>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <p className="shop-status shop-error">{error || "Product not found"}</p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="product-detail">

        <div className="product-detail-images">
          <img src={activeImage} alt={product.name} className="product-detail-main" />

          {product.images && product.images.length > 1 && (
            <div className="product-detail-thumbs">
              {product.images.map((img) => (
                <img
                  key={img.image_id}
                  src={`${img.image_url}`}
                  alt={product.name}
                  onClick={() => setActiveImage(`${img.image_url}`)}
                  className={activeImage === `${img.image_url}` ? "active" : ""}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">

          <h1>{product.name}</h1>
          <p className="product-detail-price">Rs. {product.price}</p>

          {product.description && <p className="product-detail-desc">{product.description}</p>}

          <ul className="product-detail-meta">
            {product.material && <li><strong>Material:</strong> {product.material}</li>}
            {product.color && <li><strong>Color:</strong> {product.color}</li>}
            <li><strong>Availability:</strong> {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</li>
            
          </ul>

          {product.stock > 0 ? (
            <div className="product-detail-actions">
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
              />

              <button onClick={handleAddToCart} disabled={adding}>
                {adding ? "Adding..." : "Add To Cart"}
              </button>
            </div>
          ) : (
            <button disabled>Out of Stock</button>
          )}
        </div>

      </section>

      <Footer />
    </>
  );
}

export default ProductDetail;