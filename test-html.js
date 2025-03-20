// Simple script to test the test HTML route
import { request } from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/test',
  method: 'GET',
  timeout: 5000
};

console.log('Testing /test HTML endpoint...');
const req = request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Just show a preview of the response
    console.log('RESPONSE (preview):', data.substring(0, 100) + '...');
    
    if (res.statusCode === 200) {
      console.log('✅ HTML test route is working!');
    } else {
      console.log('❌ HTML test route returned an error status code');
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