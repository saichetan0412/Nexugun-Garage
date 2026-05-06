let carData = []; // Holds normalized API car objects
let activeBrandFilter = 'All';

// --- Utility Functions ---
function $(selector) {
  return document.querySelector(selector);
}
function $all(selector) {
  return document.querySelectorAll(selector);
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

function getFavoriteIds() {
  return getStoredArray('favoriteCarIds');
}

function isFavoriteCar(carId) {
  return getFavoriteIds().includes(carId);
}

function toggleFavoriteCar(carId) {
  const favorites = getFavoriteIds();
  const next = favorites.includes(carId)
    ? favorites.filter(id => id !== carId)
    : [...favorites, carId];
  setStoredArray('favoriteCarIds', next);
}

function addRecentlyViewed(carId) {
  const current = getStoredArray('recentlyViewedCarIds').filter(id => id !== carId);
  current.unshift(carId);
  setStoredArray('recentlyViewedCarIds', current.slice(0, 10));
}

function renderRecentlyViewed() {
  const section = $('#recentlyViewedSection');
  const list = $('#recentlyViewedList');
  if (!section || !list) return;

  const ids = getStoredArray('recentlyViewedCarIds');
  const items = ids
    .map(id => carData.find(car => car.id === id))
    .filter(Boolean)
    .slice(0, 6);

  if (!items.length) {
    section.style.display = 'none';
    list.innerHTML = '';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = items.map(car => `
    <button class="recent-car-chip" data-car-id="${car.id}">
      <img src="${car.imagePath}" alt="${car.model}" />
      <span>${car.model}</span>
    </button>
  `).join('');

  list.querySelectorAll('.recent-car-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const carId = chip.getAttribute('data-car-id');
      window.open(`car-detail.html?id=${encodeURIComponent(carId)}`, '_blank');
    });
  });
}

function renderLoadingSkeletons() {
  const skeletonCard = `
    <div class="car-card skeleton-card">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-image"></div>
      <div class="skeleton-line skeleton-subtitle"></div>
    </div>
  `;
  $all('.car-gallery').forEach((gallery) => {
    gallery.innerHTML = `${skeletonCard}${skeletonCard}${skeletonCard}`;
  });
}

function setupScrollReveal() {
  const targets = [
    ...$all('.search-container'),
    ...$all('.tabs-container'),
    ...$all('.hero-section'),
    ...$all('.brand-block')
  ];

  targets.forEach((el) => el.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach((el) => observer.observe(el));
}

function setupHeroParallax() {
  const hero = $('.hero-section');
  if (!hero) return;
  window.addEventListener('scroll', () => {
    const offset = Math.min(window.scrollY * 0.18, 40);
    hero.style.transform = `translateY(${offset}px)`;
  });
}

// --- Car Animation ---
function animateCars() {
  $all(".animate-car").forEach((car, index) => {
    car.style.animationDelay = `${index * 300}ms`;
    car.classList.add("show");
  });
}

// --- Car Search ---
function searchCars() {
  applyVisibilityFilters();
}

// --- Car Year Filter ---
function setupYearFilter() {
  const yearInput = $("#yearInput");
  const yearDropdown = $("#yearDropdown");
  const yearGrid = $("#yearGrid");
  const prevYearsBtn = $("#prevYears");
  const nextYearsBtn = $("#nextYears");
  const yearRangeLabel = $("#yearRangeLabel");
  if (!yearInput || !yearDropdown || !yearGrid || !prevYearsBtn || !nextYearsBtn || !yearRangeLabel) return;

  const minYear = 1900, maxYear = 2030, step = 9;
  let currentStartYear = 2020;

  function renderYears() {
    yearGrid.innerHTML = "";
    yearRangeLabel.textContent = `${currentStartYear}–${currentStartYear + step - 1}`;
    for (let i = 0; i < step; i++) {
      const year = currentStartYear + i;
      if (year > maxYear) break;
      const yearDiv = document.createElement("div");
      yearDiv.textContent = year;
      yearDiv.addEventListener("click", () => {
        yearInput.value = year;
        yearDropdown.classList.add("hidden");
        filterCars();
      });
      yearGrid.appendChild(yearDiv);
    }
    prevYearsBtn.disabled = currentStartYear <= minYear;
    nextYearsBtn.disabled = currentStartYear + step > maxYear;
  }

  yearInput.addEventListener("click", () => {
    yearDropdown.classList.toggle("hidden");
    renderYears();
  });
  prevYearsBtn.addEventListener("click", () => {
    if (currentStartYear - step >= minYear) {
      currentStartYear -= step;
      renderYears();
    }
  });
  nextYearsBtn.addEventListener("click", () => {
    if (currentStartYear + step <= maxYear) {
      currentStartYear += step;
      renderYears();
    }
  });
  window.addEventListener("click", (e) => {
    if (!yearDropdown.contains(e.target) && e.target !== yearInput) {
      yearDropdown.classList.add("hidden");
    }
  });
  $("#clearYear")?.addEventListener("click", () => {
    yearInput.value = '';
    yearDropdown.classList.add("hidden");
    filterCars();
  });
}

// --- Car Filter ---
function filterCars() {
  applyVisibilityFilters();
}

function applyVisibilityFilters() {
  const query = ($('#searchInput')?.value || '').trim().toLowerCase();
  const selectedYear = $('#yearInput')?.value || '';
  const favorites = getFavoriteIds();
  const isFavoritesMode = activeBrandFilter === 'Favorites';

  $all('.car-card').forEach((card) => {
    const name = (card.getAttribute('data-name') || card.querySelector('h2')?.textContent || '').toLowerCase();
    const cardYear = card.getAttribute('data-year') || '';
    const cardBrand = card.getAttribute('data-brand') || '';
    const cardId = card.getAttribute('data-id') || '';

    const matchesQuery = query.length < 3 || name.includes(query);
    const matchesYear = !selectedYear || cardYear === selectedYear;
    const matchesBrand = activeBrandFilter === 'All' || activeBrandFilter === 'Favorites' || cardBrand === activeBrandFilter;
    const matchesFavorite = !isFavoritesMode || favorites.includes(cardId);

    card.style.display = (matchesQuery && matchesYear && matchesBrand && matchesFavorite) ? 'block' : 'none';
  });

  $all('.brand-block').forEach((block) => {
    const visibleCards = Array.from(block.querySelectorAll('.car-card')).some(card => card.style.display !== 'none');
    block.style.display = visibleCards ? 'block' : 'none';
  });
}

// --- Car Sort By Year ---
function setupSortByYear() {
  const sortSelect = $('#sortFilter');
  if (!sortSelect) return;
  sortSelect.addEventListener('change', function () {
    const sortOrder = this.value;
    const gallerySections = $all('.car-gallery');
    gallerySections.forEach(section => {
      const cardsInSection = Array.from(section.querySelectorAll('.car-card'));
      cardsInSection.sort((a, b) => {
        const yearA = parseInt(a.getAttribute('data-year')) || 0;
        const yearB = parseInt(b.getAttribute('data-year')) || 0;
        return sortOrder === 'asc' ? yearA - yearB : yearB - yearA;
      });
      section.innerHTML = '';
      cardsInSection.forEach(card => section.appendChild(card));
    });
  });
}

// --- Car Add ---
function setupCarForm() {
  const carForm = $('#carForm');
  if (!carForm) return;
  carForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = $('#carName')?.value;
    const year = $('#carYear')?.value;
    const desc = $('#carDesc')?.value;
    const brand = $('#carBrand')?.value;
    const image = $('#carImage')?.value || `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`;
    const payload = {
      model: name,
      year: Number(year),
      description: desc,
      brand,
      imagePath: image
    };
    try {
      await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      await loadCarsFromCSV();
      this.reset();
    } catch (error) {
      console.error('Failed to add car:', error);
      alert('Unable to save car right now.');
    }
  });
}

// --- Ensure Descriptions ---
function ensureDescriptions() {
  $all('.car-card').forEach(card => {
    if (!card.getAttribute('data-description')) {
      const h3 = card.querySelector('h3');
      if (h3) {
        const match = h3.textContent.match(/["“](.+?)["”]/);
        const desc = match ? match[1] : h3.textContent;
        card.setAttribute('data-description', desc);
      }
    }
  });
}

// --- Car Render ---
function renderCars() {
  const isList = document.body.classList.contains('list-view');
  const carCards = $all('.car-card');
  carCards.forEach(card => {
    const name = card.getAttribute('data-name') || card.querySelector('h2')?.textContent || '';
    const image = card.querySelector('img')?.getAttribute('src') || '';
    const year = card.getAttribute('data-year') || '';
    const brand = card.getAttribute('data-brand') || '';
    const engine = card.getAttribute('data-engine') || '';
    const topSpeed = card.getAttribute('data-topspeed') || '';
    const price = card.getAttribute('data-price') || '';
    let description = card.getAttribute('data-description');
    if (!description) {
      const h3 = card.querySelector('h3');
      if (h3) {
        const match = h3.textContent.match(/["“](.+?)["”]/);
        description = match ? match[1] : h3.textContent;
      } else {
        description = '';
      }
    }
    let cardHTML = '';
    if (isList) {
      cardHTML = `
        <button class="favorite-btn ${isFavoriteCar(card.getAttribute('data-id')) ? 'active' : ''}" data-car-id="${card.getAttribute('data-id')}" title="Toggle Favorite">★</button>
        <input type="checkbox" class="compare-checkbox" data-car-id="${card.getAttribute('data-id')}">
        <div class="car-card-left">
          <img src="${image}" alt="${name}" />
          <div>
            <h2>${name}</h2>
            <p><strong>Brand:</strong> ${brand}</p>
            <p><strong>Year:</strong> ${year}</p>
            <p><strong>Description:</strong> ${description || 'N/A'}</p>
          </div>
        </div>
        <div class="car-card-right">
          <p><strong>Engine:</strong> ${engine || 'N/A'}</p>
          <p><strong>Top Speed:</strong> ${topSpeed || 'N/A'}</p>
          <p><strong>Price:</strong> ${price || 'N/A'}</p>
        </div>
      `;
    } else {
      cardHTML = `
        <button class="favorite-btn ${isFavoriteCar(card.getAttribute('data-id')) ? 'active' : ''}" data-car-id="${card.getAttribute('data-id')}" title="Toggle Favorite">★</button>
        <img src="${image}" alt="${name}" />
        <h2>${name}</h2>
        <p>${year} – ${description}</p>
      `;
    }
    card.innerHTML = cardHTML;
  });
}

// --- Lightbox Effect ---
function setupLightbox() {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  const previewImg = document.createElement('img');
  previewImg.id = 'lightbox-img';
  lightbox.appendChild(previewImg);
  document.body.appendChild(lightbox);
  function delegateLightbox() {
    $all('.car-card img').forEach(img => {
      img.addEventListener('mouseenter', () => {
        previewImg.src = img.src;
        lightbox.classList.add('active');
        document.body.classList.add('blurred');
      });
      img.addEventListener('mouseleave', () => {
        lightbox.classList.remove('active');
        document.body.classList.remove('blurred');
      });
    });
  }
  delegateLightbox();
  const observer = new MutationObserver(delegateLightbox);
  observer.observe(document.body, { childList: true, subtree: true });
}

// --- Tab Switch Logic ---
function setupTabs() {
  const tabButtons = $all(".tab-button");
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active-tab', 'active'));
      button.classList.add('active-tab', 'active');
      activeBrandFilter = button.getAttribute('data-brand') || 'All';
      applyVisibilityFilters();
    });
  });
  tabButtons.forEach(btn => btn.classList.remove('active-tab', 'active'));
  const allTab = document.querySelector('.tab-button[data-brand="All"]');
  allTab?.classList.add('active-tab', 'active');
  activeBrandFilter = 'All';
  applyVisibilityFilters();
}

// --- Logo Modal Logic ---
function setupLogoModal() {
  const modal = $("#logoModal");
  const modalImage = $("#modalImage");
  const modalTitle = $("#modalTitle");
  const modalDescription = $("#modalDescription");
  const closeButton = $(".close-button");
  $all(".brand-logo").forEach(logo => {
    logo.addEventListener("mouseover", () => {
      logo.classList.add("spinning-continuous");
      setTimeout(() => {
        logo.classList.remove("spinning-continuous");
        modal.style.display = "block";
        modalImage.src = logo.getAttribute("data-image");
        modalTitle.textContent = logo.getAttribute("data-title");
        modalDescription.textContent = logo.getAttribute("data-description");
        const brand = logo.getAttribute("data-brand");
        const modalData = document.querySelector(`.modal-data[data-brand="${brand}"]`);
        if (modalData) {
          modalImage.src = modalData.querySelector("img").src;
          modalTitle.textContent = modalData.querySelector("h2").textContent;
          modalDescription.textContent = modalData.querySelector("p").textContent;
        }
        modal.style.display = "block";
      }, 2000);
    });
  });
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}

// --- Lightbox Overlay Logic ---
function setupLightboxOverlay() {
  const modalImage = $("#modalImage");
  const lightboxOverlay = $("#lightboxOverlay");
  const lightboxImage = $("#lightboxImage");
  const lightboxClose = $(".lightbox-close");
  modalImage.addEventListener("click", () => {
    lightboxImage.src = modalImage.src;
    lightboxOverlay.classList.add("active");
  });
  lightboxOverlay.addEventListener("click", (e) => {
    if (e.target === lightboxOverlay || e.target === lightboxClose) {
      lightboxOverlay.classList.remove("active");
    }
  });
}

// --- Compare Cars Logic ---
let selectedCars = [];

function updateCompareBar() {
  const bar = $('#compareBar');
  const count = $('#compareCount');
  const compareBtn = $('#compareBtn');
  if (selectedCars.length >= 2) {
    bar.style.display = 'block';
    compareBtn.disabled = selectedCars.length > 4 || selectedCars.length < 2;
    count.textContent = selectedCars.length;
  } else {
    bar.style.display = 'none';
    count.textContent = selectedCars.length;
  }
}

document.addEventListener('change', (e) => {
  if (e.target.classList.contains('compare-checkbox')) {
    const carId = e.target.getAttribute('data-car-id');
    if (e.target.checked) {
      if (selectedCars.length >= 4) {
        e.target.checked = false;
        alert('You can compare a maximum of 4 cars.');
        return;
      }
      if (!selectedCars.includes(carId)) selectedCars.push(carId);
    } else {
      selectedCars = selectedCars.filter(id => id !== carId);
    }
    updateCompareBar();
    console.log(selectedCars);
  }
});

$('#clearCompareBtn')?.addEventListener('click', () => {
  selectedCars = [];
  $all('.compare-checkbox').forEach(cb => cb.checked = false);
  updateCompareBar();
});

$('#compareBtn')?.addEventListener('click', () => {
  if (selectedCars.length < 2) {
    alert('Please select at least 2 cars to compare.');
    return;
  }
   // Gather all car data for selected cars
  const carCards = Array.from(document.querySelectorAll('.car-card'));
  const carsToCompare = carCards
    .filter(card => {
      const id = card.getAttribute('data-id');
      return selectedCars.includes(id);
    })
    .map(card => {
      const name = card.getAttribute('data-name') || card.querySelector('h2')?.textContent;
      return {
        id: card.getAttribute('data-id'),
       name,
        brand: card.getAttribute('data-brand'),
        year: card.getAttribute('data-year'),
        engine: card.getAttribute('data-engine'),
        topSpeed: card.getAttribute('data-topspeed'),
        price: card.getAttribute('data-price'),
        description: card.getAttribute('data-description'),
        image: card.querySelector('img')?.getAttribute('src') || ''
      };
    });
  console.log('carsToCompare', carsToCompare);
  localStorage.setItem('compareCarIds', JSON.stringify(carsToCompare.map(car => car.id)));
  window.open(`compare.html?ids=${encodeURIComponent(carsToCompare.map(car => car.id).join(','))}`, '_blank');
});

function showCompareModal() {
  console.log('showCompareModal called', selectedCars);
  const modal = $('#compareModal');
  const modalBody = $('#compareModalBody');
  const carCards = Array.from($all('.car-card'));
  const carsToCompare = carCards.filter(card =>
    selectedCars.includes(card.getAttribute('data-id'))
  ).map(card => ({
    id: card.getAttribute('data-id'),
    name: card.getAttribute('data-name') || card.querySelector('h2')?.textContent,
    brand: card.getAttribute('data-brand'),
    year: card.getAttribute('data-year'),
    engine: card.getAttribute('data-engine'),
    topSpeed: card.getAttribute('data-topspeed'),
    price: card.getAttribute('data-price'),
    description: card.getAttribute('data-description'),
    image: card.querySelector('img')?.getAttribute('src') || ''
  }));

  let table = `<table class="compare-table"><tr>
    <th>Field</th>
    ${carsToCompare.map(car => `<th>${car.name}</th>`).join('')}
  </tr>
  <tr>
    <td>Image</td>
    ${carsToCompare.map(car => `<td><img src="${car.image}" alt="${car.name}"></td>`).join('')}
  </tr>
  <tr>
    <td>Brand</td>
    ${carsToCompare.map(car => `<td>${car.brand}</td>`).join('')}
  </tr>
  <tr>
    <td>Year</td>
    ${carsToCompare.map(car => `<td>${car.year}</td>`).join('')}
  </tr>
  <tr>
    <td>Engine</td>
    ${carsToCompare.map(car => `<td>${car.engine}</td>`).join('')}
  </tr>
  <tr>
    <td>Top Speed</td>
    ${carsToCompare.map(car => `<td>${car.topSpeed}</td>`).join('')}
  </tr>
  <tr>
    <td>Price</td>
    ${carsToCompare.map(car => `<td>${car.price}</td>`).join('')}
  </tr>
  <tr>
    <td>Description</td>
    ${carsToCompare.map(car => `<td>${car.description}</td>`).join('')}
  </tr>
  </table>`;

  modalBody.innerHTML = table;
  modal.style.display = 'flex';
}

$('#closeCompareModal')?.addEventListener('click', () => {
  $('#compareModal').style.display = 'none';
});
window.addEventListener('click', (event) => {
  const modal = $('#compareModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// --- DOMContentLoaded Master ---
document.addEventListener("DOMContentLoaded", () => {
  renderLoadingSkeletons();
  $('#searchInput')?.addEventListener('input', searchCars);
  animateCars();
  searchCars();
  filterCars();
  setupSortByYear();
  setupCarForm();
  setupLightbox();
  setupTabs();
  setupYearFilter();
  ensureDescriptions();
  setupLogoModal();
  setupLightboxOverlay();
  setupScrollReveal();
  setupHeroParallax();
  loadCarsFromCSV();
  setupAlphaSort()

  document.addEventListener('click', (event) => {
    const favButton = event.target.closest('.favorite-btn');
    if (!favButton) return;
    event.stopPropagation();
    const carId = favButton.getAttribute('data-car-id');
    toggleFavoriteCar(carId);
    favButton.classList.toggle('active', isFavoriteCar(carId));
    applyVisibilityFilters();
  });

  // Toggle between list and grid view
  const toggleBtn = $("#toggleViewBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("list-view");
      toggleBtn.textContent = document.body.classList.contains("list-view")
        ? "Switch to Grid View"
        : "Switch to List View";
      ensureDescriptions();
      renderCars();
      // Clear compare selection when toggling views
      selectedCars = [];
      $all('.compare-checkbox').forEach(cb => cb.checked = false);
      updateCompareBar();
    });
  }

  // Add click event to car cards to open a new tab
  function setupCarCardClick() {
    $all('.car-card').forEach(card => {
      if (card.dataset.boundClick === 'true') return;
      card.dataset.boundClick = 'true';
      card.addEventListener('click', function (e) {
        if (e.target.closest('.compare-checkbox') || e.target.closest('.favorite-btn')) return;
        const carId = card.getAttribute('data-id');
        addRecentlyViewed(carId);
        renderRecentlyViewed();
        window.open(`car-detail.html?id=${encodeURIComponent(carId)}`, '_blank');
      });
    });
  }
  setupCarCardClick();
  // If cars are re-rendered, re-attach the click event
  const observer = new MutationObserver(setupCarCardClick);
  observer.observe(document.body, { childList: true, subtree: true });
});

// Utility to parse CSV (simple version)
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]);
    return obj;
  });
}

// Load cars from CSV and render
function loadCarsFromCSV() {
  renderLoadingSkeletons();
  return fetch('/api/cars')
    .then(response => {
      if (!response.ok) {
        throw new Error('API unavailable');
      }
      return response.json();
    })
    .then(json => {
      carData = json;
      renderAllCars();
    })
    .catch(() => {
      // Fallback for static usage when backend is not running.
      return fetch('cars.json')
        .then(response => response.json())
        .then(json => {
          carData = json.map(car => ({
            id: car.id || `${String(car['BRAND'] || '').toLowerCase()}-${String(car['CAR MODEL'] || '').toLowerCase()}-${car['YEAR'] || ''}`.replace(/\s+/g, '-'),
            brand: car['BRAND'] || '',
            model: car['CAR MODEL'] || '',
            year: Number(car['YEAR']) || 0,
            description: car['DESCRIPTION'] || '',
            imagePath: car['IMAGE PATH'] || '',
            engine: car['ENGINE'] || '',
            topSpeed: car['TOP SPEED'] || '',
            price: car['PRICE'] || '',
            videoUrl: car['VIDEO_URL'] || ''
          }));
          renderAllCars();
        });
    });
}

// Render all cars into their brand sections
function renderAllCars() {
  $all('.car-gallery').forEach(gallery => gallery.innerHTML = '');
  carData.forEach(car => {
    const section = document.querySelector(`.car-gallery[data-brand="${car.brand}"]`);
    if (!section) return;
    const card = document.createElement('div');
    card.className = 'car-card animate-car';
    card.setAttribute('data-id', car.id);
    card.setAttribute('data-name', car.model);
    card.setAttribute('data-brand', car.brand);
    card.setAttribute('data-year', car.year);
    card.setAttribute('data-engine', car.engine || '');
    card.setAttribute('data-topspeed', car.topSpeed || '');
    card.setAttribute('data-price', car.price || '');
    card.setAttribute('data-description', car.description || '');
    card.innerHTML = `
      <h2>${car.model}</h2>
      <img src="${car.imagePath}" alt="${car.model}" />
      <h3>${car.year} – "${car.description}"</h3>
    `;
    section.appendChild(card);
  });
  animateCars();
  ensureDescriptions();
  renderCars();
  renderRecentlyViewed();
  applyVisibilityFilters();
}

function setupAlphaSort() {
  const alphaBtn = $('#alphaSortBtn');
  if (!alphaBtn) return;
  alphaBtn.addEventListener('click', function () {
    const gallerySections = $all('.car-gallery');
    gallerySections.forEach(section => {
      const cardsInSection = Array.from(section.querySelectorAll('.car-card'));
      cardsInSection.sort((a, b) => {
        const nameA = (a.querySelector('h2')?.textContent || '').toLowerCase();
        const nameB = (b.querySelector('h2')?.textContent || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      section.innerHTML = '';
      cardsInSection.forEach(card => section.appendChild(card));
    });
  });
}