import { useEffect, useState } from "react";

function Dashboard() {
    const [message, setMessage] = useState("Loading...");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setMessage("You are not logged in.");
            return;
        }

        const getDashboard = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/protected",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setMessage(data.message || "Access denied.");
                    return;
                }

                setMessage(data.message);
            } catch (error) {
                console.error(error);
                setMessage("Unable to connect to the server.");
            }
        };

        getDashboard();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            <p>{message}</p>
        </div>
    );
}

export default Dashboard;