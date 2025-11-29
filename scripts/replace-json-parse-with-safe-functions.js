/**
 * Script pour remplacer JSON.parse() par getStoredUser() et safeAPIParse()
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_DIR = path.join(__dirname, '../client');

// Patterns à remplacer
const REPLACEMENTS = [
  {
    // JSON.parse(sessionStorage.getItem('user')) ou JSON.parse(localStorage.getItem('user'))
    pattern: /JSON\.parse\s*\(\s*(sessionStorage|localStorage)\.getItem\s*\(\s*['"]user['"]\s*\)\s*(?:\s*\|\|\s*['"]null['"]\s*)?\)/g,
    replacement: (match, storage) => {
      return `(typeof getStoredUser === 'function' ? getStoredUser() : null)`;
    },
    description: 'JSON.parse(sessionStorage/localStorage.getItem("user")) → getStoredUser()'
  },
  {
    // JSON.parse(storedUser) où storedUser vient de getItem('user')
    pattern: /const\s+storedUser\s*=\s*(sessionStorage|localStorage)\.getItem\s*\(\s*['"]user['"]\s*\)\s*;?\s*const\s+user\s*=\s*JSON\.parse\s*\(\s*storedUser\s*\)/g,
    replacement: () => {
      return `const user = typeof getStoredUser === 'function' ? getStoredUser() : null`;
    },
    description: 'storedUser = getItem("user"); user = JSON.parse(storedUser) → getStoredUser()'
  },
  {
    // JSON.parse(localStorage.getItem('user') || 'null')
    pattern: /JSON\.parse\s*\(\s*(sessionStorage|localStorage)\.getItem\s*\(\s*['"]user['"]\s*\)\s*\|\|\s*['"]null['"]\s*\)/g,
    replacement: () => {
      return `(typeof getStoredUser === 'function' ? getStoredUser() : null)`;
    },
    description: 'JSON.parse(getItem("user") || "null") → getStoredUser()'
  }
];

function findFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        findFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let changes = [];

  REPLACEMENTS.forEach(({ pattern, replacement, description }) => {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      modified = modified.replace(pattern, replacement);
      changes.push({
        description,
        count: matches.length
      });
    }
  });

  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf8');
    return { file: path.relative(CLIENT_DIR, filePath), changes };
  }

  return null;
}

function main() {
  console.log('🔍 Recherche des fichiers à corriger...\n');
  
  const files = findFiles(CLIENT_DIR);
  console.log(`📁 ${files.length} fichier(s) à analyser\n`);

  const results = [];
  
  files.forEach(filePath => {
    const result = processFile(filePath);
    if (result) {
      results.push(result);
    }
  });

  if (results.length === 0) {
    console.log('✅ Aucun fichier à corriger !\n');
    return;
  }

  console.log(`✅ ${results.length} fichier(s) corrigé(s):\n`);
  
  results.forEach(({ file, changes }) => {
    console.log(`📄 ${file}`);
    changes.forEach(({ description, count }) => {
      console.log(`   ✅ ${description} (${count} occurrence(s))`);
    });
    console.log('');
  });

  console.log(`\n📊 Résumé:`);
  const totalChanges = results.reduce((sum, r) => 
    sum + r.changes.reduce((s, c) => s + c.count, 0), 0
  );
  console.log(`   ✅ ${results.length} fichier(s) modifié(s)`);
  console.log(`   📝 ${totalChanges} remplacement(s) effectué(s)`);
}

main();

