// Simple script to test the API endpoints
import { request } from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

console.log('Testing API health endpoint...');
const req = request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE:', data);
    
    if (res.statusCode === 200) {
      console.log('✅ API is working!');
    } else {
      console.log('❌ API returned an error status code');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Error:', e.message);
});

req.on('timeout', () => {
  console.error('❌ Request timed out');
  req.destroy();
});

req.end();