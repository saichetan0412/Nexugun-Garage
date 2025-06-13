//CaarAnimation
function animateCars() {
  const cars = document.querySelectorAll(".animate-car");
  cars.forEach((car, index) => {
    car.style.animationDelay = `${index * 300}ms`;
    car.classList.add("show");
  });
}

//CarSearch
function searchCars() {
  const query = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
  const carCards = document.querySelectorAll('.car-card');
  const brandBlocks = document.querySelectorAll('.brand-block');
  // Case 1: If input is empty, show all cars and all brand headers
  if (query === '') {
    carCards.forEach(card => card.style.display = 'block');
    brandBlocks.forEach(block => block.style.display = 'block');
    return;
  }
  // Case 2: If input is less than 3 letters, show nothing
  if (query.length < 3) {
    carCards.forEach(card => card.style.display = 'none');
    brandBlocks.forEach(block => block.style.display = 'none');
    return;
  }
  // Case 3: Filter matching cars
  const matchedBrands = new Set();
  carCards.forEach(card => {
    const carName = card.querySelector('h2')?.textContent.toLowerCase() || '';
    const isMatch = carName.includes(query);
    card.style.display = isMatch ? 'block' : 'none';
    if (isMatch) {
      const brand = card.getAttribute('data-brand');
      if (brand) matchedBrands.add(brand);
    }
  });
  // Case 4: Show only brand headers for matched cars
  brandBlocks.forEach(block => {
    const brand = block.getAttribute('data-brand');
    block.style.display = matchedBrands.has(brand) ? 'block' : 'none';
  });
}

//CarSearchByBrand
function filterByBrand() {
  const brand = document.getElementById('brandFilter')?.value || 'All';
  const carCards = document.querySelectorAll('.car-card');
  const brandBlocks = document.querySelectorAll('.brand-block');
  if (brand === 'All') {
    // Show all cars and all brand headers
    carCards.forEach(card => card.style.display = 'block');
    brandBlocks.forEach(block => block.style.display = 'block');
  } else {
    // Show only cars of the selected brand
    carCards.forEach(card => {
      const cardBrand = card.getAttribute('data-brand');
      card.style.display = cardBrand === brand ? 'block' : 'none';
    });
    // Show only the brand header that matches
    brandBlocks.forEach(block => {
      const blockBrand = block.getAttribute('data-brand');
      block.style.display = blockBrand === brand ? 'block' : 'none';
    });
  }
}

//CarSearchByYear
function filterByYear() {
  const selectedYear = document.getElementById('yearFilter')?.value || 'All';
  const carCards = document.querySelectorAll('.car-card');
  const brandBlocks = document.querySelectorAll('.brand-block');
  if (selectedYear === 'All') {
    // Show everything
    carCards.forEach(card => card.style.display = 'block');
    brandBlocks.forEach(block => block.style.display = 'block');
  } else {
    const visibleBrands = new Set();
    // Show/hide cars based on year
    carCards.forEach(card => {
      const cardYear = card.getAttribute('data-year');
      if (cardYear === selectedYear) {
        card.style.display = 'block';
        visibleBrands.add(card.getAttribute('data-brand'));
      } else {
        card.style.display = 'none';
      }
    });
    // Show headers only if their brand has a visible car
    brandBlocks.forEach(block => {
      const blockBrand = block.getAttribute('data-brand');
      block.style.display = visibleBrands.has(blockBrand) ? 'block' : 'none';
    });
  }
}

//CarSortByYear
function setupSortByYear() {
  const sortSelect = document.getElementById('sortYear');
  if (!sortSelect) return;
  sortSelect.addEventListener('change', function () {
    const sortOrder = this.value;
    const carCards = Array.from(document.querySelectorAll('.car-card'));
    const gallerySections = document.querySelectorAll('.car-gallery');
    carCards.forEach(card => {
      const yearText = card.querySelector('h3')?.textContent || '';
      const match = yearText.match(/\b(19|20)\d{2}\b/);
      card.dataset.year = match ? parseInt(match[0]) : 0;
    });
    gallerySections.forEach(section => {
      const cardsInSection = Array.from(section.querySelectorAll('.car-card'));
      if (sortOrder === 'asc' || sortOrder === 'desc') {
        cardsInSection.sort((a, b) => {
          const yearA = parseInt(a.dataset.year);
          const yearB = parseInt(b.dataset.year);
          return sortOrder === 'asc' ? yearA - yearB : yearB - yearA;
        });
        section.innerHTML = '';
        cardsInSection.forEach(card => section.appendChild(card));
      }
    });
  });
}

//CarAdd
function setupCarForm() {
  const carForm = document.getElementById('carForm');
  if (!carForm) return;
  carForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('carName')?.value;
    const year = document.getElementById('carYear')?.value;
    const desc = document.getElementById('carDesc')?.value;
    const brand = document.getElementById('carBrand')?.value;
    const image = document.getElementById('carImage')?.value || `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`;
    const carCard = document.createElement('div');
    carCard.className = 'car-card animate-car';
    carCard.setAttribute('data-brand', brand);
    carCard.setAttribute('data-year', year);
    carCard.innerHTML = `
      <img src="${image}" alt="${name}" />
      <h2>${name}</h2>
      <p>${year} – ${desc}</p>
    `;
    const gallery = document.getElementById('carGallery') || document.querySelector('.car-gallery:last-of-type');
    gallery.appendChild(carCard);
    this.reset();
    const index = document.querySelectorAll(".animate-car").length - 1;
    carCard.style.animationDelay = `${index * 300}ms`;
    setTimeout(() => carCard.classList.add("show"), 10);
  });
}

//Car - Lightbox effect
function setupLightbox() {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  const previewImg = document.createElement('img');
  previewImg.id = 'lightbox-img';
  lightbox.appendChild(previewImg);
  document.body.appendChild(lightbox);
  const delegateLightbox = () => {
    const images = document.querySelectorAll('.car-card img');
    images.forEach(img => {
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
  };
  delegateLightbox();
  // Re-delegate for dynamically added cars
  const observer = new MutationObserver(delegateLightbox);
  observer.observe(document.body, { childList: true, subtree: true });
}

//Car - TabSwitchLogic
document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Highlight active tab
      tabButtons.forEach(btn => btn.classList.remove('active-tab'));
      button.classList.add('active-tab');
      const selectedBrand = button.getAttribute('data-brand');
      // Handle .brand-blocks visibility
      const brandBlocks = document.querySelectorAll('.brand-block');
      brandBlocks.forEach(block => {
        const blockBrand = block.getAttribute('data-brand');
        block.style.display = (selectedBrand === 'All' || selectedBrand === blockBrand)
          ? 'block'
          : 'none';
      });
    });
  });
  // Show all by default
  const brandBlocks = document.querySelectorAll('.brand-block');
  brandBlocks.forEach(block => block.style.display = 'block');
  const brandSections = document.querySelectorAll('.brand-section');
  brandSections.forEach(section => section.style.display = 'flex');
});

  document.getElementById('searchInput')?.addEventListener('input', searchCars);
 
  const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) brandFilter.addEventListener('change', filterByBrand);

  const yearFilter = document.getElementById('yearFilter');
    if (yearFilter) yearFilter.addEventListener('change', filterByYear);

//Car - DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  animateCars();
  setupCarForm();
  setupSortByYear();
  setupLightbox();
  setupTabs();
  searchCars();
  filterByBrand();
  filterByYear();

  const searchInput = document.getElementById('searchInput');
  const brandFilter = document.getElementById('brandFilter');
  const yearFilter = document.getElementById('yearFilter');

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (brandFilter) brandFilter.addEventListener('change', applyFilters);
  if (yearFilter) yearFilter.addEventListener('change', applyFilters);


});