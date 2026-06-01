import { Link } from "react-router-dom";
import "../styles/notfound.css";

function NotFound() {
  return (
    <div className="notfound-container">

      <div className="notfound-tag">
        Oops!
      </div>

      <h1>404</h1>

      <h2>Looks like this stitch came undone</h2>

      <p>
        The page you're looking for doesn't exist or may have been moved.
        Let's get you back to our handmade crochet creations.
      </p>

      <Link to="/">
        <button>Back to Home</button>
      </Link>

    </div>
  );
}

export default NotFound;