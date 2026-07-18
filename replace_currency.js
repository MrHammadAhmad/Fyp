const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/\(\$\)/g, '(Rs)')
    .replace(/\(\$\$\)/g, '(Rs Rs)')
    .replace(/\(\$\$\$\)/g, '(Rs Rs Rs)')
    .replace(/Price \(\$\)/g, 'Price (Rs)')
    .replace(/Amount \(\$\)/g, 'Amount (Rs)')
    .replace(/Value \(\$\)/g, 'Value (Rs)')
    .replace(/fee \(\$\)/g, 'fee (Rs)')
    .replace(/>\$/g, '>Rs. ')
    .replace(/"\$/g, '"Rs. ')
    .replace(/> \$/g, '> Rs. ');
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Updated', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir('Frontend/FrontedReactjs/src');
