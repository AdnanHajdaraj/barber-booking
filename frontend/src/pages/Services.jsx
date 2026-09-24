import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Services() {
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("Loading services…");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/services/public"
        );
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Could not load services.");
          return;
        }

        setServices(data.services || []);
        setMessage("");
      } catch (error) {
        console.error(error);
        setMessage("Unable to connect to the server.");
      }
    };

    fetchServices();
  }, []);

  // Group services by barber/shop
  const grouped = services.reduce((acc, service) => {
    const key = service.shop_name || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(service);
    return acc;
  }, {});

  return (
    <main className="page services">
      <header className="page-hero">
        <p className="eyebrow">What we offer</p>
        <h1>Our Services</h1>
        <p className="lede">
          Every service is set by the barber who offers it — prices and
          times are always up to date.
        </p>
      </header>

      {message && <p className="hint">{message}</p>}

      {services.length === 0 && !message && (
        <p className="hint">
          No services available right now. Check back soon.
        </p>
      )}

      {Object.entries(grouped).map(([shopName, shopServices]) => (
        <section key={shopName} className="shop-group">
          <header className="shop-head">
            <h2>{shopName}</h2>
            {shopServices[0]?.barber_name && (
              <p className="shop-barber">
                Barber: {shopServices[0].barber_name}
              </p>
            )}
          </header>

          <div className="service-grid">
            {shopServices.map((service) => (
              <article key={service.id} className="service-card">
                <div className="service-icon" aria-hidden="true">💈</div>

                <h3>{service.name}</h3>

                <p className="service-desc">
                  {service.description || "No description provided."}
                </p>

                <div className="service-meta">
                  <span className="price">€{service.price}</span>
                  <span className="duration">
                    {service.duration} min
                  </span>
                </div>

                <Link to="/booking" className="btn service-cta">
                  Book this
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* Info strip */}
      <section className="service-info">
        <div className="info-item">
          <h3>Walk-ins welcome</h3>
          <p>Subject to availability — booking ahead is recommended.</p>
        </div>
        <div className="info-item">
          <h3>Cash & card</h3>
          <p>We accept both. No hidden fees, ever.</p>
        </div>
        <div className="info-item">
          <h3>Free consultation</h3>
          <p>Not sure what you want? We'll help you decide.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Ready for a fresh cut?</h2>
        <p>Pick a service, choose your barber, and lock in a time.</p>
        <Link to="/booking" className="btn btn-lg">
          Book an Appointment
        </Link>
      </section>
    </main>
  );
}

export default Services;