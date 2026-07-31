import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/login.css";

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { loginUser } from "../api/auth";
import { mergeGuestCartIntoAccount } from "../utils/cartService";
import { notifyCartUpdated } from "../utils/cartService";
import { showSuccess, showError } from "../utils/toast";


function Login() {

  const navigate = useNavigate();
  const location = useLocation();

  // If we got here because a protected action redirected us (e.g. "add
  // to cart" while logged out), send the user right back afterward
  // instead of always dropping them on the dashboard.
  const redirectTo = location.state?.from;

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      !formData.email ||
      !formData.password
    ) {

      showError("Please fill all fields");

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {

      showError("Invalid Email");

      return;
    }

    if (formData.password.length < 6) {

      showError(
        "Password must be at least 6 characters"
      );

      return;
    }

    try {

      setLoading(true);

      const data = await loginUser(formData);

      // Store token + user so other pages know who's logged in
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Anything added to the cart as a guest now becomes part of the
      // real account cart, instead of silently disappearing on login.
      await mergeGuestCartIntoAccount(data.token);
      notifyCartUpdated();

      showSuccess("Login Successful");

      // Send the user back where they came from, if we know that —
      // otherwise fall back to their role's dashboard.
      if (redirectTo) {
        navigate(redirectTo);
      } else if (data.user.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/userdashboard");
      }

    } catch (err) {

      showError(err.message);

    } finally {

      setLoading(false);

    }

  };
  return (
    <>
      <Navbar />

      <div className="login-container">

        <div className="left-side">

          <span className="small-tag">
            Handmade With Love
          </span>

          <h1>
            Welcome to the
            <span> yarn_nyou </span>
            Family
          </h1>

          <p>
            Join our cozy crochet community.
          </p>

          <img
            src="/images/ll.png"
            alt="crochet"
          />

        </div>

        <div className="right-side">

          <h1>Welcome Back!</h1>

          <p>
            Please enter your details to sign in.
          </p>
<form onSubmit={handleSubmit}>

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>

<p className="bottom-text">

  Don't have an account?

  <Link to="/register">
    <span> Register</span>
  </Link>
</p>
          </form>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default Login;