import "../styles/navbar.css";

import {
  FaHeart,
  FaShoppingBag,
  FaUser
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">

 <Link to="/" className="nav-btn">
      <h2 className="logo">yarn_nyou</h2> 
    </Link>
<ul className="nav-links">

  <li>
    <Link to="/notfound" className="nav-btn">
      Shop
    </Link>
  </li>

  <li>
    <Link to="/notfound" className="nav-btn">
      About
    </Link>
  </li>

  <li>
    <Link to="/contact" className="nav-btn">
      Contact
    </Link>
  </li>

</ul>
      <div className="nav-right">
        <input
          type="text"
          placeholder="Search crochet..."
        />

        <FaShoppingBag className="icon" />

        <FaHeart className="icon" />

        <Link to="/login">
          <FaUser className="icon" />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;