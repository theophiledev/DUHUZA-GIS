const https = require('https');
const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '../../frontend/public/images/market_solar_system.jpg');
const url = 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=1200&q=80';

function download(u, dest) {
  https.get(u, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return download(res.headers.location, dest);
    }
    if (res.statusCode !== 200) {
      console.error('Failed:', res.statusCode);
      return;
    }
    const file = fs.createWriteStream(dest);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
      const stats = fs.statSync(dest);
      console.log(`✓ Downloaded market_solar_system.jpg (${Math.round(stats.size / 1024)} KB)`);
    });
  });
}

download(url, target);
