const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../../frontend/public/images');

const imagesToDownload = [
  {
    filename: 'farmland_hills_rwanda.jpg',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', // lush green farmland hills
  },
  {
    filename: 'lake_kivu_waterfront.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', // tropical waterfront resort
  },
  {
    filename: 'car_land_cruiser.jpg',
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', // 4x4 SUV
  },
  {
    filename: 'car_ev_kigali.jpg',
    url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80', // modern electric car
  },
  {
    filename: 'truck_transport.jpg',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80', // commercial transport truck
  },
  {
    filename: 'market_smartphone.jpg',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80', // smartphone tech
  },
  {
    filename: 'market_solar_system.jpg',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80', // solar power panels
  },
  {
    filename: 'market_crafts_art.jpg',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80', // handcrafted art
  },
  {
    filename: 'market_construction.jpg',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80', // construction materials site
  },
  {
    filename: 'market_agro_products.jpg',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80', // specialty coffee beans
  },
  {
    filename: 'gis_drone_mapping.jpg',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80', // drone aerial survey
  },
  {
    filename: 'gis_gnss_receiver.jpg',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80', // surveyor tripod precision instrument
  },
  {
    filename: 'gis_topo_contours.jpg',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80', // topographic map
  },
  {
    filename: 'service_electrician.jpg',
    url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80', // electrician technician
  },
  {
    filename: 'service_painting.jpg',
    url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1200&q=80', // painter interior decorator
  },
  {
    filename: 'service_mechanic.jpg',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80', // auto mechanic garage
  },
  {
    filename: 'service_catering.jpg',
    url: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80', // catering banquet chef
  }
];

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed with status: ${response.statusCode}`));
      }
      const fileStream = fs.createWriteStream(dest);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', (err) => {
        fs.unlink(dest, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Starting download of ${imagesToDownload.length} sample media files...`);
  for (const item of imagesToDownload) {
    const dest = path.join(targetDir, item.filename);
    try {
      await downloadImage(item.url, dest);
      const stats = fs.statSync(dest);
      console.log(`✓ Downloaded ${item.filename} (${Math.round(stats.size / 1024)} KB)`);
    } catch (err) {
      console.error(`✗ Error downloading ${item.filename}:`, err.message);
    }
  }
  console.log('All sample media processed!');
}

run();
