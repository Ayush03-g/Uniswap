const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports (uses STARTTLS)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Nodemailer Gmail SMTP Verification Failed:");
        console.error(error);
        // Fail loudly as per requirements
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
    } else {
        console.log("✅ Nodemailer Gmail SMTP Connected Successfully");
    }
});

module.exports = transporter;
