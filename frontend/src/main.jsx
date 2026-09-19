import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./style.css";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

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
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    );
}

createRoot(document.getElementById("app")).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);