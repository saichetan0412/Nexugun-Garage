document.getElementById('carForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('carName').value;
  const year = document.getElementById('carYear').value;
  const desc = document.getElementById('carDesc').value;
  const image = document.getElementById('carImage').value || 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000);

  const carCard = document.createElement('div');
  carCard.className = 'car-card';
  carCard.innerHTML = `
    <img src="${image}" alt="${name}" />
    <h2>${name}</h2>
    <p>${year} – ${desc}</p>
  `;

  document.getElementById('carGallery').appendChild(carCard);

  // Clear the form
  document.getElementById('carForm').reset();
});