const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
});

transporter.verify().then(() => {
    console.log("✅ Brevo SMTP Connected");
}).catch(err => {
    console.error("❌ Brevo SMTP Verification Failed:");
    console.error(err);
});

module.exports = transporter;
