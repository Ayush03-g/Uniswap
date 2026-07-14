const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    family: 4 // Force IPv4 to prevent Render timeout issues
});

module.exports = transporter;
