console.log('--- Email Configuration Check ---');
let missingVariables = false;

if (process.env.BREVO_API_KEY) {
    console.log('✓ BREVO_API_KEY loaded');
} else {
    console.error('✗ BREVO_API_KEY missing');
    missingVariables = true;
}

if (process.env.EMAIL_FROM) {
    console.log('✓ EMAIL_FROM loaded');
} else {
    console.error('✗ EMAIL_FROM missing');
    missingVariables = true;
}

if (missingVariables) {
    console.error('CRITICAL: Cannot start email service. Please add the missing environment variables to Render.');
    if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
    }
}
console.log('---------------------------------');

const transporter = {
    sendMail: async (mailOptions) => {
        console.log(`[BREVO API] Preparing payload for ${mailOptions.to}`);
        
        const payload = {
            sender: { email: process.env.EMAIL_FROM },
            to: [{ email: mailOptions.to }],
            subject: mailOptions.subject,
            htmlContent: mailOptions.html
        };

        console.log(`[BREVO API] Calling https://api.brevo.com/v3/smtp/email...`);
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[BREVO API] ❌ ERROR: ${response.status} - ${errorText}`);
            throw new Error(`Brevo API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`[BREVO API] ✅ SUCCESS: Message ID ${data.messageId}`);
        return data;
    }
};

module.exports = transporter;
