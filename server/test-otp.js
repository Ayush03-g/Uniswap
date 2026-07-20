const { spawn } = require('child_process');
const http = require('http');

console.log('Starting server...');
const server = spawn('node', ['server.js']);

server.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output);
    
    // When server is fully ready
    if (output.includes('Server running on port 5000')) {
        console.log('\n--- Server is ready. Sending OTP request... ---');
        
        const payload = JSON.stringify({ email: 'ayushgargsbl@gmail.com', type: 'register' });
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/send-otp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': payload.length
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                console.log('\n--- API RESPONSE ---');
                console.log('STATUS:', res.statusCode);
                console.log('BODY:', body);
                
                // Allow a bit of time for any lingering logs (like sendMail response) to print
                setTimeout(() => {
                    server.kill();
                    process.exit(0);
                }, 2000);
            });
        });
        
        req.on('error', (err) => {
            console.error('\n--- HTTP REQUEST ERROR ---', err);
            server.kill();
            process.exit(1);
        });
        
        req.write(payload);
        req.end();
    }
});

server.stderr.on('data', (data) => {
    process.stderr.write(data);
});
