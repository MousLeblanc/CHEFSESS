import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichiers critiques à migrer en priorité
const criticalFiles = [
  'client/js/supplier-common.js',
  'client/js/group-dashboard.js',
  'client/js/foodcost-manager.js',
  'client/js/auth.js',
  'client/js/authHelper.js',
  'client/js/api/auth-api.js',
  'client/js/stock-common.js',
  'client/js/ehpad-dashboard.js',
  'client/js/supplier-dashboard.js',
  'client/js/suppliers.js',
  'client/js/notification-client.js',
  'client/js/intelligent-menu-generator.js',
  'client/js/menu-stock.js',
  'client/js/planning.js',
  'client/js/stock.js',
  'client/js/collectivite-dashboard.js',
  'client/js/index-redirect.js',
  'client/js/dashboard.js'
];

console.log('🔄 Migration vers cookies HTTP-Only...\n');

let totalChanges = 0;

criticalFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  ${filePath}: fichier introuvable`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let fileChanges = 0;
  const original = content;
  
  // 1. Supprimer localStorage.setItem('token', ...)
  const setItemMatches = content.match(/localStorage\.setItem\s*\(\s*['"]token['"]\s*,\s*[^)]+\)\s*;?/g);
  if (setItemMatches) {
    content = content.replace(
      /localStorage\.setItem\s*\(\s*['"]token['"]\s*,\s*[^)]+\)\s*;?/g,
      '// 🍪 Token stocké dans cookie HTTP-Only (géré par le backend)'
    );
    fileChanges += setItemMatches.length;
  }
  
  // 2. Supprimer localStorage.removeItem('token')
  const removeMatches = content.match(/localStorage\.removeItem\s*\(\s*['"]token['"]\s*\)\s*;?/g);
  if (removeMatches) {
    content = content.replace(
      /localStorage\.removeItem\s*\(\s*['"]token['"]\s*\)\s*;?/g,
      '// 🍪 Token supprimé via cookie (géré par le backend)'
    );
    fileChanges += removeMatches.length;
  }
  
  // 3. Remplacer const token = localStorage.getItem('token');
  const getTokenMatches = content.match(/const\s+token\s*=\s*localStorage\.getItem\s*\(\s*['"]token['"]\s*\)\s*;?/g);
  if (getTokenMatches) {
    content = content.replace(
      /const\s+token\s*=\s*localStorage\.getItem\s*\(\s*['"]token['"]\s*\)\s*;?/g,
      '// 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)'
    );
    fileChanges += getTokenMatches.length;
  }
  
  // 4. Supprimer les headers Authorization: Bearer ${token}
  const authHeaderMatches = content.match(/['"]Authorization['"]\s*:\s*`Bearer\s+\$\{[^}]+\}`/g);
  if (authHeaderMatches) {
    content = content.replace(
      /['"]Authorization['"]\s*:\s*`Bearer\s+\$\{[^}]+\}`,?\s*\n?/g,
      '// 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)\n'
    );
    fileChanges += authHeaderMatches.length;
  }
  
  // 5. Remplacer Authorization: `Bearer ${token}` (sans guillemets)
  const authHeaderMatches2 = content.match(/Authorization\s*:\s*`Bearer\s+\$\{[^}]+\}`/g);
  if (authHeaderMatches2) {
    content = content.replace(
      /Authorization\s*:\s*`Bearer\s+\$\{[^}]+\}`,?\s*\n?/g,
      '// 🍪 Authorization via cookie HTTP-Only\n'
    );
    fileChanges += authHeaderMatches2.length;
  }
  
  // 6. Vérifier que credentials: 'include' est présent dans les fetch()
  // On ne peut pas l'ajouter automatiquement car la structure peut varier
  // On va juste compter combien de fetch() il y a pour vérifier manuellement
  const fetchMatches = content.match(/fetch\s*\(/g);
  
  if (fileChanges > 0) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath}`);
    console.log(`   - ${fileChanges} modification(s)`);
    if (fetchMatches) {
      console.log(`   ⚠️  ${fetchMatches.length} fetch() trouvé(s) - vérifier que credentials: 'include' est présent\n`);
    }
    totalChanges += fileChanges;
  } else {
    console.log(`✓  ${filePath}: déjà propre`);
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Migration terminée ! ${totalChanges} modification(s) au total`);
console.log(`${'='.repeat(60)}\n`);

console.log(`📝 IMPORTANT - Actions manuelles requises :`);
console.log(`   1. Vérifier que TOUS les fetch() ont credentials: 'include'`);
console.log(`   2. Tester les connexions sur chaque dashboard`);
console.log(`   3. Vérifier la déconnexion (appel à /api/auth/logout)`);
console.log(`   4. Tester en production (Render) avec HTTPS\n`);

