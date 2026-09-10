const http = require('http');

const lots = [
  {
    cropName: 'Sona Masuri Paddy (Grade-A)',
    quantity: '120 Quintals',
    farmerName: 'Ramesh Gowda',
    location: 'Mandya, Karnataka',
    pricePerQuintal: 2450
  },
  {
    cropName: 'Hybrid Red Tomato',
    quantity: '45 Quintals',
    farmerName: 'Shivanna H.',
    location: 'Kolar, Karnataka',
    pricePerQuintal: 1800
  },
  {
    cropName: 'Medium Staple Cotton',
    quantity: '80 Quintals',
    farmerName: 'Basavaraj Patil',
    location: 'Dharwad, Karnataka',
    pricePerQuintal: 7150
  },
  {
    cropName: 'Yellow Feed Maize',
    quantity: '150 Quintals',
    farmerName: 'Anil Kumar',
    location: 'Shimoga, Karnataka',
    pricePerQuintal: 2180
  }
];

function postItem(item) {
  const data = JSON.stringify(item);
  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/products',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data),
    },
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => console.log('Seeded lot:', item.cropName));
  });

  req.on('error', (e) => console.error(`Failed to seed ${item.cropName}:`, e.message));
  req.write(data);
  req.end();
}

lots.forEach((lot) => postItem(lot));