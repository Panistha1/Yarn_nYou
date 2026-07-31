import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UserSidebar from "../components/UserSidebar";

import "../styles/sidebar.css";

function UserLayout() {

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  /* BLOCK LOGGED-OUT USERS — single source of truth for the account area */
  useEffect(() => {

    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) {
    return null;
  }

  return (
    <>
      <Navbar />

      <div className="user-dashboard-layout">

        <UserSidebar />

        <div className="user-layout-main">
          <Outlet />
        </div>

      </div>

      <Footer />
    </>
  );
}

export default UserLayout;