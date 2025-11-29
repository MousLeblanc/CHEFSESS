// client/js/quality-badges.js
// Gestion des badges de qualité sur la page d'accueil

/**
 * Charge et affiche les statuts des badges de qualité
 */
async function loadQualityBadges() {
  try {
    // Récupérer l'utilisateur connecté
    const userResponse = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    if (!userResponse.ok) {
      console.warn('⚠️ Impossible de récupérer les informations utilisateur');
      return;
    }
    
    const userData = await userResponse.json();
    const user = userData.user || userData;
    
    // Vérifier l'équilibre nutritionnel
    if (user.groupId || user.siteId) {
      await updateNutritionalBalanceBadge(user.groupId, user.siteId);
      await updateAVIQComplianceBadge(user.groupId, user.siteId);
      await updateAnnexe120ComplianceBadge(user.groupId, user.siteId);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du chargement des badges de qualité:', error);
  }
}

/**
 * Met à jour le badge d'équilibre nutritionnel
 */
async function updateNutritionalBalanceBadge(groupId, siteId) {
  const statusElement = document.getElementById('nutritional-balance-status');
  if (!statusElement) return;
  
  try {
    const queryParams = new URLSearchParams();
    if (groupId) queryParams.append('groupId', groupId);
    if (siteId) queryParams.append('siteId', siteId);
    
    const response = await fetch(`/api/nutritional-balance?${queryParams.toString()}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      statusElement.innerHTML = '<i class="fas fa-question-circle"></i> Non disponible';
      return;
    }
    
    const data = await response.json();
    
    if (data.groups && Object.keys(data.groups).length > 0) {
      const allBalanced = Object.values(data.groups).every(g => g.balance.balanced);
      const avgScore = Object.values(data.groups)
        .reduce((sum, g) => sum + (g.balance.score || 0), 0) / Object.keys(data.groups).length;
      
      if (allBalanced && avgScore >= 0.8) {
        statusElement.innerHTML = `
          <i class="fas fa-check-circle"></i> 
          <span>Conforme (${(avgScore * 100).toFixed(0)}%)</span>
        `;
        statusElement.style.background = 'rgba(16, 185, 129, 0.3)';
      } else {
        statusElement.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i> 
          <span>À améliorer (${(avgScore * 100).toFixed(0)}%)</span>
        `;
        statusElement.style.background = 'rgba(245, 158, 11, 0.3)';
      }
    } else {
      statusElement.innerHTML = '<i class="fas fa-info-circle"></i> Aucun menu récent';
    }
    
  } catch (error) {
    console.error('❌ Erreur updateNutritionalBalanceBadge:', error);
    statusElement.innerHTML = '<i class="fas fa-question-circle"></i> Erreur';
  }
}

/**
 * Met à jour le badge de conformité AVIQ
 */
async function updateAVIQComplianceBadge(groupId, siteId) {
  const statusElement = document.getElementById('aviq-compliance-status');
  if (!statusElement) return;
  
  try {
    const queryParams = new URLSearchParams();
    if (groupId) queryParams.append('groupId', groupId);
    if (siteId) queryParams.append('siteId', siteId);
    
    const response = await fetch(`/api/compliance/aviq?${queryParams.toString()}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      statusElement.innerHTML = '<i class="fas fa-question-circle"></i> Non disponible';
      return;
    }
    
    const data = await response.json();
    
    if (data.verified) {
      // Afficher le statut de vérification
      if (data.compliant) {
        statusElement.innerHTML = `
          <i class="fas fa-check-circle"></i> 
          <span>Vérifié - Conforme</span>
          <div style="font-size: 0.8rem; margin-top: 0.25rem; opacity: 0.9;">
            ${data.summary?.compliantRules || 0}/${data.summary?.totalRules || 0} règles respectées
          </div>
        `;
        statusElement.style.background = 'rgba(16, 185, 129, 0.3)';
      } else {
        const violationsCount = data.violations?.length || 0;
        statusElement.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i> 
          <span>Vérifié - ${violationsCount} point(s) à corriger</span>
          <div style="font-size: 0.8rem; margin-top: 0.25rem; opacity: 0.9;">
            ${data.summary?.compliantRules || 0}/${data.summary?.totalRules || 0} règles respectées
          </div>
        `;
        statusElement.style.background = 'rgba(245, 158, 11, 0.3)';
      }
      
      // Afficher les conseils si disponibles
      if (data.rules && data.rules.length > 0) {
        displayAVIQAdvice(data.rules);
      }
    } else {
      statusElement.innerHTML = '<i class="fas fa-question-circle"></i> Non vérifié';
    }
    
  } catch (error) {
    console.error('❌ Erreur updateAVIQComplianceBadge:', error);
    statusElement.innerHTML = '<i class="fas fa-question-circle"></i> Erreur';
  }
}

/**
 * Met à jour le badge de conformité Annexe 120
 */
async function updateAnnexe120ComplianceBadge(groupId, siteId) {
  const statusElement = document.getElementById('annexe120-compliance-status');
  if (!statusElement) return;
  
  try {
    const queryParams = new URLSearchParams();
    if (siteId) queryParams.append('siteId', siteId);
    
    const response = await fetch(`/api/compliance/annexe120?${queryParams.toString()}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      statusElement.innerHTML = '<i class="fas fa-question-circle"></i> Non disponible';
      return;
    }
    
    const data = await response.json();
    
    if (data.verified) {
      // Afficher le statut de vérification
      if (data.compliant) {
        statusElement.innerHTML = `
          <i class="fas fa-check-circle"></i> 
          <span>Vérifié - Conforme</span>
          <div style="font-size: 0.8rem; margin-top: 0.25rem; opacity: 0.9;">
            ${data.summary?.passedChecks || 0}/${data.summary?.totalChecks || 0} vérifications OK
          </div>
        `;
        statusElement.style.background = 'rgba(16, 185, 129, 0.3)';
      } else {
        const nonCompliantChecks = data.checks?.filter(c => c.status !== 'OK').length || 0;
        statusElement.innerHTML = `
          <i class="fas fa-exclamation-triangle"></i> 
          <span>Vérifié - ${nonCompliantChecks} point(s) à corriger</span>
          <div style="font-size: 0.8rem; margin-top: 0.25rem; opacity: 0.9;">
            ${data.summary?.passedChecks || 0}/${data.summary?.totalChecks || 0} vérifications OK
          </div>
        `;
        statusElement.style.background = 'rgba(245, 158, 11, 0.3)';
      }
    } else {
      statusElement.innerHTML = '<i class="fas fa-question-circle"></i> Non vérifié';
    }
    
  } catch (error) {
    console.error('❌ Erreur updateAnnexe120ComplianceBadge:', error);
    statusElement.innerHTML = '<i class="fas fa-question-circle"></i> Erreur';
  }
}

/**
 * Affiche les conseils AVIQ dans une section dédiée
 */
function displayAVIQAdvice(rules) {
  const adviceSection = document.getElementById('aviq-advice-section');
  const adviceList = document.getElementById('aviq-advice-list');
  
  if (!adviceSection || !adviceList) return;
  
  // Afficher la section
  adviceSection.style.display = 'block';
  
  // Afficher chaque règle avec son conseil
  adviceList.innerHTML = rules.map(rule => {
    const statusIcon = rule.compliant 
      ? '<i class="fas fa-check-circle" style="color: #10b981;"></i>' 
      : '<i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>';
    
    const statusText = rule.compliant 
      ? `<span style="color: #10b981; font-weight: 600;">✓ Respecté</span>` 
      : `<span style="color: #f59e0b; font-weight: 600;">⚠ ${rule.status}</span>`;
    
    return `
      <div style="background: white; padding: 1rem; border-radius: 8px; border-left: 4px solid ${rule.compliant ? '#10b981' : '#f59e0b'};">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
          <div>
            <strong style="color: #2c3e50; font-size: 1.1rem;">${rule.label}</strong>
            <div style="margin-top: 0.25rem; color: #666; font-size: 0.9rem;">
              ${statusIcon} ${statusText}
            </div>
          </div>
          <div style="text-align: right; color: #666; font-size: 0.85rem;">
            ${rule.current} fois/semaine<br>
            <span style="font-size: 0.75rem;">(min: ${rule.min}, max: ${rule.max})</span>
          </div>
        </div>
        <div style="background: #f0f9ff; padding: 0.75rem; border-radius: 6px; margin-top: 0.5rem;">
          <div style="font-weight: 600; color: #0369a1; margin-bottom: 0.25rem;">
            <i class="fas fa-info-circle"></i> Conseil:
          </div>
          <div style="color: #0c4a6e; font-size: 0.9rem;">
            ${rule.advice}
          </div>
        </div>
        ${rule.recommendations ? `
          <div style="margin-top: 0.5rem; color: #666; font-size: 0.85rem; font-style: italic;">
            ${rule.recommendations}
          </div>
        ` : ''}
        ${rule.examples && rule.examples.length > 0 ? `
          <div style="margin-top: 0.5rem; font-size: 0.85rem;">
            <strong style="color: #666;">Exemples:</strong>
            <span style="color: #999; margin-left: 0.5rem;">${rule.examples.join(', ')}</span>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// Charger les badges au chargement de la page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadQualityBadges);
} else {
  loadQualityBadges();
}

