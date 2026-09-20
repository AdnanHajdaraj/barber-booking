function Navbar() {
    return (
        <nav>
            <div>
                <h2>Barber Booking</h2>
            </div>

            <div>
                <a href="/">Home</a>
                {" | "}
                <a href="/about">About</a>
                {" | "}
                <a href="/services">Services</a>
                {" | "}
                <a href="/contact">Contact</a>
                {" | "}
                <a href="/booking">Book Appointment</a>
                {" | "}
                <a href="/login">Login</a>
                {" | "}
                <a href="/register">Register</a>
            </div>
        </nav>
    );
}

export default Navbar;