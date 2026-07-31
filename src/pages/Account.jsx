import "../styles/account.css";

import { useEffect, useState } from "react";

import { getMyProfile, updateProfile } from "../api/dashboard";
import { showSuccess, showError } from "../utils/toast";

function Account() {

  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    gender: "",
    dob: "",
    address: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {

    getMyProfile(token)
      .then((data) => {
        setProfile({
          name: data.name || "",
          phone: data.phone || "",
          gender: data.gender || "",
          dob: data.dob ? data.dob.slice(0, 10) : "",
          address: data.address || ""
        });
      })
      .catch((err) => showError(err.message))
      .finally(() => setLoading(false));

  }, []);

  const handleChange = (e) => {

    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    /* VALIDATION */

    if (
      !profile.name ||
      !profile.phone ||
      !profile.gender ||
      !profile.dob ||
      !profile.address
    ) {

      showError("Please fill all fields");

      return;
    }

    try {
      setSaving(true);
      await updateProfile(profile, token);
      showSuccess("Profile Updated Successfully");
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }

  };

  if (loading) {
    return <p className="shop-status">Loading your profile...</p>;
  }

  return (
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
            type="text"
            name="name"
            placeholder="Full Name"
            value={profile.name}
            onChange={handleChange}
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={profile.phone}
            onChange={handleChange}
          />

          <select
            name="gender"
            value={profile.gender}
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
            value={profile.dob}
            onChange={handleChange}
          />

          <input
            type="text"
            name="address"
            placeholder="Address"
            value={profile.address}
            onChange={handleChange}
          />

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Account;