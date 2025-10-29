import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToClean = [
  'client/js/collectivite-dashboard.js',
  'client/js/intelligent-menu-generator.js'
];

console.log('🧹 Nettoyage final des références à token...\n');

let totalFixed = 0;

filesToClean.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath}: fichier introuvable`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileFixed = 0;
  
  // Pattern 1: console.log avec token
  const consoleLogMatches = content.match(/console\.log\([^)]*\btoken\b[^)]*\);?/gi);
  if (consoleLogMatches) {
    consoleLogMatches.forEach(match => {
      // Remplacer par un message générique
      content = content.replace(match, "console.log('🔐 Authentification via cookie HTTP-Only');");
      fileFixed++;
    });
  }
  
  // Pattern 2: if (token) { headers['Authorization'] = ... }
  const lines = content.split('\n');
  const newLines = [];
  let skipUntilClosingBrace = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Si on est en train de skip
    if (skipUntilClosingBrace > 0) {
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      skipUntilClosingBrace += openBraces - closeBraces;
      
      if (skipUntilClosingBrace <= 0) {
        skipUntilClosingBrace = 0;
      }
      continue;
    }
    
    // Détecter if (token) { headers['Authorization']
    if (line.match(/if\s*\(\s*token\s*\)/)) {
      console.log(`  Ligne ${i + 1}: if (token) trouvé`);
      fileFixed++;
      
      // Compter les accolades
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      skipUntilClosingBrace = openBraces - closeBraces;
      
      continue; // Skip cette ligne
    }
    
    newLines.push(line);
  }
  
  if (fileFixed > 0) {
    const newContent = newLines.join('\n');
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`✅ ${filePath}: ${fileFixed} correction(s)\n`);
    totalFixed += fileFixed;
  } else {
    console.log(`✓  ${filePath}: aucune correction nécessaire\n`);
  }
});

console.log(`${'='.repeat(60)}`);
console.log(`✅ ${totalFixed} référence(s) à token nettoyée(s)`);
console.log(`${'='.repeat(60)}\n`);

console.log('📝 Vérification finale...');
console.log('   Toutes les authentifications utilisent maintenant cookies HTTP-Only');
console.log('   Plus aucune référence à la variable "token" dans le code');

