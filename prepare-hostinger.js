const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_DIR = 'hostinger_deploy';

// Helper to copy recursively
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();

    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

// 1. Clean previous build
console.log('🧹 Cleaning previous deployment folder...');
if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BUILD_DIR);

// 2. Build Next.js
console.log('🏗️  Building Next.js app...');
try {
    execSync('npm run build', { stdio: 'inherit' });
} catch (e) {
    console.error('❌ Build failed. Stopping deployment preparation.');
    process.exit(1);
}

// 3. Copy .next folder
console.log('📂 Copying .next folder...');
copyRecursiveSync('.next', path.join(BUILD_DIR, '.next'));

// 4. Copy public folder CONTENTS to root (Flattening public)
console.log('📂 Copying public folder contents to root...');
copyRecursiveSync('public', BUILD_DIR);

// 5. Copy essential root files
console.log('📄 Copying config files...');
const rootFiles = [
    'server.js',
    'package.json',
    '.env.local',
    'next.config.mjs'
];

rootFiles.forEach(file => {
    if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(BUILD_DIR, file));
    } else {
        console.warn(`⚠️  Warning: ${file} not found.`);
    }
});

// 6. Specific fix for messages (next-intl)
console.log('🌍 Copying translation messages...');
if (fs.existsSync('messages')) {
    copyRecursiveSync('messages', path.join(BUILD_DIR, 'messages'));
}

console.log('✅ Hostinger deployment package check!');
console.log(`🚀 Your files are ready in the "${BUILD_DIR}" folder.`);
console.log('👉 ACTION: Zip the CONTENTS of "hostinger_deploy" and upload to Hostinger.');
