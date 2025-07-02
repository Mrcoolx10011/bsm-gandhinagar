// Restore frontend components to use original API endpoints
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Restoring original API routes in frontend components...');

// Define the root of the project
const projectRoot = path.resolve(__dirname);
const srcDir = path.join(projectRoot, 'src');

// Define route mappings to restore original routes
const apiMappings = {
  // Restore original endpoints
  '/api/api-utils?type=hello': '/api/hello',
  '/api/api-utils?type=simple-check': '/api/simple-check',
  '/api/api-utils?type=test': '/api/test',
  '/api/api-utils?type=test-cjs': '/api/test-cjs',
  '/api/api-utils?type=env-check': '/api/debug/env-check',
  
  // Restore content endpoints
  '/api/content/posts': '/api/posts',
  '/api/content/recent-activities': '/api/recent-activities',
};

// Function to recursively search files and update API routes
function updateApiRoutes(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      updateApiRoutes(fullPath);
    } else if (stats.isFile() && 
              (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js'))) {
      
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Check for API routes and replace them
      for (const [oldRoute, newRoute] of Object.entries(apiMappings)) {
        const regex = new RegExp(`(['"\`])${oldRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(['"\`])`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `$1${newRoute}$2`);
          modified = true;
        }
      }
      
      // Save the file if it was modified
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`✅ Restored API routes in: ${fullPath}`);
      }
    }
  }
}

try {
  updateApiRoutes(srcDir);
  console.log('🎉 API route restoration completed successfully!');
} catch (error) {
  console.error('❌ Error restoring API routes:', error);
}
