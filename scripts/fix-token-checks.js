import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichiers à corriger
const filesToFix = [
  'client/js/collectivite-dashboard.js',
  'client/js/group-dashboard.js',
  'client/js/auth.js',
  'client/js/stock.js',
  'client/js/stock-common.js',
  'client/js/settings.js',
  'client/js/api/auth-api.js'
];

console.log('🔧 Suppression des vérifications if (!token)...\n');

let totalFixed = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath}: fichier introuvable`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileFixed = 0;
  
  // Pattern 1: if (!token) { ... return; }
  // On doit être intelligent pour ne pas casser le code
  
  // Chercher les patterns courants
  const lines = content.split('\n');
  const newLines = [];
  let skipUntilClosingBrace = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Si on est en train de skip
    if (skipUntilClosingBrace > 0) {
      // Compter les accolades
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      skipUntilClosingBrace += openBraces - closeBraces;
      
      if (skipUntilClosingBrace <= 0) {
        skipUntilClosingBrace = 0;
        // Ajouter un commentaire à la place
        const indent = lines[i - 1]?.match(/^(\s*)/)?.[1] || '    ';
        newLines.push(`${indent}// 🍪 Token géré via cookie HTTP-Only (authentification automatique)`);
      }
      continue;
    }
    
    // Détecter if (!token) ou if (!localStorage.getItem('token'))
    if (line.match(/if\s*\(\s*!token\s*\)/)) {
      console.log(`  Ligne ${i + 1}: if (!token) trouvé`);
      fileFixed++;
      
      // Compter les accolades ouvrantes dans cette ligne et les suivantes
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
    console.log(`✅ ${filePath}: ${fileFixed} suppression(s)\n`);
    totalFixed += fileFixed;
  } else {
    console.log(`✓  ${filePath}: aucune modification nécessaire\n`);
  }
});

console.log(`${'='.repeat(60)}`);
console.log(`✅ ${totalFixed} vérification(s) if (!token) supprimée(s)`);
console.log(`${'='.repeat(60)}\n`);

console.log(`📝 Rappel:`);
console.log(`   - L'authentification est maintenant gérée via cookies HTTP-Only`);
console.log(`   - Vérifier que sessionStorage.getItem('user') existe au lieu de token`);
console.log(`   - Tous les fetch() doivent avoir credentials: 'include'`);

