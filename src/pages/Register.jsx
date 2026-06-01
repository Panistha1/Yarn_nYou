import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/register.css";

import { useState } from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  /* HANDLE INPUT */

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  /* HANDLE SUBMIT */

  const handleSubmit = (e) => {

    e.preventDefault();

    /* EMPTY CHECK */

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {

      alert("Please fill all fields");

      return;
    }

    /* EMAIL VALIDATION */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {

      alert("Invalid Email");

      return;
    }

    /* PASSWORD LENGTH */

    if (formData.password.length < 6) {

      alert(
        "Password must be at least 6 characters"
      );

      return;
    }

    /* CONFIRM PASSWORD */

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      alert("Passwords do not match");

      return;
    }

    alert("Account Created Successfully");

navigate("/");
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

            <button type="submit">
              Create My Account
            </button>

          </form>

          <p className="bottom-text">

            Already have an account?

            <Link to="/login">
              <span> Login</span>
            </Link>
<p>
  By continuing, you agree to yarn_nyou's Terms of Service and Privacy Policy

</p>
          </p>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default Register;