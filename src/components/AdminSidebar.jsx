import "../styles/sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SIDEBAR_LINKS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
  { label: "Products", path: "/admin/products", icon: "🧶" },
  { label: "Categories", path: "/admin/categories", icon: "🗂️" },
  { label: "Orders", path: "/admin/orders", icon: "📦" },
  { label: "Users", path: "/admin/users", icon: "👥" },
];

function AdminSidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="app-sidebar app-sidebar--flush">

      <nav className="app-sidebar-nav">
        {SIDEBAR_LINKS.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={
              "app-sidebar-link" +
              (location.pathname.startsWith(link.path) ? " active" : "")
            }
          >
            <span className="app-sidebar-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <button className="app-sidebar-logout" onClick={handleLogout}>
        <span className="app-sidebar-icon">🚪</span>
        Logout
      </button>

    </aside>
  );
}

export default AdminSidebar;