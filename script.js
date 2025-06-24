let carData = []; // Holds all car objects

// --- Utility Functions ---
function $(selector) {
  return document.querySelector(selector);
}
function $all(selector) {
  return document.querySelectorAll(selector);
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
  const query = $('#searchInput')?.value.trim().toLowerCase() || '';
  const carCards = $all('.car-card');
  if (query.length < 3) {
    // Show all cars if less than 3 characters
    carCards.forEach(card => card.style.display = 'block');
    $all('.brand-block').forEach(block => block.style.display = 'block');
    return;
  }
  let anyVisible = false;
  carCards.forEach(card => {
    const carName = card.querySelector('h2')?.textContent.toLowerCase() || '';
    const isMatch = carName.includes(query);
    card.style.display = isMatch ? 'block' : 'none';
    if (isMatch) anyVisible = true;
  });
  // Hide brand blocks with no visible cars
  $all('.brand-block').forEach(block => {
    const gallery = block.querySelector('.car-gallery');
    const visible = Array.from(gallery.children).some(card => card.style.display !== 'none');
    block.style.display = visible ? 'block' : 'none';
  });
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
  const selectedYear = $('#yearInput')?.value;
  const carCards = $all('.car-card');
  if (!selectedYear) {
    // Show all cars if no year is selected
    carCards.forEach(card => card.style.display = 'block');
    $all('.brand-block').forEach(block => block.style.display = 'block');
    return;
  }
  carCards.forEach(card => {
    const cardYear = card.getAttribute('data-year');
    const isMatch = cardYear === selectedYear;
    card.style.display = isMatch ? 'block' : 'none';
  });
  // Hide brand blocks with no visible cars
  $all('.brand-block').forEach(block => {
    const gallery = block.querySelector('.car-gallery');
    const visible = Array.from(gallery.children).some(card => card.style.display !== 'none');
    block.style.display = visible ? 'block' : 'none';
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
  carForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = $('#carName')?.value;
    const year = $('#carYear')?.value;
    const desc = $('#carDesc')?.value;
    const brand = $('#carBrand')?.value;
    const image = $('#carImage')?.value || `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`;
    const newCar = { name, year, description: desc, brand, image };
    carData.push(newCar);
    renderCars(carData);
    this.reset();
    const index = $all(".animate-car").length - 1;
    const carCard = $all(".animate-car")[index];
    carCard.style.animationDelay = `${index * 300}ms`;
    setTimeout(() => carCard.classList.add("show"), 10);
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
        <input type="checkbox" class="compare-checkbox" data-car-id="${name}">
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
      tabButtons.forEach(btn => btn.classList.remove('active-tab'));
      button.classList.add('active-tab');
      const selectedBrand = button.getAttribute('data-brand');
      const brandBlocks = $all('.brand-block');
      brandBlocks.forEach(block => {
        const blockBrand = block.getAttribute('data-brand');
        block.style.display = (selectedBrand === 'All' || selectedBrand === blockBrand)
          ? 'block'
          : 'none';
      });
    });
  });
  const brandBlocks = $all('.brand-block');
  brandBlocks.forEach(block => block.style.display = 'block');
  const brandSections = $all('.brand-section');
  brandSections.forEach(section => section.style.display = 'flex');
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
      const name = card.getAttribute('data-name') || card.querySelector('h2')?.textContent;
      return selectedCars.includes(name);
    })
    .map(card => {
      const name = card.getAttribute('data-name') || card.querySelector('h2')?.textContent;
      return {
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
  localStorage.setItem('compareCars', JSON.stringify(carsToCompare));
  window.open('compare.html', '_blank');
});

function showCompareModal() {
  console.log('showCompareModal called', selectedCars);
  const modal = $('#compareModal');
  const modalBody = $('#compareModalBody');
  const carCards = Array.from($all('.car-card'));
  const carsToCompare = carCards.filter(card =>
    selectedCars.includes(card.getAttribute('data-name') || card.querySelector('h2')?.textContent)
  ).map(card => ({
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
  loadCarsFromCSV();
  setupAlphaSort()

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
  fetch('Cars.csv')
    .then(response => response.text())
    .then(csv => {
      carData = Papa.parse(csv, { header: true }).data;
      renderAllCars();
    });
}

// Render all cars into their brand sections
function renderAllCars() {
  $all('.car-gallery').forEach(gallery => gallery.innerHTML = '');
  carData.forEach(car => {
    const section = document.querySelector(`.car-gallery[data-brand="${car['BRAND']}"]`);
    if (!section) return;
    const card = document.createElement('div');
    card.className = 'car-card animate-car';
    card.setAttribute('data-brand', car['BRAND']);
    card.setAttribute('data-year', car['YEAR']);
    card.setAttribute('data-engine', car['ENGINE'] || '');
    card.setAttribute('data-topspeed', car['TOP SPEED'] || '');
    card.setAttribute('data-price', car['PRICE'] || '');
    card.setAttribute('data-description', car['DESCRIPTION'] || '');
    card.innerHTML = `
      <h2>${car['CAR MODEL']}</h2>
      <img src="${car['IMAGE PATH']}" alt="${car['CAR MODEL']}" />
      <h3>${car['YEAR']} – "${car['DESCRIPTION']}"</h3>
    `;
    section.appendChild(card);
  });
  animateCars();
  ensureDescriptions();
  renderCars();
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