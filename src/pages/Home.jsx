import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

import { getAllProducts } from "../api/products";
import { addItemToCart } from "../utils/cartService";
import { notifyCartUpdated } from "../utils/cartService";

import "../styles/home.css";
import { showSuccess, showError } from "../utils/toast";

function Home() {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {

    getAllProducts()
      .then((products) => {
        // Only products the admin has explicitly marked "featured" —
        // no fallback to other products if none are marked yet.
        setFeaturedProducts(products.filter((p) => Boolean(p.featured)));
      })
      .catch(() => setFeaturedProducts([]))
      .finally(() => setLoadingFeatured(false));

  }, []);

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

  return (

    <>

      <Navbar/>


      <section className="hero">

        <div className="hero-left">

          <h1>
            Handmade <br/>
            <span>Crochet</span>
            <br/>
            Happiness
          </h1>

          <p align="justify">

            Discover a world of cozy,
            hand-knotted keychains
            and accessories designed
            to bring a little extra joy
            to your everyday carry.

          </p>


          <div className="hero-buttons">

            <button className="shop-btn" onClick={() => navigate("/shop")}>
              Shop Keychains
            </button>


          </div>


          <div className="hero-stats">

            <div>
              <h2>5k+</h2>
              <p>Happy Loops</p>
            </div>

            <div>
              <h2>100%</h2>
              <p>Handcrafted</p>
            </div>

          </div>

        </div>


        <div className="hero-right">

          <img
            src="/images/hh.png"
            alt="crochet"
          />
        </div>
      </section>

      <section className="products-section">

        <div className="section-title">

          <h2>Featured Keychains</h2>

          <p>

            Hand-picked by us, freshly stitched
            and ready for their forever homes.

          </p>
        </div>

        {loadingFeatured ? (
          <p className="shop-status">Loading featured keychains...</p>
        ) : featuredProducts.length === 0 ? (
          <p className="shop-status">
            No featured keychains yet — check back soon, or browse the full shop!
          </p>
        ) : (
          <div className="marquee">

            <div className="marquee-content">
              {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard
                  key={`first-${product.product_id}`}
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

              {/* Second set of items (visual duplicate, keeps the marquee
                  scroll looping seamlessly even with few featured items) */}
             {featuredProducts.slice(0, 6).map((product) => (
                <ProductCard
                  key={`second-${product.product_id}`}
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

          </div>
        )}

      </section>



      <section className="features">

        <div className="feature-box">

          <h3>Made with Love</h3>

          <p>
            Every stitch is hand-hooked
            by passionate creators.
          </p>

        </div>


        <div className="feature-box">

          <h3>Premium Quality</h3>

          <p>
            Soft cotton yarn and
            durable craftsmanship.
          </p>

        </div>


        <div className="feature-box">

          <h3>Cute Packaging</h3>

          <p>
            Packed beautifully with
            personalized touches.
          </p>

        </div>

      </section>


      <Footer/>

    </>

  );

}

export default Home;