function getIdsFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const idsParam = params.get('ids');
  if (!idsParam) return [];
  return idsParam.split(',').map(id => id.trim()).filter(Boolean);
}

function getDifferencesFlagFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('diff') === '1';
}

function getIdsToCompare() {
  const fromQuery = getIdsFromQuery();
  if (fromQuery.length) {
    localStorage.setItem('compareCarIds', JSON.stringify(fromQuery));
    return fromQuery;
  }
  return JSON.parse(localStorage.getItem('compareCarIds') || '[]');
}

function normalizeFallbackRow(car) {
  return {
    id: car.id,
    model: car['CAR MODEL'] || '',
    brand: car.BRAND || '',
    year: Number(car.YEAR) || '',
    engine: car.ENGINE || '',
    topSpeed: car['TOP SPEED'] || '',
    price: car.PRICE || '',
    description: car.DESCRIPTION || '',
    imagePath: car['IMAGE PATH'] || ''
  };
}

async function fetchCarsByIds(ids) {
  try {
    const responses = await Promise.all(ids.map(id => fetch(`/api/cars/${encodeURIComponent(id)}`)));
    const okResponses = responses.filter(response => response.ok);
    if (okResponses.length === ids.length) {
      return Promise.all(okResponses.map(response => response.json()));
    }
  } catch {
    // fallback below
  }

  const fallbackData = await fetch('cars.json').then(r => r.json());
  return ids
    .map(id => fallbackData.find(row => row.id === id))
    .filter(Boolean)
    .map(normalizeFallbackRow);
}

function buildRows(cars) {
  return [
    { label: 'Image', values: cars.map(car => `<img src="${car.imagePath || ''}" alt="${car.model || ''}">`) },
    { label: 'Brand', values: cars.map(car => car.brand || 'N/A') },
    { label: 'Year', values: cars.map(car => car.year || 'N/A'), metricType: 'max' },
    { label: 'Engine', values: cars.map(car => car.engine || 'N/A') },
    { label: 'Top Speed', values: cars.map(car => car.topSpeed || 'N/A'), metricType: 'max' },
    { label: 'Price', values: cars.map(car => car.price || 'N/A'), metricType: 'min' },
    { label: 'Description', values: cars.map(car => car.description || 'N/A') }
  ];
}

function isDifferentRow(row) {
  const comparable = row.values.map(v => String(v).replace(/<[^>]+>/g, '').trim());
  return new Set(comparable).size > 1;
}

function numericValue(value) {
  const number = parseFloat(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(number) ? number : null;
}

function getBestIndices(row) {
  if (!row.metricType) return [];
  const parsed = row.values.map(numericValue);
  const valid = parsed.filter(v => v !== null);
  if (!valid.length) return [];
  const target = row.metricType === 'min' ? Math.min(...valid) : Math.max(...valid);
  return parsed.map((v, idx) => (v === target ? idx : -1)).filter(idx => idx !== -1);
}

function renderComparisonTable(cars, differencesOnly) {
  const rows = buildRows(cars).filter(row => !differencesOnly || isDifferentRow(row));
  const table = `
    <table class="compare-table">
      <tr>
        <th>Field</th>
        ${cars.map(car => `<th>${car.model || car.name || 'Car'}</th>`).join('')}
      </tr>
      ${rows.map(row => `
        <tr>
          <td>${row.label}</td>
          ${row.values.map((value, idx) => {
            const isBest = getBestIndices(row).includes(idx);
            return `<td class="${isBest ? 'best-cell' : ''}">${value}${isBest ? '<span class="best-badge">Best</span>' : ''}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </table>
  `;
  document.getElementById('compareTable').innerHTML = table;
}

async function initComparePage() {
  const carIds = getIdsToCompare();
  if (!carIds.length) {
    document.getElementById('compareTable').innerHTML = '<p>No car data available.</p>';
    return;
  }

  const cars = await fetchCarsByIds(carIds);
  if (!cars.length) {
    document.getElementById('compareTable').innerHTML = '<p>No car data available.</p>';
    return;
  }

  const toggle = document.getElementById('differencesOnlyToggle');
  const shareBtn = document.getElementById('copyShareLinkBtn');
  const exportImageBtn = document.getElementById('exportImageBtn');
  const exportPdfBtn = document.getElementById('exportPdfBtn');

  const initialDiff = getDifferencesFlagFromQuery();
  if (toggle) toggle.checked = initialDiff;
  renderComparisonTable(cars, initialDiff);

  toggle?.addEventListener('change', () => {
    renderComparisonTable(cars, toggle.checked);
  });

  shareBtn?.addEventListener('click', async () => {
    const diffState = toggle?.checked ? '&diff=1' : '';
    const shareUrl = `${window.location.origin}/compare.html?ids=${encodeURIComponent(carIds.join(','))}${diffState}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      shareBtn.textContent = 'Link Copied';
      setTimeout(() => { shareBtn.textContent = 'Copy Share Link'; }, 1400);
    } catch {
      window.prompt('Copy this link:', shareUrl);
    }
  });

  async function exportComparisonAsImage() {
    const tableContainer = document.getElementById('compareTable');
    if (!tableContainer) return;
    const canvas = await window.html2canvas(tableContainer, {
      backgroundColor: '#0d0d0d',
      scale: 2
    });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'car-comparison.png';
    link.click();
  }

  exportImageBtn?.addEventListener('click', async () => {
    exportImageBtn.disabled = true;
    exportImageBtn.textContent = 'Exporting...';
    try {
      await exportComparisonAsImage();
    } finally {
      exportImageBtn.disabled = false;
      exportImageBtn.textContent = 'Export Image';
    }
  });

  exportPdfBtn?.addEventListener('click', () => {
    window.print();
  });
}

window.onload = initComparePage;