const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendVerificationEmail = async (email, token) => {
    const verificationLink =
        `http://localhost:5173/verify-email?token=${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email - Barber Booking",
        html: `
            <h2>Welcome to Barber Booking!</h2>

            <p>Please verify your email address by clicking the button below:</p>

            <a href="${verificationLink}"
               style="
                   display: inline-block;
                   padding: 12px 20px;
                   background-color: #000;
                   color: #fff;
                   text-decoration: none;
                   border-radius: 6px;
               ">
                Verify Email
            </a>

            <p>This link will expire in 24 hours.</p>
        `
    });
};

module.exports = {
    sendVerificationEmail
};