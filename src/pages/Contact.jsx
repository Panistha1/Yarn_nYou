import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/contact.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLocationDot, faComment } from "@fortawesome/free-solid-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";


function Contact() {
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
  <form className="contact-form">
    <label>Your Name</label>
    <input
      type="text"
      placeholder="Enter your name"
    />

    <label>Email Address</label>
    <input
      type="email"
      placeholder="Enter your email"
    />

    <label>Subject</label>
    <input
      type="text"
      placeholder="What is your inquiry?"
    />

    <label>Your Message</label>
    <textarea
      rows="5"
      placeholder="Tell us everything about your crochet dream..."
    ></textarea>

    <button type="submit">
      Send Message
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