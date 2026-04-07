const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directoryPath);

let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Convert regular strings and simple template literals
    content = content.replace(/(['"`])http:\/\/localhost:8080([^'"`]*)\1/g, "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}$2`");

    // For any remaining occurrences (like complex template strings)
    // we use a lookaround to ensure we don't replace the one we just injected:
    content = content.replace(/(?<!env\.VITE_API_BASE_URL \|\| ')http:\/\/localhost:8080/g, "${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}");

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        modifiedCount++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`Completed. Modified ${modifiedCount} files.`);
