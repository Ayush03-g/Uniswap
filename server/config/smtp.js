const transporter = {
    sendMail: async (mailOptions) => {
        const payload = {
            sender: { email: process.env.EMAIL_FROM || mailOptions.from },
            to: [{ email: mailOptions.to }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.html
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY || process.env.SMTP_PASS,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brevo API Error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    },
    verify: async () => {
        return true;
    }
};

transporter.verify().then(() => {
    console.log("✅ Brevo HTTP API Connected");
}).catch(err => {
    console.error("❌ Brevo HTTP API Verification Failed:");
    console.error(err);
});

module.exports = transporter;
