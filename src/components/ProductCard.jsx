import { Link } from "react-router-dom";
import "../styles/productCard.css";

function ProductCard({
  image,
  title,
  price,
  productId,
  stock,
  onAddToCart
}) {

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (onAddToCart) onAddToCart();
  };

  const card = (
    <div className="card">

      <img src={image} alt={title} />

      <h3>{title}</h3>

      <p>{price}</p>

      {typeof stock === "number" && stock <= 0 ? (
        <button disabled>Out of Stock</button>
      ) : (
        <button onClick={onAddToCart ? handleAddToCart : undefined}>
          Add To Cart
        </button>
      )}

    </div>
  );

  // On the Shop page each card links to its product; on the Home marquee
  // (no productId passed) it stays a plain decorative card.
  if (productId) {
    return (
      <Link to={`/shop/${productId}`} className="card-link">
        {card}
      </Link>
    );
  }

  return card;
}

export default ProductCard;