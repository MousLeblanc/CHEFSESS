// scripts/check-csrf-protection.js
// Script pour vérifier que toutes les requêtes POST/PUT/DELETE utilisent fetchWithCSRF

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.join(__dirname, '..', 'client');

// Fichiers à ignorer
const ignoreFiles = [
  'node_modules',
  '.git',
  'csrf-helper.js', // Le fichier qui définit fetchWithCSRF
  'common.js' // Peut contenir des helpers
];

// Trouver tous les fichiers JS et HTML dans client
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!ignoreFiles.includes(file)) {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Analyser un fichier pour trouver les requêtes POST/PUT/DELETE sans fetchWithCSRF
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  // Patterns pour détecter les requêtes POST/PUT/DELETE
  const methodPattern = /method:\s*['"](POST|PUT|DELETE|PATCH)['"]/i;
  const fetchPattern = /fetch\s*\(/;
  const fetchWithCSRFPattern = /fetchWithCSRF|fetchFn.*fetchWithCSRF/i;
  
  let inFetchCall = false;
  let fetchLine = -1;
  let methodLine = -1;
  let hasFetchWithCSRF = false;
  let fetchContext = '';
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Détecter si on est dans un appel fetch
    if (fetchPattern.test(line) && !fetchWithCSRFPattern.test(line)) {
      inFetchCall = true;
      fetchLine = lineNum;
      fetchContext = line.trim();
      hasFetchWithCSRF = false;
      
      // Vérifier si fetchWithCSRF est utilisé avant
      const beforeContext = lines.slice(Math.max(0, index - 5), index).join('\n');
      if (fetchWithCSRFPattern.test(beforeContext)) {
        hasFetchWithCSRF = true;
      }
    }
    
    // Détecter la méthode dans le contexte du fetch
    if (inFetchCall && methodPattern.test(line)) {
      methodLine = lineNum;
      const methodMatch = line.match(methodPattern);
      const method = methodMatch ? methodMatch[1].toUpperCase() : '';
      
      // Vérifier si fetchWithCSRF est utilisé dans les lignes précédentes (jusqu'à 10 lignes avant)
      const contextStart = Math.max(0, index - 10);
      const context = lines.slice(contextStart, index + 1).join('\n');
      
      if (!fetchWithCSRFPattern.test(context)) {
        issues.push({
          file: path.relative(clientDir, filePath),
          line: fetchLine,
          method: method,
          context: fetchContext.substring(0, 100),
          methodLine: methodLine
        });
      }
      
      inFetchCall = false;
      fetchLine = -1;
      methodLine = -1;
    }
    
    // Réinitialiser si on sort du contexte fetch (détection de fermeture)
    if (inFetchCall && line.includes('});') && methodLine === -1) {
      inFetchCall = false;
      fetchLine = -1;
    }
  });
  
  return issues;
}

// Fonction principale
function checkCSRFProtection() {
  console.log('🔍 Vérification de la protection CSRF...\n');
  
  const files = findFiles(clientDir);
  console.log(`📁 ${files.length} fichiers à analyser\n`);
  
  const allIssues = [];
  
  files.forEach(file => {
    const issues = analyzeFile(file);
    if (issues.length > 0) {
      allIssues.push(...issues);
    }
  });
  
  // Grouper par fichier
  const issuesByFile = {};
  allIssues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });
  
  // Afficher les résultats
  if (allIssues.length === 0) {
    console.log('✅ Toutes les requêtes POST/PUT/DELETE utilisent fetchWithCSRF !');
  } else {
    console.log(`⚠️  ${allIssues.length} requête(s) POST/PUT/DELETE trouvée(s) sans fetchWithCSRF :\n`);
    
    Object.keys(issuesByFile).forEach(file => {
      console.log(`\n📄 ${file}:`);
      issuesByFile[file].forEach(issue => {
        console.log(`   Ligne ${issue.line}: ${issue.method} - ${issue.context}`);
      });
    });
    
    console.log(`\n📊 Résumé:`);
    console.log(`   Total: ${allIssues.length} requête(s) à corriger`);
    console.log(`   Fichiers concernés: ${Object.keys(issuesByFile).length}`);
    
    // Compter par méthode
    const byMethod = {};
    allIssues.forEach(issue => {
      byMethod[issue.method] = (byMethod[issue.method] || 0) + 1;
    });
    
    console.log(`\n   Par méthode:`);
    Object.keys(byMethod).forEach(method => {
      console.log(`     ${method}: ${byMethod[method]}`);
    });
  }
  
  return allIssues;
}

// Exécuter
const issues = checkCSRFProtection();
process.exit(issues.length > 0 ? 1 : 0);

