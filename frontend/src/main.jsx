import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./style.css";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
    return (
        <Routes>
            <Route path="/" element={
                <div>
                    <h1>Barber Booking</h1>
                    <p>Frontend is working.</p>
                </div>
            } />

            <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
    );
}

createRoot(document.getElementById("app")).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);