const nodemailer = require('nodemailer');

console.log('--- Email Configuration Check ---');
let missingVariables = false;

if (process.env.SMTP_USER) {
    console.log('✓ SMTP_USER loaded');
} else {
    console.error('✗ SMTP_USER missing');
    missingVariables = true;
}

if (process.env.SMTP_PASS) {
    console.log('✓ SMTP_PASS loaded');
} else {
    console.error('✗ SMTP_PASS missing');
    missingVariables = true;
}

if (missingVariables) {
    console.error('CRITICAL: Cannot start email service. Please add the missing environment variables to Render.');
    if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
    }
}
console.log('---------------------------------');

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
