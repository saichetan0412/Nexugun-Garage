// Animate all cars with staggered slide-in
function animateCars() {
  const cars = document.querySelectorAll(".animate-car");
  cars.forEach((car, index) => {
    const delay = index * 300; // 0.3s delay between cars
    car.style.animationDelay = `${delay}ms`;
    car.classList.add("show");
  });
}

// On page load, animate existing cars
document.addEventListener("DOMContentLoaded", () => {
  animateCars();
});

// Handle form submission
document.getElementById('carForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('carName').value;
  const year = document.getElementById('carYear').value;
  const desc = document.getElementById('carDesc').value;
  const image = document.getElementById('carImage').value || 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000);

  const carCard = document.createElement('div');
  carCard.className = 'car-card animate-car';  // Important: add animate-car class for animation
  carCard.innerHTML = `
    <img src="${image}" alt="${name}" />
    <h2>${name}</h2>
    <p>${year} – ${desc}</p>
  `;

  const gallery = document.getElementById('carGallery');
  gallery.appendChild(carCard);

  // Reset the form
  this.reset();

  // Animate the newly added car with delay based on current count
  const cars = document.querySelectorAll(".animate-car");
  const index = cars.length - 1;  // Index of newly added car
  const delay = index * 300;

  carCard.style.animationDelay = `${delay}ms`;
  // Remove 'show' if exists and re-add to retrigger animation
  carCard.classList.remove("show");
  setTimeout(() => {
    carCard.classList.add("show");
  }, 10); // slight delay to trigger CSS animation

  console.log("✅ Added new car and triggered animation");
});