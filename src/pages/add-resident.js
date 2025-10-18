const urlParams = new URLSearchParams(window.location.search);
const siteId = urlParams.get('siteId');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!siteId) {
  window.location.href = '/';
}

document.getElementById('back-link').href = `/pages/site-residents.html?siteId=${siteId}`;
document.getElementById('cancel-btn').addEventListener('click', () => {
  window.location.href = `/pages/site-residents.html?siteId=${siteId}`;
});

const allergies = [];
const restrictions = [];

window.addAllergy = () => {
  const container = document.getElementById('allergies-container');
  const id = Date.now();
  const div = document.createElement('div');
  div.className = 'dynamic-field';
  div.innerHTML = `
    <input type="text" placeholder="Allergène" data-allergy-id="${id}" data-field="allergen">
    <select data-allergy-id="${id}" data-field="severity">
      <option value="légère">Légère</option>
      <option value="modérée">Modérée</option>
      <option value="sévère">Sévère</option>
      <option value="critique">Critique</option>
    </select>
    <button type="button" class="btn btn-sm btn-danger" onclick="removeAllergy(${id})">×</button>
  `;
  container.insertBefore(div, container.lastElementChild);
  allergies.push(id);
};

window.removeAllergy = (id) => {
  const fields = document.querySelectorAll(`[data-allergy-id="${id}"]`);
  fields.forEach(field => field.parentElement.remove());
  const index = allergies.indexOf(id);
  if (index > -1) allergies.splice(index, 1);
};

window.addRestriction = () => {
  const container = document.getElementById('restrictions-container');
  const id = Date.now();
  const div = document.createElement('div');
  div.className = 'dynamic-field';
  div.innerHTML = `
    <select data-restriction-id="${id}" data-field="type">
      <option value="religieuse">Religieuse</option>
      <option value="éthique">Éthique</option>
      <option value="médicale">Médicale</option>
      <option value="personnelle">Personnelle</option>
    </select>
    <input type="text" placeholder="Description" data-restriction-id="${id}" data-field="restriction">
    <button type="button" class="btn btn-sm btn-danger" onclick="removeRestriction(${id})">×</button>
  `;
  container.insertBefore(div, container.lastElementChild);
  restrictions.push(id);
};

window.removeRestriction = (id) => {
  const fields = document.querySelectorAll(`[data-restriction-id="${id}"]`);
  fields.forEach(field => field.parentElement.remove());
  const index = restrictions.indexOf(id);
  if (index > -1) restrictions.splice(index, 1);
};

document.getElementById('add-resident-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const allergiesData = allergies.map(id => ({
    allergen: document.querySelector(`[data-allergy-id="${id}"][data-field="allergen"]`).value,
    severity: document.querySelector(`[data-allergy-id="${id}"][data-field="severity"]`).value
  })).filter(a => a.allergen);

  const restrictionsData = restrictions.map(id => ({
    type: document.querySelector(`[data-restriction-id="${id}"][data-field="type"]`).value,
    restriction: document.querySelector(`[data-restriction-id="${id}"][data-field="restriction"]`).value
  })).filter(r => r.restriction);

  const residentData = {
    first_name: document.getElementById('firstName').value,
    last_name: document.getElementById('lastName').value,
    date_of_birth: document.getElementById('dateOfBirth').value,
    gender: document.getElementById('gender').value,
    room_number: document.getElementById('roomNumber').value,
    phone: document.getElementById('phone').value,
    siteId,
    groupId: user.groupId,
    nutritional_profile: {
      allergies: allergiesData,
      intolerances: [],
      dietaryRestrictions: restrictionsData,
      medicalConditions: [],
      nutritionalNeeds: {},
      texturePreferences: { consistency: 'normale', difficulty: 'aucune' },
      hydration: {},
      foodPreferences: {}
    }
  };

  try {
    const response = await fetch('/api/residents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(residentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la création du résident');
    }

    alert('Résident créé avec succès !');
    window.location.href = `/pages/site-residents.html?siteId=${siteId}`;

  } catch (error) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = error.message;
    errorMessage.style.display = 'block';
  }
});
