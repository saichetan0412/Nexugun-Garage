// Animate all cars with staggered slide-in
function animateCars() {
  const cars = document.querySelectorAll(".animate-car");
  cars.forEach((car, index) => {
    const delay = index * 300;
    car.style.animationDelay = `${delay}ms`;
    car.classList.add("show");
  });
}

// Independent filtering logic
function applyFilters() {
  const searchQuery = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const brand = document.getElementById('brandFilter')?.value || 'All';
  const year = document.getElementById('yearFilter')?.value || 'All';

  const cards = document.querySelectorAll('.car-card');

  cards.forEach(card => {
    const nameText = card.querySelector('h2')?.textContent.toLowerCase() || '';
    const cardBrand = card.getAttribute('data-brand') || '';
    const cardYear = card.getAttribute('data-year') || '';

    const matchesSearch = searchQuery && nameText.includes(searchQuery);
    const matchesBrand = brand !== 'All' && cardBrand === brand;
    const matchesYear = year !== 'All' && cardYear === year;

    // Show if any filter matches, or if all are default
    if (!searchQuery && brand === 'All' && year === 'All') {
      card.style.display = 'block';
    } else if (matchesSearch || matchesBrand || matchesYear) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Page load setup
document.addEventListener("DOMContentLoaded", () => {
  animateCars();

  const searchInput = document.getElementById('searchInput');
  const brandFilter = document.getElementById('brandFilter');
  const yearFilter = document.getElementById('yearFilter');

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (brandFilter) brandFilter.addEventListener('change', applyFilters);
  if (yearFilter) yearFilter.addEventListener('change', applyFilters);

  const carForm = document.getElementById('carForm');
  if (carForm) {
    carForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('carName').value;
      const year = document.getElementById('carYear').value;
      const desc = document.getElementById('carDesc').value;
      const brand = document.getElementById('carBrand').value;
      const image = document.getElementById('carImage').value || `https://picsum.photos/300/200?random=${Math.floor(Math.random() * 1000)}`;

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
});

document.getElementById('sortYear').addEventListener('change', function () {
  const sortOrder = this.value;
  const carCards = Array.from(document.querySelectorAll('.car-card'));
  const gallerySections = document.querySelectorAll('.car-gallery');

  carCards.forEach(card => {
    const yearText = card.querySelector('h3').textContent;
    const yearMatch = yearText.match(/\b(19|20)\d{2}\b/);
    card.dataset.year = yearMatch ? parseInt(yearMatch[0]) : 0;
  });

  gallerySections.forEach(section => {
    const sectionCards = Array.from(section.querySelectorAll('.car-card'));

    if (sortOrder === 'asc' || sortOrder === 'desc') {
      sectionCards.sort((a, b) => {
        const yearA = parseInt(a.dataset.year);
        const yearB = parseInt(b.dataset.year);
        return sortOrder === 'asc' ? yearA - yearB : yearB - yearA;
      });

      // Clear and re-add sorted cards
      section.innerHTML = '';
      sectionCards.forEach(card => section.appendChild(card));
    }
  });
});

// LIGHTBOX FEATURE
document.addEventListener("DOMContentLoaded", () => {
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';

  const previewImg = document.createElement('img');
  previewImg.id = 'lightbox-img';
  lightbox.appendChild(previewImg);
  document.body.appendChild(lightbox);

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
});