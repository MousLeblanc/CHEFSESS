// Script pour vérifier la configuration Render
console.log('🔍 Vérification de la configuration Render...\n');

console.log('Variables d\'environnement:');
console.log('  - RENDER_SERVICE_ID:', process.env.RENDER_SERVICE_ID || 'non défini');
console.log('  - RENDER:', process.env.RENDER || 'non défini');
console.log('  - NODE_ENV:', process.env.NODE_ENV || 'non défini');
console.log('  - PORT:', process.env.PORT || 'non défini');

const isRender = process.env.RENDER_SERVICE_ID || 
                 process.env.RENDER === 'true' || 
                 process.env.NODE_ENV === 'production';

console.log('\n📊 Configuration détectée:');
console.log('  - isRender:', isRender);
console.log('  - Cookie secure:', isRender);
console.log('  - Cookie sameSite:', isRender ? 'none' : 'lax');

console.log('\n✅ Configuration correcte pour Render:', isRender ? 'OUI' : 'NON');

