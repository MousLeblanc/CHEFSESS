import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToFix = [
  'client/js/group-dashboard.js',
  'client/js/foodcost-manager.js',
  'client/js/auth.js',
  'client/js/api/auth-api.js',
  'client/js/stock-common.js',
  'client/js/supplier-dashboard.js',
  'client/js/suppliers.js',
  'client/js/intelligent-menu-generator.js',
  'client/js/menu-stock.js',
  'client/js/planning.js',
  'client/js/stock.js',
  'client/js/collectivite-dashboard.js'
];

console.log('🔧 Ajout de credentials: "include" aux fetch()...\n');

let totalFixed = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileFixed = 0;
  
  // Regex pour trouver fetch() avec des options (headers, method, etc.) mais sans credentials
  // Pattern: fetch('...', { ... }) où il n'y a pas de credentials dans les options
  
  // Stratégie: Chercher les patterns courants
  
  // Pattern 1: fetch(..., { method: '...', headers: { ... } })
  // On ajoute credentials juste après l'accolade ouvrante ou après method
  
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Détecter fetch(
    if (line.match(/fetch\s*\(/)) {
      // Vérifier si credentials est déjà présent dans les 15 prochaines lignes
      const nextLinesStr = lines.slice(i, i + 15).join('\n');
      const hasCredentials = nextLinesStr.match(/credentials\s*:\s*['"]include['"]/);
      
      if (!hasCredentials) {
        // Chercher la ligne avec method: ou headers:
        let foundOptionsStart = false;
        
        for (let j = i; j < Math.min(i + 15, lines.length); j++) {
          const currentLine = lines[j];
          
          // Si on trouve method: ou headers:, on ajoute credentials juste avant
          if (currentLine.match(/(method|headers)\s*:/) && !foundOptionsStart) {
            // Extraire l'indentation
            const indent = currentLine.match(/^(\s*)/)[1];
            newLines.push(line);
            
            // Insérer credentials avant method/headers
            newLines.push(`${indent}credentials: 'include', // 🍪 Cookie HTTP-Only`);
            fileFixed++;
            totalFixed++;
            
            // Copier les lignes suivantes jusqu'à j (non inclus)
            for (let k = i + 1; k < j; k++) {
              newLines.push(lines[k]);
            }
            
            // Sauter jusqu'à j-1 car on va reprendre à j
            i = j - 1;
            foundOptionsStart = true;
            break;
          }
        }
        
        if (!foundOptionsStart) {
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }
  
  if (fileFixed > 0) {
    const newContent = newLines.join('\n');
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`✅ ${filePath}: ${fileFixed} ajout(s)`);
  } else {
    console.log(`✓  ${filePath}: aucun ajout nécessaire`);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ ${totalFixed} credentials: 'include' ajouté(s)`);
console.log(`${'='.repeat(60)}\n`);
console.log(`📝 Relancer check-credentials-include.js pour vérifier`);

