/**
 * Script pour vérifier que toutes les requêtes POST/PUT/DELETE utilisent fetchWithCSRF
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossiers à analyser
const DIRECTORIES = [
  path.join(__dirname, '../client/js'),
  path.join(__dirname, '../client')
];

// Extensions de fichiers à analyser
const EXTENSIONS = ['.js', '.html'];

// Méthodes HTTP à vérifier
const METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'];

// Patterns pour détecter les problèmes
const PATTERNS = {
  // Détecter fetch() avec method POST/PUT/DELETE
  fetchWithMethod: /fetch\s*\([^)]*method\s*:\s*['"](POST|PUT|DELETE|PATCH)['"]/is,
  // Détecter fetch() suivi de method dans les options
  fetchWithOptions: /fetch\s*\([^)]*\{[^}]*method\s*:\s*['"](POST|PUT|DELETE|PATCH)['"]/is,
  // Détecter l'utilisation de fetchWithCSRF
  fetchWithCSRF: /fetchWithCSRF|fetchFn.*fetchWithCSRF|window\.fetchWithCSRF/is,
  // Détecter la déclaration de fetchFn avec fetchWithCSRF
  fetchFnDeclaration: /const\s+fetchFn\s*=.*fetchWithCSRF|let\s+fetchFn\s*=.*fetchWithCSRF|var\s+fetchFn\s*=.*fetchWithCSRF/is
};

function findFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer node_modules et autres dossiers non pertinents
      if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
        findFiles(filePath, fileList);
      }
    } else if (EXTENSIONS.some(ext => file.endsWith(ext))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  // Chercher toutes les occurrences de fetch() avec POST/PUT/DELETE
  const fetchRegex = /fetch\s*\(/g;
  let match;
  
  while ((match = fetchRegex.exec(content)) !== null) {
    const startPos = match.index;
    const lineNum = content.substring(0, startPos).split('\n').length;
    const line = lines[lineNum - 1];
    
    // Extraire le contexte autour de l'appel fetch (50 caractères avant et après)
    const contextStart = Math.max(0, startPos - 200);
    const contextEnd = Math.min(content.length, startPos + 500);
    const context = content.substring(contextStart, contextEnd);
    
    // Vérifier si c'est une requête POST/PUT/DELETE
    const hasMethod = METHODS.some(method => {
      const methodRegex = new RegExp(`method\\s*:\\s*['"]${method}['"]`, 'i');
      return methodRegex.test(context);
    });
    
    if (!hasMethod) {
      continue; // Ce n'est pas une requête POST/PUT/DELETE
    }
    
    // Vérifier si fetchWithCSRF est utilisé
    // Chercher dans les 20 lignes précédentes
    const lineStart = Math.max(0, lineNum - 20);
    const beforeContext = lines.slice(lineStart, lineNum - 1).join('\n');
    
    const usesFetchWithCSRF = 
      PATTERNS.fetchWithCSRF.test(beforeContext) ||
      PATTERNS.fetchFnDeclaration.test(beforeContext) ||
      /fetchFn\s*\(/.test(context);
    
    if (!usesFetchWithCSRF) {
      // Vérifier si c'est dans un commentaire ou une chaîne
      const lineBeforeMatch = content.substring(0, startPos).lastIndexOf('\n');
      const lineContent = content.substring(lineBeforeMatch + 1, startPos + 100);
      
      // Ignorer si c'est dans un commentaire
      if (lineContent.trim().startsWith('//') || lineContent.trim().startsWith('*')) {
        continue;
      }
      
      issues.push({
        line: lineNum,
        content: line.trim(),
        context: context.substring(0, 300)
      });
    }
  }
  
  return issues;
}

function main() {
  console.log('🔍 Vérification de la protection CSRF...\n');
  
  const allFiles = [];
  DIRECTORIES.forEach(dir => {
    const files = findFiles(dir);
    allFiles.push(...files);
  });
  
  console.log(`📁 ${allFiles.length} fichier(s) à analyser\n`);
  
  const allIssues = [];
  
  allFiles.forEach(filePath => {
    const issues = analyzeFile(filePath);
    if (issues.length > 0) {
      allIssues.push({
        file: path.relative(process.cwd(), filePath),
        issues
      });
    }
  });
  
  if (allIssues.length === 0) {
    console.log('✅ Toutes les requêtes POST/PUT/DELETE utilisent fetchWithCSRF !\n');
    return;
  }
  
  console.log(`⚠️  ${allIssues.length} fichier(s) avec des problèmes détectés:\n`);
  
  allIssues.forEach(({ file, issues }) => {
    console.log(`📄 ${file}`);
    console.log(`   ${issues.length} problème(s) trouvé(s):\n`);
    
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. Ligne ${issue.line}:`);
      console.log(`      ${issue.content.substring(0, 100)}${issue.content.length > 100 ? '...' : ''}`);
      console.log(`      Contexte: ${issue.context.substring(0, 150)}...`);
      console.log('');
    });
    
    console.log('');
  });
  
  console.log(`\n📊 Résumé:`);
  console.log(`   ⚠️  ${allIssues.length} fichier(s) avec problèmes`);
  console.log(`   📝 ${allIssues.reduce((sum, f) => sum + f.issues.length, 0)} requête(s) POST/PUT/DELETE sans fetchWithCSRF`);
  console.log(`\n💡 Solution: Remplacer fetch() par fetchWithCSRF() ou utiliser:`);
  console.log(`   const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;`);
  console.log(`   fetchFn(url, { method: 'POST', ... });`);
  
  process.exit(allIssues.length > 0 ? 1 : 0);
}

main();

