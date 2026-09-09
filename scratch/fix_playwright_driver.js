import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TARGET_DIR = path.join(process.env.LOCALAPPDATA, 'ms-playwright-go', '1.57.0');
console.log('Target directory:', TARGET_DIR);

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 1. Copy node.exe
const nodeExeSource = process.execPath;
const nodeExeDest = path.join(TARGET_DIR, 'node.exe');
if (!fs.existsSync(nodeExeDest)) {
  console.log(`Copying ${nodeExeSource} to ${nodeExeDest}...`);
  fs.copyFileSync(nodeExeSource, nodeExeDest);
  console.log('node.exe copied successfully.');
} else {
  console.log('node.exe already exists.');
}

// 2. Download and extract playwright-core-1.57.0.tgz
const packageDir = path.join(TARGET_DIR, 'package');
if (!fs.existsSync(path.join(packageDir, 'cli.js'))) {
  console.log('Downloading playwright-core-1.57.0.tgz from npm registry...');
  const tarballPath = path.join(TARGET_DIR, 'playwright-core.tgz');
  
  const res = await fetch('https://registry.npmjs.org/playwright-core/-/playwright-core-1.57.0.tgz');
  if (!res.ok) {
    throw new Error(`Failed to fetch tarball: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(tarballPath, buffer);
  console.log(`Downloaded ${buffer.length} bytes to ${tarballPath}. Extracting...`);

  // Extract tarball using tar (available in modern Windows powershell/cmd)
  execSync(`tar -xzf "${tarballPath}" -C "${TARGET_DIR}"`, { stdio: 'inherit' });
  console.log('Extraction complete.');

  // Clean up tarball
  fs.unlinkSync(tarballPath);
} else {
  console.log('package/cli.js already exists.');
}

// 3. Verify driver structure
console.log('\n--- Verifying Driver Structure ---');
const files = fs.readdirSync(TARGET_DIR);
console.log('Files in target dir:', files);
if (fs.existsSync(packageDir)) {
  const pkgFiles = fs.readdirSync(packageDir);
  console.log('cli.js exists in package?:', pkgFiles.includes('cli.js'));
}

// 4. Test running driver
try {
  const testOut = execSync(`"${nodeExeDest}" "${path.join(packageDir, 'cli.js')}" --version`, { encoding: 'utf-8' });
  console.log('Playwright CLI version test output:', testOut.trim());
} catch (e) {
  console.warn('Driver test note:', e.message);
}

console.log('Driver preparation finished.');
