import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToCheck = [
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
  'client/js/dashboard.js',
  'client/js/login.js'
];

console.log('🔍 Vérification credentials: "include"...\n');

let totalFetch = 0;
let totalWithCredentials = 0;
let filesNeedingFix = [];

filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  // Chercher les fetch() et vérifier si credentials: 'include' est présent dans les 10 lignes suivantes
  let fetchCount = 0;
  let credentialsCount = 0;
  const fetchLinesWithoutCredentials = [];
  
  lines.forEach((line, index) => {
    if (line.match(/fetch\s*\(/)) {
      fetchCount++;
      totalFetch++;
      
      // Chercher credentials: 'include' dans les 15 prochaines lignes
      const nextLines = lines.slice(index, index + 15).join('\n');
      if (nextLines.match(/credentials\s*:\s*['"]include['"]/)) {
        credentialsCount++;
        totalWithCredentials++;
      } else {
        fetchLinesWithoutCredentials.push(index + 1);
      }
    }
  });
  
  if (fetchCount > 0) {
    if (credentialsCount === fetchCount) {
      console.log(`✅ ${filePath}: ${fetchCount}/${fetchCount} fetch() avec credentials`);
    } else {
      console.log(`⚠️  ${filePath}: ${credentialsCount}/${fetchCount} fetch() avec credentials`);
      console.log(`   Lignes sans credentials: ${fetchLinesWithoutCredentials.join(', ')}`);
      filesNeedingFix.push({ file: filePath, lines: fetchLinesWithoutCredentials });
    }
  }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`📊 Résumé: ${totalWithCredentials}/${totalFetch} fetch() avec credentials: 'include'`);
console.log(`${'='.repeat(60)}\n`);

if (filesNeedingFix.length > 0) {
  console.log(`⚠️  ${filesNeedingFix.length} fichier(s) nécessite(nt) des corrections :\n`);
  filesNeedingFix.forEach(({ file, lines }) => {
    console.log(`   ${file}`);
    console.log(`   Lignes: ${lines.join(', ')}\n`);
  });
} else {
  console.log(`✅ Tous les fetch() ont credentials: 'include' !`);
}

