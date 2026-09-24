function Contact() {
  return (
    <main className="page contact">
      <header className="page-hero">
        <p className="eyebrow">Get in touch</p>
        <h1>Contact Us</h1>
        <p className="lede">
          Have a question? Get in touch with us — we usually reply within a
          few hours.
        </p>
      </header>

      <section className="contact-grid">
        <div className="card contact-card">
          <h2 className="contact-label">Phone</h2>
          <a href="tel:+38300000000" className="contact-value">
            +383 XX XXX XXX
          </a>
        </div>

        <div className="card contact-card">
          <h2 className="contact-label">Email</h2>
          <a
            href="mailto:info@barberbooking.com"
            className="contact-value contact-link"
          >
            info@barberbooking.com
          </a>
        </div>

        <div className="card contact-card">
          <h2 className="contact-label">Location</h2>
          <p className="contact-value">Prishtina, Kosovo</p>
        </div>
      </section>

      <section className="cta">
        <h2>Ready for a fresh cut?</h2>
        <p>Skip the phone call — book online in under a minute.</p>
        <a href="/booking" className="btn">Book an appointment</a>
      </section>
    </main>
  );
}

export default Contact;