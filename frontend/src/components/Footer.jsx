import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand column */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-mark" aria-hidden="true" />
            <span>Barber Booking</span>
          </Link>
          <p className="footer-tagline">
            Fresh cuts, sharp beards, zero waiting. Book your next
            appointment in under a minute.
          </p>
        </div>

        {/* Quick links */}
        <nav className="footer-col" aria-label="Footer navigation">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/booking">Book Appointment</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </nav>

        {/* Account links */}
        <nav className="footer-col" aria-label="Account">
          <h4>Account</h4>
          <ul>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
          </ul>
        </nav>

        {/* Contact */}
        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li>
              <a href="tel:+38300000000">+383 XX XXX XXX</a>
            </li>
            <li>
              <a href="mailto:info@barberbooking.com">
                info@barberbooking.com
              </a>
            </li>
            <li>Prishtina, Kosovo</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} Barber Booking. All rights reserved.</p>
        <p className="footer-credit">
          Made with <span aria-hidden="true">✂</span> in Prishtina
        </p>
      </div>
    </footer>
  );
}

export default Footer;