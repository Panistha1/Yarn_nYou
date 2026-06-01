import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/account.css";

import { useState } from "react";

function Account() {

  const [profile, setProfile] = useState({
    phone: "",
    gender: "",
    dob: "",
    address: ""
  });

  const handleChange = (e) => {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = (e) => {

    e.preventDefault();

    /* VALIDATION */

    if (
      !profile.phone ||
      !profile.gender ||
      !profile.dob ||
      !profile.address
    ) {

      alert("Please fill all fields");

      return;
    }

    alert("Profile Updated Successfully");

  };

  return (
    <>
      <Navbar />

      <div className="account-container">

        {/* LEFT */}

        <div className="account-left">

          <span className="small-tag">
            Complete Your Profile
          </span>

          <h1>
            Welcome to
            <span> yarn_nyou </span>
          </h1>

          <p>
            Add your personal details for
            better shopping and delivery.
          </p>

          <img
            src="https://i.pinimg.com/736x/74/f5/0d/74f50d7dd59d94dbf0fc95d2d3df4f8e.jpg"
            alt="crochet"
          />

        </div>

        {/* RIGHT */}

        <div className="account-right">

          <h1>Profile Setup</h1>

          <p>
            Complete your account information.
          </p>

          <form onSubmit={handleSubmit}>

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
            />

            <select
              name="gender"
              onChange={handleChange}
            >

              <option value="">
                Select Gender
              </option>

              <option value="female">
                Female
              </option>

              <option value="male">
                Male
              </option>

              <option value="other">
                Other
              </option>

            </select>

           <input
  type="date"
  name="dob"
  className="date-input"
  onChange={handleChange}
/>

            <input
              type:text
              name="address"
              placeholder="Address"
              onChange={handleChange}
            />

            <button type="submit">
              Save Profile
            </button>

          </form>

        </div>

      </div>

      <Footer />
    </>
  );
}

export default Account;