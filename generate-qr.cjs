const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const deploymentUrl = 'https://boston-trip-4lvp9y2xa-tempranos-projects.vercel.app/';
const outputPath = path.join(__dirname, 'public', 'boston-trip-qr.png');

// Ensure public directory exists
if (!fs.existsSync(path.join(__dirname, 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
}

QRCode.toFile(outputPath, deploymentUrl, {
  errorCorrectionLevel: 'H',
  type: 'image/png',
  quality: 0.95,
  margin: 2,
  width: 400,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
}, (err) => {
  if (err) {
    console.error('Error generating QR code:', err);
    process.exit(1);
  }
  console.log(`✓ QR code generated successfully!`);
  console.log(`✓ Saved to: ${outputPath}`);
  console.log(`✓ URL encoded: ${deploymentUrl}`);
});
