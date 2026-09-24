import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState(""); // "", "loading", "error", "success"

    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        setMessage("Logging in...");
        setStatus("loading");

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Login failed.");
                setStatus("error");
                return;
            }

            localStorage.setItem("token", data.token);
            window.dispatchEvent(new Event("auth-changed"));   // <-- add this
            setMessage("Login successful!");
            setStatus("success");

            // Give the user a beat to see the success message, then redirect
            setTimeout(() => navigate("/dashboard"), 600);
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
                    <p className="eyebrow">Welcome back</p>
                    <h1>Login</h1>
                    <p className="auth-sub">
                        Sign in to manage your appointments.
                    </p>
                </header>

                <form onSubmit={handleLogin} className="auth-form">
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
                            autoComplete="current-password"
                            placeholder="••••••••"
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
                        disabled={status === "loading"}
                    >
                        {status === "loading" ? "Logging in…" : "Login"}
                    </button>
                </form>

                <p className="auth-foot">
                    Don't have an account?{" "}
                    <Link to="/register">Create one</Link>
                </p>
            </div>
        </main>
    );
}

export default Login;