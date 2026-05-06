function getCarIdFromQuery() {
  return new URLSearchParams(window.location.search).get('id');
}

function getStoredArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function setStoredArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

function isFavorite(id) {
  return getStoredArray('favoriteCarIds').includes(id);
}

function toggleFavorite(id) {
  const current = getStoredArray('favoriteCarIds');
  const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
  setStoredArray('favoriteCarIds', next);
  return next.includes(id);
}

function addCompareId(id) {
  const current = getStoredArray('compareCarIds');
  if (current.includes(id)) return { added: false, reason: 'exists', count: current.length };
  if (current.length >= 4) return { added: false, reason: 'max', count: current.length };
  current.push(id);
  setStoredArray('compareCarIds', current);
  return { added: true, reason: 'added', count: current.length };
}

function showDetailToast(message) {
  let toast = document.getElementById('detailToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'detailToast';
    toast.className = 'detail-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showDetailToast.timer);
  showDetailToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

function updateDetailCompareBar() {
  const compareIds = getStoredArray('compareCarIds');
  const bar = document.getElementById('detailCompareBar');
  const count = document.getElementById('detailCompareCount');
  if (!bar || !count) return;
  count.textContent = String(compareIds.length);
  bar.style.display = compareIds.length >= 2 ? 'flex' : 'none';
}

function normalizeCar(row) {
  return {
    id: row.id,
    brand: row.brand || row.BRAND || '',
    model: row.model || row['CAR MODEL'] || '',
    year: Number(row.year ?? row.YEAR) || '',
    description: row.description || row.DESCRIPTION || '',
    imagePath: row.imagePath || row['IMAGE PATH'] || '',
    engine: row.engine || row.ENGINE || 'N/A',
    topSpeed: row.topSpeed || row['TOP SPEED'] || 'N/A',
    price: row.price || row.PRICE || 'N/A',
    videoUrl: row.videoUrl || row.VIDEO_URL || ''
  };
}

async function fetchCarById(id) {
  try {
    const response = await fetch(`/api/cars/${encodeURIComponent(id)}`);
    if (response.ok) {
      return normalizeCar(await response.json());
    }
  } catch {
    // fallback below
  }
  const rows = await fetch('cars.json').then(r => r.json());
  const found = rows.find(row => row.id === id);
  return found ? normalizeCar(found) : null;
}

async function fetchAllCars() {
  try {
    const response = await fetch('/api/cars');
    if (response.ok) {
      const rows = await response.json();
      return rows.map(normalizeCar);
    }
  } catch {
    // fallback below
  }
  const rows = await fetch('cars.json').then(r => r.json());
  return rows.map(normalizeCar);
}

function numericFromPrice(value) {
  const num = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) ? num : 0;
}

function renderSimilarCars(baseCar, allCars) {
  const section = document.getElementById('similarCarsSection');
  const grid = document.getElementById('similarCarsGrid');
  if (!section || !grid || !baseCar) return;

  const basePrice = numericFromPrice(baseCar.price);
  const similar = allCars
    .filter(car => car.id !== baseCar.id)
    .map(car => {
      const score =
        (car.brand === baseCar.brand ? 3 : 0) +
        (Math.abs(Number(car.year || 0) - Number(baseCar.year || 0)) <= 2 ? 2 : 0) +
        (Math.abs(numericFromPrice(car.price) - basePrice) <= Math.max(basePrice * 0.25, 60000) ? 2 : 0);
      return { car, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(item => item.car);

  if (!similar.length) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  grid.innerHTML = similar.map(car => `
    <article class="similar-car-card" data-car-id="${car.id}">
      <img src="${car.imagePath}" alt="${car.model}" />
      <h3>${car.model}</h3>
      <p>${car.year} - ${car.brand}</p>
      <div class="similar-actions">
        <button class="detail-btn add-similar-compare" data-car-id="${car.id}">Add to Compare</button>
        <button class="detail-btn detail-btn-primary open-similar-detail" data-car-id="${car.id}">View</button>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.add-similar-compare').forEach((button) => {
    button.addEventListener('click', () => {
      const selectedId = button.getAttribute('data-car-id');
      const selectedCar = similar.find(car => car.id === selectedId);
      const result = addCompareId(selectedId);
      if (result.reason === 'max') {
        showDetailToast('You can compare up to 4 cars only');
      } else if (result.reason === 'exists') {
        showDetailToast(`${selectedCar?.brand || ''} ${selectedCar?.model || 'Car'} is already in compare`);
      } else {
        showDetailToast(`${selectedCar?.brand || ''} ${selectedCar?.model || 'Car'} added to compare`);
      }
      updateDetailCompareBar();
    });
  });

  grid.querySelectorAll('.open-similar-detail').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-car-id');
      window.location.href = `car-detail.html?id=${encodeURIComponent(id)}`;
    });
  });
}

function renderCarDetail(car) {
  const container = document.getElementById('carDetailCard');
  if (!car) {
    container.innerHTML = '<p>Car not found.</p>';
    return;
  }

  container.innerHTML = `
    <div class="car-detail-media">
      <img src="${car.imagePath}" alt="${car.model}" />
    </div>
    <div class="car-detail-content">
      <p class="detail-brand">${car.brand}</p>
      <h1>${car.model}</h1>
      <p class="detail-description">${car.year} - ${car.description}</p>
      <div class="detail-spec-grid">
        <div><span>Engine</span><strong>${car.engine}</strong></div>
        <div><span>Top Speed</span><strong>${car.topSpeed}</strong></div>
        <div><span>Price</span><strong>${car.price}</strong></div>
        <div><span>Year</span><strong>${car.year}</strong></div>
      </div>
      <div class="detail-actions">
        <button id="detailFavoriteBtn" class="detail-btn">${isFavorite(car.id) ? 'Remove Favorite' : 'Add Favorite'}</button>
        <button id="detailCompareBtn" class="detail-btn">Add to Compare</button>
        <button id="detailVideoBtn" class="detail-btn detail-btn-primary">Watch Film</button>
      </div>
    </div>
  `;

  document.getElementById('detailFavoriteBtn')?.addEventListener('click', (event) => {
    const active = toggleFavorite(car.id);
    event.target.textContent = active ? 'Remove Favorite' : 'Add Favorite';
  });

  document.getElementById('detailCompareBtn')?.addEventListener('click', () => {
    const result = addCompareId(car.id);
    if (result.reason === 'max') {
      showDetailToast('You can compare up to 4 cars only');
    } else if (result.reason === 'exists') {
      showDetailToast(`${car.brand} ${car.model} is already in compare`);
    } else {
      showDetailToast(`${car.brand} ${car.model} added to compare`);
    }
    updateDetailCompareBar();
  });

  document.getElementById('detailVideoBtn')?.addEventListener('click', () => {
    if (car.videoUrl) {
      window.open(`car-video.html?video=${encodeURIComponent(car.videoUrl)}&model=${encodeURIComponent(car.model)}`, '_blank');
    } else {
      showDetailToast('No video available for this car yet.');
    }
  });
}

async function initCarDetailPage() {
  const id = getCarIdFromQuery();
  if (!id) {
    renderCarDetail(null);
    return;
  }
  const car = await fetchCarById(id);
  renderCarDetail(car);
  const allCars = await fetchAllCars();
  renderSimilarCars(car, allCars);
  updateDetailCompareBar();

  document.getElementById('detailCompareNowBtn')?.addEventListener('click', () => {
    const ids = getStoredArray('compareCarIds');
    if (ids.length < 2) {
      showDetailToast('Select at least 2 cars to compare');
      return;
    }
    window.open(`compare.html?ids=${encodeURIComponent(ids.join(','))}`, '_blank');
  });
}

window.onload = initCarDetailPage;
