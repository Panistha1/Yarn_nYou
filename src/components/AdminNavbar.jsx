import "../styles/adminNavbar.css";
import { Link, useNavigate } from "react-router-dom";

function AdminNavbar() {

  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="admin-navbar">

      <div className="admin-navbar-left">

        <Link to="/admin/dashboard" className="admin-logo">
          yarn_nyou 
        </Link>

    

      </div>

      <div className="admin-navbar-right">

        <span className="admin-avatar">
          {(storedUser?.name || "A").trim().charAt(0).toUpperCase()}
        </span>

        <span className="admin-user-info">
          <span className="admin-name">{storedUser?.name || "Admin"}</span>
          <span className="admin-role">Admin</span>
        </span>

        <button className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </button>

      </div>

    </header>
  );
}

export default AdminNavbar;