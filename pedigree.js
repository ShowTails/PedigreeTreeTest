// ShowTails Pedigree Builder JS
// Supports: data-field, data-chain (space separated), <img> + SVG <image>

window.addEventListener('DOMContentLoaded', () => {
  // Decode URL param and clean HTML entities
  function getParam(name) {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(name) || '';
    const urlDecoded = decodeURIComponent(raw.replace(/\+/g, ' '));

    // Decode any HTML entities (like &amp; → &)
    const ta = document.createElement('textarea');
    ta.innerHTML = urlDecoded;
    return ta.value;
  }

  function isInSVG(el) {
    return el.closest('svg') !== null;
  }

  // --- Handle single fields ---
  document.querySelectorAll('[data-field]').forEach(el => {
    const key = el.getAttribute('data-field');
    const value = getParam(key);
    if (!value) return;

    // Images
    if (el.tagName === 'IMG') {
      el.src = value;
      return;
    }
    if (el.tagName === 'IMAGE') {
      el.setAttribute('href', value);
      el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', value);
      return;
    }

  if (isInSVG(el)) {
  el.textContent = value;
} else {
  el.textContent = value;
}
  });

  // --- Handle chained fields (e.g. data-chain="name,breed,color") ---
  document.querySelectorAll('[data-chain]').forEach(el => {
    const keys = el.getAttribute('data-chain').split(',').map(s => s.trim()).filter(Boolean);
    const parts = keys.map(k => getParam(k)).filter(v => v && v.length);
    if (!parts.length) return;

    const joined = parts.join(' ');

    if (isInSVG(el)) {
      const safe = joined
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      el.innerHTML = safe;
    } else {
      el.textContent = joined;
    }
  });

  const root = document.documentElement;

  function isMobileViewport() {
    return window.innerWidth <= 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  function applyMobilePrintLayout() {
    if (!isMobileViewport()) return;

    document.body.classList.add('mobile-print');

    const container = document.getElementById('pedigree-container');
    if (!container) return;

    requestAnimationFrame(() => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const targetWidth = 10.8 * 96;
      const targetHeight = 8.3 * 96;
      const scale = Math.min(targetWidth / rect.width, targetHeight / rect.height);

      root.style.setProperty('--mobile-print-scale', String(scale));
    });
  }

  function clearMobilePrintLayout() {
    document.body.classList.remove('mobile-print');
    root.style.removeProperty('--mobile-print-scale');
  }

  const printMediaQuery = window.matchMedia ? window.matchMedia('print') : null;

  if (printMediaQuery) {
    const handlePrintChange = (event) => {
      if (event.matches) {
        applyMobilePrintLayout();
      } else {
        clearMobilePrintLayout();
      }
    };

    if (typeof printMediaQuery.addEventListener === 'function') {
      printMediaQuery.addEventListener('change', handlePrintChange);
    } else if (typeof printMediaQuery.addListener === 'function') {
      printMediaQuery.addListener(handlePrintChange);
    }
  }

  window.addEventListener('beforeprint', applyMobilePrintLayout);
  window.addEventListener('afterprint', clearMobilePrintLayout);
});
