const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'public', 'uniswap_u_logo.svg');

async function generateIcons() {
  await sharp(svgPath).resize(16, 16).toFile(path.join(__dirname, 'public', 'favicon-16x16.png'));
  await sharp(svgPath).resize(32, 32).toFile(path.join(__dirname, 'public', 'favicon-32x32.png'));
  await sharp(svgPath).resize(180, 180).toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
  await sharp(svgPath).resize(192, 192).toFile(path.join(__dirname, 'public', 'android-chrome-192x192.png'));
  await sharp(svgPath).resize(512, 512).toFile(path.join(__dirname, 'public', 'android-chrome-512x512.png'));
  
  // For favicon.ico, we can just copy the 32x32 png since most browsers support it disguised as ico, or just use it.
  await sharp(svgPath).resize(32, 32).toFile(path.join(__dirname, 'public', 'favicon.ico'));
    
  console.log('All branding icons generated successfully!');
}

generateIcons().catch(console.error);
