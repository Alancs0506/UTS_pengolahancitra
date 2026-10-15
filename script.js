const colorThief = new ColorThief();

// DOM Elements
const imageInput = document.getElementById('imageInput');
const dropZone = document.getElementById('dropZone');
const previewImage = document.getElementById('previewImage');
const resultsSection = document.getElementById('resultsSection');
const dominantColor = document.getElementById('dominantColor');
const paletteGrid = document.getElementById('paletteGrid');
const colorCountSelect = document.getElementById('colorCount');
const toast = document.getElementById('toast');

imageInput.addEventListener('change', handleFileSelect);

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    imageInput.files = e.dataTransfer.files;
    handleFileSelect();
  }
});

colorCountSelect.addEventListener('change', () => {
  if (previewImage.src) extractPalette();
});

function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function getContrastColor([r, g, b]) {
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#0f172a' : '#ffffff';
}

function handleFileSelect() {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    previewImage.src = e.target.result;
    previewImage.onload = function() {
      resultsSection.classList.remove('hidden');
      extractPalette();
    };
  };
  reader.readAsDataURL(file);
}

function extractPalette() {
  // Dominant Color
  const dominantRgb = colorThief.getColor(previewImage);
  const dominantHex = rgbToHex(dominantRgb);
  const textColor = getContrastColor(dominantRgb);

  dominantColor.style.backgroundColor = dominantHex;
  dominantColor.innerHTML = `
    <span class="hex-title" style="color: ${textColor}">${dominantHex}</span>
    <span class="rgb-sub" style="color: ${textColor}">RGB(${dominantRgb.join(', ')})</span>
  `;
  dominantColor.onclick = () => copyToClipboard(dominantHex);

  // Color Palette
  const count = parseInt(colorCountSelect.value);
  const paletteRgb = colorThief.getPalette(previewImage, count);

  paletteGrid.innerHTML = '';
  paletteRgb.forEach(rgb => {
    const hex = rgbToHex(rgb);
    const card = document.createElement('div');
    card.className = 'color-card';
    card.onclick = () => copyToClipboard(hex);

    card.innerHTML = `
      <div class="color-swatch" style="background-color: ${hex};"></div>
      <div class="color-info">
        <span class="code-hex">${hex}</span>
        <span class="code-rgb">RGB(${rgb.join(', ')})</span>
      </div>
    `;
    paletteGrid.appendChild(card);
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> Kode ${text} berhasil disalin!`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  });
}