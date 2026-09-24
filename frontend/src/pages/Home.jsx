import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="page home">
      {/* ===== Hero ===== */}
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Fresh cuts, zero wait</p>

          <h1>
            Welcome to <span className="brand">Barber Booking</span>
          </h1>

          <p className="lede">
            Book your next haircut quickly and easily — choose a barber,
            pick a time, and walk in like a regular.
          </p>

          <div className="hero-actions">
            <Link to="/booking" className="btn btn-lg">
              Book an Appointment
            </Link>
            <Link to="/about" className="btn secondary">
              Learn more
            </Link>
          </div>
        </div>

        {/* Decorative barber pole */}
        <div className="hero-pole" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="features">
        <h2 className="section-title">
          Professional Barber Services
        </h2>

        <p className="section-lede">
          Choose your preferred barber, service, date and available time
          slot — everything in one simple flow.
        </p>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">✂</div>
            <h3>Skilled Barbers</h3>
            <p>
              Pick from experienced barbers, each with their own style
              and specialties.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">📅</div>
            <h3>Live Availability</h3>
            <p>
              See real openings and book the slot that fits your day.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">⚡</div>
            <h3>Instant Booking</h3>
            <p>
              Confirm in seconds. No phone calls, no waiting in line.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon" aria-hidden="true">💈</div>
            <h3>Manage Anywhere</h3>
            <p>
              Reschedule or cancel from your dashboard whenever you need.
            </p>
          </article>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta">
        <h2>Ready for a fresh cut?</h2>
        <p>Your chair is one click away.</p>
        <Link to="/booking" className="btn btn-lg">
          Book an Appointment
        </Link>
      </section>
    </main>
  );
}

export default Home;