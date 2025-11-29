// client/js/supplier-barcode-lookup.js
// Fonction pour rechercher un produit par code-barres dans le formulaire fournisseur

// Activer/désactiver le champ label type selon la checkbox
document.addEventListener('DOMContentLoaded', () => {
    const hasLabelCheckbox = document.getElementById('traceability-has-label');
    const labelTypeSelect = document.getElementById('traceability-label-type');
    
    if (hasLabelCheckbox && labelTypeSelect) {
        hasLabelCheckbox.addEventListener('change', (e) => {
            labelTypeSelect.disabled = !e.target.checked;
            if (!e.target.checked) {
                labelTypeSelect.value = '';
            }
        });
    }
});

// Fonction pour rechercher un produit par code-barres
// Définir la fonction globalement pour qu'elle soit accessible depuis onclick
async function lookupProductByBarcode() {
    const barcodeInput = document.getElementById('product-barcode');
    const barcode = barcodeInput?.value.trim();
    const resultDiv = document.getElementById('barcode-lookup-result');
    
    if (!barcodeInput || !resultDiv) {
        console.warn('Éléments du formulaire code-barres non trouvés');
        return;
    }
    
    if (!barcode || barcode.length < 8) {
        alert('Veuillez saisir un code-barres valide (minimum 8 chiffres)');
        return;
    }
    
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recherche en cours...';
    resultDiv.style.background = '#fff3cd';
    resultDiv.style.borderLeftColor = '#ffc107';
    
    try {
        const response = await fetch(`/api/barcode/${barcode}`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            // Remplir automatiquement les champs
            const product = data.data;
            
            if (product.name && document.getElementById('product-name')) {
                document.getElementById('product-name').value = product.name;
            }
            
            // Sauvegarder l'imageUrl dans un champ caché pour l'enregistrement
            if (product.imageUrl) {
                // Créer un champ caché pour stocker l'imageUrl
                let imageUrlInput = document.getElementById('product-image-url');
                if (!imageUrlInput) {
                    imageUrlInput = document.createElement('input');
                    imageUrlInput.type = 'hidden';
                    imageUrlInput.id = 'product-image-url';
                    document.getElementById('add-product-form').appendChild(imageUrlInput);
                }
                imageUrlInput.value = product.imageUrl;
            }
            if (product.originCountries) {
                const country = product.originCountries.split(',')[0].trim();
                if (document.getElementById('traceability-country')) {
                    document.getElementById('traceability-country').value = country;
                }
            } else if (product.manufacturingPlaces) {
                const place = product.manufacturingPlaces.split(',')[0].trim();
                if (document.getElementById('traceability-country')) {
                    document.getElementById('traceability-country').value = place;
                }
            }
            if (product.commercialPresentation && document.getElementById('traceability-presentation')) {
                document.getElementById('traceability-presentation').value = product.commercialPresentation;
            }
            if (product.qualityLabels && product.qualityLabels.hasLabel) {
                if (document.getElementById('traceability-has-label')) {
                    document.getElementById('traceability-has-label').checked = true;
                }
                if (document.getElementById('traceability-label-type')) {
                    document.getElementById('traceability-label-type').disabled = false;
                    if (product.qualityLabels.labelType) {
                        document.getElementById('traceability-label-type').value = product.qualityLabels.labelType;
                    }
                }
            }
            if (product.categories && document.getElementById('traceability-category')) {
                document.getElementById('traceability-category').value = product.categories.split(',')[0].trim();
            }
            
            // Afficher le score Yuka si disponible
            let yukaInfo = '';
            if (product.yukaScore) {
                const yuka = product.yukaScore;
                yukaInfo = `
                    <div style="margin-top: 0.75rem; padding: 0.75rem; background: ${yuka.color}20; border-left: 3px solid ${yuka.color}; border-radius: 4px;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.5rem; font-weight: bold; color: ${yuka.color};">${yuka.score}</span>
                            <span style="color: ${yuka.color}; font-weight: bold;">/100</span>
                            <span style="color: #7f8c8d; font-size: 0.9rem;">(${yuka.label})</span>
                        </div>
                        <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #555;">
                            <i class="fas fa-heart"></i> Score nutritionnel Yuka
                        </div>
                        ${yuka.details?.additives?.badAdditives?.length > 0 ? `
                            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #e74c3c;">
                                <i class="fas fa-exclamation-triangle"></i> ${yuka.details.additives.badAdditives.length} additif(s) problématique(s): ${yuka.details.additives.badAdditives.slice(0, 5).join(', ')}${yuka.details.additives.badAdditives.length > 5 ? '...' : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
            
            // Afficher les additifs même si le score Yuka n'est pas disponible
            let additivesInfo = '';
            if (product.additives && product.additives.count > 0) {
                const additives = product.additives;
                additivesInfo = `
                    <div style="margin-top: 0.75rem; padding: 0.75rem; background: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px;">
                        <div style="font-weight: bold; color: #856404; margin-bottom: 0.5rem;">
                            <i class="fas fa-flask"></i> Additifs détectés (${additives.count})
                        </div>
                        <div style="font-size: 0.85rem; color: #856404;">
                            ${additives.list && additives.list.length > 0 ? 
                                additives.list.slice(0, 10).join(', ') + (additives.list.length > 10 ? '...' : '') :
                                additives.text || 'Additifs présents'
                            }
                        </div>
                    </div>
                `;
            }
            
            // Afficher l'image si disponible
            let imageInfo = '';
            if (product.imageUrl) {
                imageInfo = `
                    <div style="margin-top: 0.75rem; text-align: center;">
                        <img src="${product.imageUrl}" alt="${product.name || 'Produit'}" 
                             style="max-width: 150px; max-height: 150px; border-radius: 8px; border: 2px solid #ddd;">
                    </div>
                `;
            }
            
            // Afficher le Nutri-Score si disponible
            let nutriScoreInfo = '';
            if (product.nutritionGrade) {
                const nutriColors = {
                    'a': '#27ae60', 'b': '#2ecc71', 'c': '#f1c40f', 
                    'd': '#f39c12', 'e': '#e74c3c'
                };
                const nutriColor = nutriColors[product.nutritionGrade.toLowerCase()] || '#7f8c8d';
                nutriScoreInfo = `
                    <div style="margin-top: 0.75rem; padding: 0.75rem; background: ${nutriColor}20; border-left: 3px solid ${nutriColor}; border-radius: 4px;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.5rem; font-weight: bold; color: ${nutriColor}; text-transform: uppercase;">${product.nutritionGrade}</span>
                            <span style="color: #7f8c8d; font-size: 0.9rem;">Nutri-Score</span>
                        </div>
                    </div>
                `;
            }
            
            resultDiv.style.background = '#d5f4e6';
            resultDiv.style.borderLeftColor = '#27ae60';
            resultDiv.innerHTML = `
                <strong style="color: #27ae60;">✅ Produit trouvé !</strong><br>
                ${imageInfo}
                <div style="margin-top: 0.5rem; font-size: 0.9rem;">
                    <strong>${product.name || 'Produit'}</strong><br>
                    ${product.brand ? `Marque: ${product.brand}<br>` : ''}
                    ${product.originCountries ? `Origine: ${product.originCountries}<br>` : ''}
                    ${product.qualityLabels?.hasLabel ? `Label: ${product.qualityLabels.labelType}<br>` : ''}
                </div>
                ${nutriScoreInfo}
                ${yukaInfo}
                ${additivesInfo}
                <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #7f8c8d;">
                    <i class="fas fa-check-circle"></i> Informations pré-remplies automatiquement
                </div>
            `;
        } else {
            resultDiv.style.background = '#fadbd8';
            resultDiv.style.borderLeftColor = '#e74c3c';
            resultDiv.innerHTML = `
                <strong style="color: #e74c3c;">❌ Produit non trouvé</strong><br>
                <div style="margin-top: 0.5rem; font-size: 0.85rem;">
                    Le code-barres ${barcode} n'a pas été trouvé dans la base de données Open Food Facts.
                    <br>Vous pouvez remplir les informations manuellement.
                </div>
            `;
        }
    } catch (error) {
        console.error('Erreur lors de la recherche:', error);
        resultDiv.style.background = '#fadbd8';
        resultDiv.style.borderLeftColor = '#e74c3c';
        resultDiv.innerHTML = `
            <strong style="color: #e74c3c;">❌ Erreur</strong><br>
            <div style="margin-top: 0.5rem; font-size: 0.85rem;">
                Erreur lors de la recherche: ${error.message}
            </div>
        `;
    }
}

// Exporter aussi sur window pour compatibilité
window.lookupProductByBarcode = lookupProductByBarcode;

