import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichiers à migrer
const filesToMigrate = [
  'client/js/login.js',
  'client/js/auth.js',
  'client/js/authHelper.js',
  'client/js/index-redirect.js',
  'client/js/dashboard.js',
  'client/js/supplier-dashboard.js',
  'client/js/supplier-common.js',
  'client/js/group-dashboard.js',
  'client/js/ehpad-dashboard.js',
  'client/js/collectivite-dashboard.js',
  'client/js/intelligent-menu-generator.js',
  'client/js/stock-common.js',
  'client/js/suppliers.js',
  'client/js/menu-stock.js',
  'client/js/planning.js',
  'client/js/stock.js',
  'client/js/api/auth-api.js',
  'client/js/token-cleanup.js'
];

console.log('🔄 Migration localStorage → sessionStorage pour données utilisateur...\n');

let totalChanges = 0;

filesToMigrate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath}: fichier introuvable`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileChanges = 0;
  
  // Remplacer localStorage.setItem('user', ...) par sessionStorage.setItem('user', ...)
  const setUserMatches = content.match(/localStorage\.setItem\s*\(\s*['"]user['"]/g);
  if (setUserMatches) {
    content = content.replace(
      /localStorage\.setItem\s*\(\s*['"]user['"]/g,
      "sessionStorage.setItem('user'"
    );
    fileChanges += setUserMatches.length;
  }
  
  // Remplacer localStorage.getItem('user') par sessionStorage.getItem('user')
  const getUserMatches = content.match(/localStorage\.getItem\s*\(\s*['"]user['"]\s*\)/g);
  if (getUserMatches) {
    content = content.replace(
      /localStorage\.getItem\s*\(\s*['"]user['"]\s*\)/g,
      "sessionStorage.getItem('user')"
    );
    fileChanges += getUserMatches.length;
  }
  
  // Remplacer localStorage.removeItem('user') par sessionStorage.removeItem('user')
  const removeUserMatches = content.match(/localStorage\.removeItem\s*\(\s*['"]user['"]\s*\)/g);
  if (removeUserMatches) {
    content = content.replace(
      /localStorage\.removeItem\s*\(\s*['"]user['"]\s*\)/g,
      "sessionStorage.removeItem('user')"
    );
    fileChanges += removeUserMatches.length;
  }
  
  if (fileChanges > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}: ${fileChanges} modification(s)`);
    totalChanges += fileChanges;
  } else {
    console.log(`✓  ${filePath}: aucune modification nécessaire`);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ ${totalChanges} migration(s) localStorage → sessionStorage`);
console.log(`${'='.repeat(60)}\n`);

console.log(`🎯 Avantages de sessionStorage :`);
console.log(`   ✅ Isolé par ONGLET (pas de conflit entre fournisseur/site)`);
console.log(`   ✅ Supprimé automatiquement à la fermeture de l'onglet`);
console.log(`   ✅ Plus sécurisé que localStorage`);

