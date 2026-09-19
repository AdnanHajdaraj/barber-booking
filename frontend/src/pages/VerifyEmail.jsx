import { useEffect, useState, useRef } from "react";

function VerifyEmail() {
    const [message, setMessage] = useState("Verifying your email...");
    const [success, setSuccess] = useState(false);
    const verificationStarted = useRef(false);

    useEffect(() => {
        if (verificationStarted.current) {
    return;
}

verificationStarted.current = true;
        const verifyEmail = async () => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token");

            if (!token) {
                setMessage("Verification token is missing.");
                return;
            }

            try {
                const response = await fetch(
                    `http://localhost:5000/api/auth/verify-email?token=${token}`
                );

                const data = await response.json();

                if (!response.ok) {
                    setMessage(data.message || "Email verification failed.");
                    return;
                }

                setSuccess(true);
                setMessage(data.message);
            } catch (error) {
                console.error(error);
                setMessage("Unable to connect to the server.");
            }
        };

        verifyEmail();
    }, []);

    return (
        <div>
            <h1>Email Verification</h1>

            <p>{message}</p>

            {success && (
                <p>
                    Your email has been successfully verified.
                    You can now book an appointment.
                </p>
            )}
        </div>
    );
}

export default VerifyEmail;