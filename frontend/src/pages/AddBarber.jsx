import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function AddBarber() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [created, setCreated] = useState(null);

  const navigate = useNavigate();

  // Guard: only owners can open this page
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const check = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/auth/protected",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();

        if (!res.ok || data.user.role !== "BARBER" || !data.user.is_owner) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error(error);
        navigate("/dashboard");
      }
    };

    check();
  }, [navigate]);

  const generatePassword = () => {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let out = "";
    for (let i = 0; i < 12; i++) {
      out +=
        chars[
          crypto.getRandomValues(new Uint8Array(1))[0] % chars.length
        ];
    }
    setPassword(out);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Adding barber…");
    setStatus("loading");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/barbers/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name, email, password })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not add barber.");
        setStatus("error");
        return;
      }

      setMessage("Barber added successfully!");
      setStatus("success");
      setCreated({ ...data.barber, password });
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to the server.");
      setStatus("error");
    }
  };

  // ===== Success screen =====
  if (created) {
    return (
      <main className="page auth-page">
        <div className="auth-card">
          <header className="auth-head">
            <p className="eyebrow">All set</p>
            <h1>Barber added</h1>
            <p className="auth-sub">
              Share these credentials with {created.name}. Ask them to
              change the password after their first login.
            </p>
          </header>

          <div className="credentials">
            <div>
              <span>Email</span>
              <strong>{created.email}</strong>
            </div>
            <div>
              <span>Password</span>
              <strong className="mono">{created.password}</strong>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-block"
              onClick={() => {
                navigator.clipboard.writeText(
                  `Email: ${created.email}\nPassword: ${created.password}`
                );
                setMessage("Copied to clipboard.");
              }}
            >
              Copy credentials
            </button>
            <Link
              to="/dashboard"
              className="btn secondary btn-block"
              style={{ marginTop: "0.5rem" }}
            >
              Back to dashboard
            </Link>
          </div>

          {message && (
            <p className="alert alert-info" role="status">
              {message}
            </p>
          )}
        </div>
      </main>
    );
  }

  // ===== Form =====
  return (
    <main className="page auth-page">
      <div className="auth-card">
        <header className="auth-head">
          <p className="eyebrow">Team</p>
          <h1>Add a barber</h1>
          <p className="auth-sub">
            Create a login for a new barber in your shop.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arben Krasniqi"
              autoComplete="off"
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="barber@example.com"
              autoComplete="off"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <div className="field-row">
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="off"
                minLength={8}
                required
              />
              <button
                type="button"
                className="btn-ghost"
                onClick={generatePassword}
              >
                Generate
              </button>
            </div>
          </label>

          {message && !created && (
            <p
              className={`alert alert-${status || "info"}`}
              role="alert"
              aria-live="polite"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-lg btn-block"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Adding…" : "Add barber"}
          </button>
        </form>

        <p className="auth-foot">
          <Link to="/dashboard">← Back to dashboard</Link>
        </p>
      </div>
    </main>
  );
}

export default AddBarber;