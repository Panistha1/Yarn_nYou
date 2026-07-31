import "../styles/sidebar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

const SIDEBAR_LINKS = [
  { label: "Dashboard", path: "/userdashboard", icon: "🏠", matchHash: "" },
  { label: "My Orders", path: "/orders", icon: "📦" },
  { label: "Shop", path: "/shop", icon: "🧶" },
  { label: "My Profile", path: "/account", icon: "👤" },
  { label: "My Cart", path: "/cart", icon: "🛒" }
];

function UserSidebar() {

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (link) => {
    const pathToCheck = link.matchPath || link.path;

    if (location.pathname !== pathToCheck) {
      return false;
    }

    // "Overview" and "My Orders" both live at /userdashboard — only the
    // URL hash tells them apart, so links with a matchHash need that to
    // match too instead of just the path.
    if (link.matchHash !== undefined) {
      return location.hash === link.matchHash;
    }

    return true;
  };

  return (
    <aside className="app-sidebar app-sidebar--flush">

      <nav className="app-sidebar-nav">
        {SIDEBAR_LINKS.map((link) => (
          <Link
            key={link.label}
            to={link.path}
            className={
              "app-sidebar-link" + (isActive(link) ? " active" : "")
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

export default UserSidebar;