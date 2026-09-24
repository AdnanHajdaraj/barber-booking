import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(
        Boolean(localStorage.getItem("token"))
    );

    const navigate = useNavigate();

    // Re-check auth on every navigation / storage change
    useEffect(() => {
        const sync = () =>
            setIsLoggedIn(Boolean(localStorage.getItem("token")));

        window.addEventListener("storage", sync);       // cross-tab
        window.addEventListener("auth-changed", sync);  // same-tab
        window.addEventListener("focus", sync);         // safety net

        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("auth-changed", sync);
            window.removeEventListener("focus", sync);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setMenuOpen(false);
        navigate("/");
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <header className="navbar">
            <div className="navbar-inner">
                {/* Logo */}
                <Link to="/" className="logo" onClick={closeMenu}>
                    <span className="logo-mark" aria-hidden="true" />
                    <span className="logo-text">Barber Booking</span>
                </Link>

                {/* Mobile menu toggle */}
                <button
                    type="button"
                    className="menu-toggle"
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    <span />
                    <span />
                    <span />
                </button>

                {/* Nav links */}
                <nav
                    className={`nav-links ${menuOpen ? "is-open" : ""}`}
                    aria-label="Main navigation"
                >
                    <NavLink to="/" end onClick={closeMenu}>
                        Home
                    </NavLink>
                    <NavLink to="/about" onClick={closeMenu}>
                        About
                    </NavLink>
                    <NavLink to="/services" onClick={closeMenu}>
                        Services
                    </NavLink>
                    <NavLink to="/contact" onClick={closeMenu}>
                        Contact
                    </NavLink>

                    <span className="nav-divider" aria-hidden="true" />

                    {isLoggedIn ? (
                        <>
                            <NavLink to="/dashboard" onClick={closeMenu}>
                                Dashboard
                            </NavLink>
                            <button
                                type="button"
                                className="btn btn-sm"
                                onClick={handleLogout}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" onClick={closeMenu}>
                                Login
                            </NavLink>
                            <Link
                                to="/booking"
                                className="btn btn-sm nav-cta"
                                onClick={closeMenu}
                            >
                                Book Now
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Navbar;