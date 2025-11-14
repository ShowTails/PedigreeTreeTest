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

  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

  if (mobileUserAgent.test(navigator.userAgent)) {
    document.body.classList.add('mobile-landscape-device');
  }
});
