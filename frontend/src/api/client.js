// src/api/client.js
const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:5000";

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    // Try to read JSON body (may be empty on some 204/500 responses)
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const message =
            data.message ||
            data.error ||
            `${res.status} ${res.statusText || "Request failed"}`;

        const error = new Error(message);
        error.status = res.status;
        error.response = data;
        throw error;
    }

    return data;
}