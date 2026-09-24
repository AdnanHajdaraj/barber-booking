import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState(""); // "", "loading", "error", "success"

    const navigate = useNavigate();

    const handleRegister = async (event) => {
        event.preventDefault();

        setMessage("Creating account...");
        setStatus("loading");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Registration failed.");
                setStatus("error");
                return;
            }

            setMessage(
                "Registration successful! Please check your email to verify your account."
            );
            
            setStatus("success");

            // Optional: send them to login after a beat
            setTimeout(() => navigate("/login"), 2500);
        } catch (error) {
            console.error(error);
            setMessage("Unable to connect to the server.");
            setStatus("error");
        }
    };

    return (
        <main className="page auth-page">
            <div className="auth-card">
                <header className="auth-head">
                    <p className="eyebrow">Join the shop</p>
                    <h1>Create your account</h1>
                    <p className="auth-sub">
                        Book appointments in seconds — no phone calls
                        needed.
                    </p>
                </header>

                <form onSubmit={handleRegister} className="auth-form">
                    <label className="field">
                        <span>Name</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            autoComplete="name"
                            placeholder="Your full name"
                            required
                        />
                    </label>

                    <label className="field">
                        <span>Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                            placeholder="you@example.com"
                            required
                        />
                    </label>

                    <label className="field">
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            minLength={8}
                            required
                        />
                    </label>

                    {message && (
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
                        disabled={status === "loading" || status === "success"}
                    >
                        {status === "loading"
                            ? "Creating account…"
                            : "Register"}
                    </button>
                </form>

                <p className="auth-foot">
                    Already have an account?{" "}
                    <Link to="/login">Sign in</Link>
                </p>
            </div>
        </main>
    );
}

export default Register;