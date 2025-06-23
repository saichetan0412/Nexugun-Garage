// compare.js
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function renderComparison() {
  const carsToCompare = JSON.parse(localStorage.getItem('compareCars') || '[]');
  if (!carsToCompare.length) {
    document.getElementById('compareTable').innerHTML = '<p>No car data available.</p>';
    return;
  }

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

  document.getElementById('compareTable').innerHTML = table;
}

window.onload = renderComparison;