// This script builds and runs the app in production mode
const { exec, spawn } = require('child_process');

console.log('Building the application...');
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Build error: ${error}`);
    return;
  }
  console.log(stdout);
  
  console.log('Starting the application in production mode...');
  // Use spawn to keep the process running
  const prodProcess = spawn('node', ['dist/index.js'], {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'inherit'
  });
  
  prodProcess.on('error', (error) => {
    console.error(`Failed to start production server: ${error}`);
  });
});