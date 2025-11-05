const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Building mock server...');
  console.log('Current directory:', process.cwd());
  console.log('Files:', require('fs').readdirSync('.'));
  
  // Build command
  execSync('npx tsc src/mock-server.ts --outDir dist --module commonjs --target ES2020 --esModuleInterop --skipLibCheck true --resolveJsonModule true', {
    stdio: 'inherit'
  });
  
  console.log('Build successful!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
