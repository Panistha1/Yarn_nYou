import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import AdminNavbar from "../components/AdminNavbar";
import AdminSidebar from "../components/AdminSidebar";

import "../styles/sidebar.css";

function AdminLayout() {

  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  /* BLOCK NON-ADMINS — single source of truth for every /admin/* route */
  useEffect(() => {

    if (!storedUser || storedUser.role !== "Admin") {
      alert("Admin access only");
      navigate("/login", { state: { from: location.pathname } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render nothing while the redirect above is in flight, so a
  // non-admin never sees a flash of admin content underneath.
  if (!storedUser || storedUser.role !== "Admin") {
    return null;
  }

  return (
    <>
      <AdminNavbar />

      <div className="admin-layout">

        <AdminSidebar />

        <div className="admin-layout-main">
          <Outlet />
        </div>

      </div>
    </>
  );
}

export default AdminLayout;