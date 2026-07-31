import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/register.css";

import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import { registerUser } from "../api/auth";
import { showSuccess, showError } from "../utils/toast";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);

  /* HANDLE INPUT */

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  /* HANDLE SUBMIT */

  const handleSubmit = async (e) => {

    e.preventDefault();

    /* EMPTY CHECK */

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.password ||
      !formData.confirmPassword
    ) {

      showError("Please fill all fields");

      return;
    }

    /* PHONE VALIDATION */

    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;

    if (!phoneRegex.test(formData.phone)) {

      showError("Please enter a valid phone number");

      return;
    }

    /* EMAIL VALIDATION */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {

      showError("Invalid Email");

      return;
    }

    /* PASSWORD LENGTH */

    if (formData.password.length < 6) {

      showError("Password must be at least 6 characters");

      return;
    }

    /* CONFIRM PASSWORD */

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      showError("Passwords do not match");

      return;
    }

    try {

      setLoading(true);

      await registerUser(formData);

      showSuccess("Account Created Successfully");

      // No token comes back from signup, so send them to log in
      navigate("/login");

    } catch (err) {

      showError(err.message);

    } finally {

      setLoading(false);

    }

  };

  return (
    <>
      <Navbar />

      <div className="register-container">

        {/* LEFT SIDE */}

        <div className="register-left">

          <span className="small-tag">
            Handmade With Love
          </span>

          <h1>
            Join the
            <span> yarn_nyou </span>
            Community
          </h1>

          <p>
            Create your account and explore
            adorable handmade crochet creations.
          </p>

          <img
            src="/images/hh.png"
            alt="crochet"
          />

        </div>

        {/* RIGHT SIDE */}

        <div className="register-right">

          <h1>Create Account</h1>

          <p>
            Please fill in your details to sign up.
          </p>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              name="name"
              placeholder="Name"
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
            />

            <input
              type="text"
              name="address"
              placeholder="Shipping Address"
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              onChange={handleChange}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create My Account"}
            </button>

          </form>

          <p className="bottom-text">
            Already have an account?
            <Link to="/login">
              <span> Login</span>
            </Link>
          </p>

          <p className="terms-text">
            By continuing, you agree to yarn_nyou's Terms of Service and Privacy Policy
          </p>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default Register;