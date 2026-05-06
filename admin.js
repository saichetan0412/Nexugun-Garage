const form = document.getElementById('carForm');
const statusMessage = document.getElementById('statusMessage');
const carsTableBody = document.getElementById('carsTableBody');
const formTitle = document.getElementById('formTitle');
const saveBtn = document.getElementById('saveBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const refreshBtn = document.getElementById('refreshBtn');

function fields() {
  return {
    carId: document.getElementById('carId'),
    brand: document.getElementById('brand'),
    model: document.getElementById('model'),
    year: document.getElementById('year'),
    description: document.getElementById('description'),
    imagePath: document.getElementById('imagePath'),
    engine: document.getElementById('engine'),
    topSpeed: document.getElementById('topSpeed'),
    price: document.getElementById('price'),
    videoUrl: document.getElementById('videoUrl')
  };
}

function getPayload() {
  const f = fields();
  return {
    brand: f.brand.value.trim(),
    model: f.model.value.trim(),
    year: Number(f.year.value),
    description: f.description.value.trim(),
    imagePath: f.imagePath.value.trim(),
    engine: f.engine.value.trim(),
    topSpeed: f.topSpeed.value.trim(),
    price: f.price.value.trim(),
    videoUrl: f.videoUrl.value.trim()
  };
}

function resetForm() {
  form.reset();
  fields().carId.value = '';
  formTitle.textContent = 'Add New Car';
  saveBtn.textContent = 'Create Car';
}

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? '#ff8e8e' : '#ffca57';
}

function fillForm(car) {
  const f = fields();
  f.carId.value = car.id;
  f.brand.value = car.brand || '';
  f.model.value = car.model || '';
  f.year.value = car.year || '';
  f.description.value = car.description || '';
  f.imagePath.value = car.imagePath || '';
  f.engine.value = car.engine || '';
  f.topSpeed.value = car.topSpeed || '';
  f.price.value = car.price || '';
  f.videoUrl.value = car.videoUrl || '';
  formTitle.textContent = `Edit: ${car.model}`;
  saveBtn.textContent = 'Update Car';
}

async function fetchCars() {
  const response = await fetch('/api/cars');
  if (!response.ok) throw new Error('Failed to fetch cars');
  return response.json();
}

async function renderTable() {
  const cars = await fetchCars();
  carsTableBody.innerHTML = cars.map(car => `
    <tr>
      <td>${car.model}</td>
      <td>${car.brand}</td>
      <td>${car.year}</td>
      <td>${car.price || 'N/A'}</td>
      <td>
        <div class="action-buttons">
          <button class="edit-btn" data-id="${car.id}">Edit</button>
          <button class="delete-btn" data-id="${car.id}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');

  carsTableBody.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      const response = await fetch(`/api/cars/${encodeURIComponent(id)}`);
      if (!response.ok) {
        setStatus('Unable to load car details.', true);
        return;
      }
      fillForm(await response.json());
    });
  });

  carsTableBody.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      if (!window.confirm('Delete this car?')) return;
      const response = await fetch(`/api/cars/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) {
        setStatus('Delete failed.', true);
        return;
      }
      setStatus('Car deleted.');
      if (fields().carId.value === id) resetForm();
      await renderTable();
    });
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const f = fields();
  const id = f.carId.value.trim();
  const payload = getPayload();
  const isEdit = Boolean(id);

  const response = await fetch(isEdit ? `/api/cars/${encodeURIComponent(id)}` : '/api/cars', {
    method: isEdit ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    setStatus(err.error || 'Save failed.', true);
    return;
  }

  setStatus(isEdit ? 'Car updated.' : 'Car created.');
  resetForm();
  await renderTable();
});

cancelEditBtn.addEventListener('click', () => {
  resetForm();
  setStatus('Edit cancelled.');
});

refreshBtn.addEventListener('click', async () => {
  await renderTable();
  setStatus('List refreshed.');
});

window.addEventListener('DOMContentLoaded', async () => {
  try {
    await renderTable();
    setStatus('Admin console ready.');
  } catch (error) {
    setStatus(error.message || 'Failed to load admin data.', true);
  }
});
