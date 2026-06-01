const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === 'dist') return;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else {
      if (file.endsWith('.js') || file.endsWith('.cjs') || file.endsWith('.json') || file.endsWith('.env') || file.endsWith('.ts') || file.endsWith('.sql')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('password') || content.includes('postgresql://') || content.includes('postgres://') || content.includes('service_role')) {
          console.log(`Found possible secret in: ${fullPath}`);
          // Print matching lines
          const lines = content.split('\n');
          lines.forEach((l, i) => {
            if (l.includes('password') || l.includes('postgresql://') || l.includes('postgres://') || l.includes('service_role')) {
              console.log(`  Line ${i+1}: ${l.trim().slice(0, 100)}`);
            }
          });
        }
      }
    }
  });
}

searchDir('C:\\Users\\panka\\.gemini\\antigravity\\scratch\\jankam-v1-master');
