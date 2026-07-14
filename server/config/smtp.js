const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

transporter.verify().then(() => {
    console.log("✅ Gmail SMTP Connected");
}).catch(err => {
    console.error("❌ Gmail SMTP Verification Failed:");
    console.error(err);
});

module.exports = transporter;
