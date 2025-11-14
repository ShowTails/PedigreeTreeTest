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

    el.textContent = value;
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

  const PX_PER_INCH = 96;

  function pxToInches(px) {
    return `${(px / PX_PER_INCH).toFixed(4)}in`;
  }

  function applyMobilePrintLayout() {
    if (!isMobileViewport()) return;

    const svg = document.getElementById('pedigree-svg');
    if (!svg) return;

    document.body.classList.add('mobile-print');

    const portraitQuery = window.matchMedia && window.matchMedia('(orientation: portrait)');
    if (portraitQuery && portraitQuery.matches) {
      document.body.classList.add('mobile-landscape-device');
    } else {
      document.body.classList.remove('mobile-landscape-device');
    }

    requestAnimationFrame(() => {
      const targetWidth = 10.8 * PX_PER_INCH;
      const targetHeight = 8.3 * PX_PER_INCH;

      let aspectRatio = 1;
      const viewBox = svg.viewBox && svg.viewBox.baseVal;
      if (viewBox && viewBox.width && viewBox.height) {
        aspectRatio = viewBox.width / viewBox.height;
      } else {
        const rect = svg.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        aspectRatio = rect.width / rect.height;
      }

      let desiredWidth = targetWidth;
      let desiredHeight = desiredWidth / aspectRatio;

      if (desiredHeight > targetHeight) {
        desiredHeight = targetHeight;
        desiredWidth = desiredHeight * aspectRatio;
      }

      root.style.setProperty('--print-container-width', pxToInches(desiredWidth));
      root.style.setProperty('--print-container-height', pxToInches(desiredHeight));
      root.style.setProperty('--print-svg-width', pxToInches(desiredWidth));
      root.style.setProperty('--print-svg-height', pxToInches(desiredHeight));
    });
  }

  function clearMobilePrintLayout() {
    document.body.classList.remove('mobile-print');
    document.body.classList.remove('mobile-landscape-device');
    root.style.removeProperty('--print-container-width');
    root.style.removeProperty('--print-container-height');
    root.style.removeProperty('--print-svg-width');
    root.style.removeProperty('--print-svg-height');
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
