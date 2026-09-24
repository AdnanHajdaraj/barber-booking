function About() {
  return (
    <main className="page about">
      {/* Hero */}
      <section className="page-hero">
        <p className="eyebrow">Since day one</p>
        <h1>About Us</h1>
        <p className="lede">
          Welcome to <strong>Barber Booking</strong> — a simple, modern way
          to reserve your next cut, shave, or beard trim without the wait.
        </p>
      </section>

      {/* Story + values */}
      <section className="about-grid">
        <article className="card">
          <h2>Our Story</h2>
          <p>
            We built Barber Booking because booking a haircut shouldn't
            mean phone tag or waiting in line. Choose your barber, pick a
            service, and lock in a time that works for you — all in a
            couple of taps.
          </p>
        </article>

        <article className="card">
          <h2>How It Works</h2>
          <ol className="steps">
            <li>Choose your barber</li>
            <li>Select a service</li>
            <li>Pick an available date &amp; time</li>
            <li>Manage or reschedule anytime</li>
          </ol>
        </article>
      </section>

      {/* Values strip */}
      <section className="values">
        <div className="value">
          <h3>Precision</h3>
          <p>Every cut, dialed in to your style.</p>
        </div>
        <div className="value">
          <h3>Convenience</h3>
          <p>Book in seconds, reschedule in one tap.</p>
        </div>
        <div className="value">
          <h3>Consistency</h3>
          <p>Your favorite barber, your favorite chair — every time.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready for a fresh cut?</h2>
        <a href="/booking" className="btn">Book an appointment</a>
      </section>
    </main>
  );
}

export default About;