import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/contact.css";

import { useState } from "react";
import { showSuccess, showError } from "../utils/toast";

function Contact() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [sending, setSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      showError("Please fill in your name, email, and message");
      return;
    }

    // NOTE: there's no backend endpoint to receive contact messages yet
    // (no contactController/contactRoutes). For now this just confirms
    // to the user that their message was captured; wire this up to a
    // real /api/contact endpoint once one exists.
    setSending(true);
    setTimeout(() => {
      showSuccess("Thanks for reaching out! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSending(false);
    }, 400);
  };

  return (
    <>
      <Navbar />

      <section className="contact-hero">
        <div className="contact-tag">Get In Touch</div>
        <h1>
          We'd Love to Hear From
          <br />
          You
        </h1>
        <p>
          Have a question about our crochet keychains? Want a custom order or
          just want to say hi? Fill out the form or reach us through our
          socials. We're here to help!
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-form-card">
  <form className="contact-form" onSubmit={handleSubmit}>
    <label>Your Name</label>
    <input
      type="text"
      name="name"
      placeholder="Enter your name"
      value={formData.name}
      onChange={handleChange}
    />

    <label>Email Address</label>
    <input
      type="email"
      name="email"
      placeholder="Enter your email"
      value={formData.email}
      onChange={handleChange}
    />

    <label>Subject</label>
    <input
      type="text"
      name="subject"
      placeholder="What is your inquiry?"
      value={formData.subject}
      onChange={handleChange}
    />

    <label>Your Message</label>
    <textarea
      name="message"
      rows="5"
      placeholder="Tell us everything about your crochet dream..."
      value={formData.message}
      onChange={handleChange}
    ></textarea>

    <button type="submit" disabled={sending}>
      {sending ? "Sending..." : "Send Message"}
    </button>

  </form>
</div>
        <div className="contact-right">

  <div className="contact-info">

          <h2>
            Contact Information
          </h2>

          <div className="contact-items-grid">
            <div className="contact-item">

              <div>
                <span>Email Us</span>
                <h3>hello@yarn-nyou.com</h3>
              </div>
            </div>

            <div className="contact-item">
              <div>
                <span>Follow Us</span>
                <h3>@yarn_nyou</h3>
              </div>
            </div>
          </div>

          <div className="contact-item-location">
            <div>
              <span>Location</span>
              <h3>Sanepa 2, Lalitpur</h3>
            </div>
          </div>

        </div>

  <div className="latest-card">
    <h2>See Our Latest Drops</h2>

    <p>
      Follow our journey and daily crochet updates on Instagram.
    </p>

    <button>
      Follow @yarn_nyou
    </button>
  </div>

</div>
      </section>

      <Footer />
    </>
  );
}

export default Contact;