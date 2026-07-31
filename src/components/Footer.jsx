import { Link } from "react-router-dom";
import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-col footer-brand">
          <h2>yarn_nyou</h2>
          <p>
            Spreading happiness one stitch at a time.
            <br />
            Handmade with love in every knot.
          </p>
        </div>

        <div className="footer-col">
          <h3>Shop</h3>
          {/* These used to be plain <p> tags styled to look like nav
              links but going nowhere when clicked. Real links now. */}
          <Link to="/shop">All Products</Link>
          <Link to="/cart">Your Cart</Link>
        </div>

        <div className="footer-col">
          <h3>Support</h3>
          <Link to="/contact">Contact Us</Link>
          <Link to="/account">My Account</Link>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} yarn_nyou. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;