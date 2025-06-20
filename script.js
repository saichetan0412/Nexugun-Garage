let carData = []; // Holds all car objects

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

//CarYearFilter
document.addEventListener("DOMContentLoaded", () => {
  const yearInput = document.getElementById("yearInput");
  const yearDropdown = document.getElementById("yearDropdown");
  const yearGrid = document.getElementById("yearGrid");
  const prevYearsBtn = document.getElementById("prevYears");
  const nextYearsBtn = document.getElementById("nextYears");
  const yearRangeLabel = document.getElementById("yearRangeLabel");

  const minYear = 1900;
  const maxYear = 2030;
  const step = 9;

  let currentStartYear = 2020; // Initial range displayed
  
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
        filterCars(); // Call your filter function if needed
      });
      yearGrid.appendChild(yearDiv);
    }

    // Disable navigation buttons appropriately
    prevYearsBtn.disabled = currentStartYear <= minYear;
    nextYearsBtn.disabled = currentStartYear + step > maxYear;
  }

  // Show dropdown
  yearInput.addEventListener("click", () => {
    yearDropdown.classList.toggle("hidden");
    renderYears();
  });

  // Navigation
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

  // Close dropdown if clicked outside
  window.addEventListener("click", (e) => {
    if (!yearDropdown.contains(e.target) && e.target !== yearInput) {
      yearDropdown.classList.add("hidden");
    }
  });
});

const clearYearBtn = document.getElementById("clearYear");
clearYearBtn.addEventListener("click", () => {
  yearInput.value = '';
  yearDropdown.classList.add("hidden");
  filterCars();
});

function filterCars() {
  const selectedYear = document.getElementById('yearInput')?.value;
  const carCards = document.querySelectorAll('.car-card');
  const brandBlocks = document.querySelectorAll('.brand-block');

  if (!selectedYear) {
    // No year selected, show all
    carCards.forEach(card => card.style.display = 'block');
    brandBlocks.forEach(block => block.style.display = 'block');
    return;
  }

  const matchedBrands = new Set();

  carCards.forEach(card => {
    const cardYear = card.getAttribute('data-year');
    const isMatch = cardYear === selectedYear;
    card.style.display = isMatch ? 'block' : 'none';

    if (isMatch) {
      const brand = card.getAttribute('data-brand');
      if (brand) matchedBrands.add(brand);
    }
  });

  // Show brand headers only for matched cars
  brandBlocks.forEach(block => {
    const brand = block.getAttribute('data-brand');
    block.style.display = matchedBrands.has(brand) ? 'block' : 'none';
  });
}

    
//CarSortByYear
function setupSortByYear() {
  const sortSelect = document.getElementById('sortFilter');
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
    
    
    const newCar = { name, year, description: desc, brand, image };
    carData.push(newCar); // Update global car list
    carCard.className = 'car-card animate-car';
    renderCars(carData); // Re-render the gallery using view/filter-aware renderer
    this.reset();

    const index = document.querySelectorAll(".animate-car").length - 1;
    carCard.style.animationDelay = `${index * 300}ms`;
    setTimeout(() => carCard.classList.add("show"), 10);
  });
}

// Ensure all car cards have data-description set
function ensureDescriptions() {
  document.querySelectorAll('.car-card').forEach(card => {
    if (!card.getAttribute('data-description')) {
      const h3 = card.querySelector('h3');
      if (h3) {
        // Extract quoted text or use full h3 text
        const match = h3.textContent.match(/["“](.+?)["”]/);
        const desc = match ? match[1] : h3.textContent;
        card.setAttribute('data-description', desc);
      }
    }
  });
}

//CarRender
function renderCars() {
  const isList = document.body.classList.contains('list-view');
  const carCards = document.querySelectorAll('.car-card');

  carCards.forEach(card => {
    // Always read from data-* attributes
    const name = card.getAttribute('data-name') || card.querySelector('h2')?.textContent || '';
    const image = card.querySelector('img')?.getAttribute('src') || '';
    const year = card.getAttribute('data-year') || '';
    const brand = card.getAttribute('data-brand') || '';
    const engine = card.getAttribute('data-engine') || '';
    const topSpeed = card.getAttribute('data-topspeed') || '';
    const price = card.getAttribute('data-price') || '';
    // Try to get description from data-description, or from <h3>
    let description = card.getAttribute('data-description');
    if (!description) {
      const h3 = card.querySelector('h3');
      if (h3) {
        // Try to extract quoted text from h3
        const match = h3.textContent.match(/["“](.+?)["”]/);
        description = match ? match[1] : h3.textContent;
      } else {
        description = '';
      }
    }

    // Build new card for list/grid
    let cardHTML = '';
    if (isList) {
      cardHTML = `
        <input type="checkbox" class="compare-checkbox" data-car-id="${card.getAttribute('data-name') || name}">
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
        <input type="checkbox" class="compare-checkbox" data-car-id="${card.getAttribute('data-name') || name}">
        <img src="${image}" alt="${name}" />
        <h2>${name}</h2>
        <p>${year} – ${description}</p>
      `;
    }
    card.innerHTML = cardHTML;
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

/* Code for the bahaviour pf the Logo Modal */
/* When user hovers on the logo, the logo should rotate for 2 seconds and then the modal should open */
/* In the Modal, we will have an Image, a Title, a Description, and a Button to close the Modal */
/* The Image src will be local, The title will be different for each logo, the title will be car brand, and the description will be the founder of Car brand*/
/* This image, title, and description will be coming from HTML code*/
/* When user clicks on the close button, the modal should close and the logo should rotate back to its original position */
/* When the user clicks anywhere outside the modal, the modal should close and the logo should rotate back to its original position */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("logoModal");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const closeButton = document.querySelector(".close-button");

  const logos = document.querySelectorAll(".brand-logo").forEach(logo => {
    logo.addEventListener("mouseover", () => {
      logo.classList.add("spinning-continuous");
      setTimeout(() => {
        logo.classList.remove("spinning-continuous");
        modal.style.display = "block";
        modalImage.src = logo.getAttribute("data-image");
        modalTitle.textContent = logo.getAttribute("data-title");
        modalDescription.textContent = logo.getAttribute("data-description");

        // Fetch content from HTML
        const modalData = document.querySelector(`.modal-data[data-brand="${brand}"]`);
        if (modalData) {
          modalImage.src = modalData.querySelector("img").src;
          modalTitle.textContent = modalData.querySelector("h2").textContent;
          modalDescription.textContent = modalData.querySelector("p").textContent;
        }
        
        modal.style.display = "block";
      }, 2000); // Spins for 2 seconds
    });
  });

  // Close Modal
  closeButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

// Add spin animation via CSS
const style = document.createElement("style");
style.innerHTML = `
  .brand-logo.spinning {
    animation: spinLogo 0.25s linear;
  }

  @keyframes spinLogo {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

const modalImage = document.getElementById("modalImage");
const lightboxOverlay = document.getElementById("lightboxOverlay");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.querySelector(".lightbox-close");

// Open lightbox on modal image click
modalImage.addEventListener("click", () => {
  lightboxImage.src = modalImage.src;
  lightboxOverlay.classList.add("active");
});

// Close lightbox when clicking the close button or outside the image
lightboxOverlay.addEventListener("click", (e) => {
  if (e.target === lightboxOverlay || e.target === lightboxClose) {
    lightboxOverlay.classList.remove("active");
  }
});

//Car - DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  animateCars();
  searchCars();
  filterByBrand();
  filterCars();
  setupSortByYear();
  setupCarForm();
  setupLightbox();
  setupTabs();
  filterByYear();
  ensureDescriptions();
  
  const searchInput = document.getElementById('searchInput');
  const brandFilter = document.getElementById('brandFilter');
  const yearFilter = document.getElementById('yearFilter');

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (brandFilter) brandFilter.addEventListener('change', applyFilters);
  if (yearFilter) yearFilter.addEventListener('change', applyFilters);
});

// Toggle between list and grid view
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleViewBtn");
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("list-view");
    // Change button text
    toggleBtn.textContent = document.body.classList.contains("list-view")
      ? "Switch to Grid View"
      : "Switch to List View";
    // Re-render cars for new layout
    ensureDescriptions();
    renderCars();
  });
});

// Compare Cars Logic
let selectedCars = [];

function updateCompareBar() {
  const bar = document.getElementById('compareBar');
  const count = document.getElementById('compareCount');
  const compareBtn = document.getElementById('compareBtn');
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
  }
});

document.getElementById('clearCompareBtn').addEventListener('click', () => {
  selectedCars = [];
  document.querySelectorAll('.compare-checkbox').forEach(cb => cb.checked = false);
  updateCompareBar();
});

// Placeholder for compare button click
document.getElementById('compareBtn').addEventListener('click', () => {
  if (selectedCars.length < 2) {
    alert('Please select at least 2 cars to compare.');
    return;
  }
  // Show comparison modal here!
  alert('Show comparison modal here!');
});
