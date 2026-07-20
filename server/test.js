const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const clientBuildPath = path.join(__dirname, '../client/dist');

console.log('--- RUNTIME VALUES ---');
console.log('__dirname:', __dirname);
console.log('clientBuildPath:', clientBuildPath);
console.log('Resolved index:', path.resolve(clientBuildPath, 'index.html'));
console.log('Exists dist:', fs.existsSync(clientBuildPath));
console.log('Exists index:', fs.existsSync(path.resolve(clientBuildPath, 'index.html')));

console.log('--- ERROR TRACE ---');
app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(5001, () => {
    require('http').get('http://localhost:5001/missing', res => {
        let d = '';
        res.on('data', chunk => d+=chunk);
        res.on('end', () => {
            console.log('HTTP STATUS:', res.statusCode);
            console.log(d.split('<br> &nbsp; &nbsp;at ').join('\n    at ').replace(/<[^>]+>/g, ''));
            process.exit(0);
        });
    });
});
