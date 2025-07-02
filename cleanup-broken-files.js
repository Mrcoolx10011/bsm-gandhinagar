// cleanup-broken-files.js - Remove broken API files
import fs from 'fs';
import path from 'path';

console.log('🧹 Cleaning up broken API files...');

const filesToRemove = [
  'api/api-utils.js',
  'api/content.js',
  'api/index.js'
];

const projectRoot = process.cwd();

for (const file of filesToRemove) {
  const filePath = path.join(projectRoot, file);
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed: ${file}`);
    } else {
      console.log(`⚠️  File not found: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error removing ${file}:`, error.message);
  }
}

console.log('🎉 Cleanup completed!');
