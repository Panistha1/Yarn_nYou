import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/login.css";

import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";


function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (
      !formData.email ||
      !formData.password
    ) {

      alert("Please fill all fields");

      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {

      alert("Invalid Email");

      return;
    }

    if (formData.password.length < 6) {

      alert(
        "Password must be at least 6 characters"
      );

      return;
    }

    alert("Login Successful");

    navigate("/");

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

            <button type="submit">
              Sign In
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