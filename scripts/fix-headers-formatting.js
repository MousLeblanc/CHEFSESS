import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToFix = [
  'client/js/group-dashboard.js',
  'client/js/collectivite-dashboard.js',
  'client/js/stock.js',
  'client/js/stock-common.js'
];

console.log('🔧 Correction du formatage des headers...\n');

let totalFixed = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath}: fichier introuvable`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileFixed = 0;
  
  // Pattern: ligne avec commentaire suivie de 'Content-Type' sans indentation
  // Chercher: headers: {\n    // commentaire\n'Content-Type'
  
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // Si la ligne actuelle est un commentaire et la suivante commence par 'Content-Type' sans indentation
    if (line.trim().startsWith('//') && nextLine && nextLine.match(/^['"]Content-Type['"]/)) {
      // Récupérer l'indentation du commentaire
      const indent = line.match(/^(\s*)/)[1];
      
      // Ajouter la ligne actuelle (commentaire)
      newLines.push(line);
      
      // Corriger la ligne suivante avec la bonne indentation
      newLines.push(indent + nextLine.trim());
      
      console.log(`  Ligne ${i + 2}: Correction indentation 'Content-Type'`);
      fileFixed++;
      i++; // Skip la ligne suivante car on l'a déjà traitée
      continue;
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
console.log(`✅ ${totalFixed} correction(s) d'indentation`);
console.log(`${'='.repeat(60)}\n`);

