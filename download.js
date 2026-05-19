// ─────────────────────────────────────────────
//  FormPorn — download.js
//  Requires access.js to be loaded first.
//  All download functions are access-gated.
// ─────────────────────────────────────────────

// Derive current form filename from URL
function _currentForm() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function downloadPDF(docId) {
  FP.requireAccess(_currentForm(), () => _doPDF(docId));
}

function downloadPNG(docId) {
  FP.requireAccess(_currentForm(), () => _doPNG(docId));
}

function downloadJPEG(docId) {
  FP.requireAccess(_currentForm(), () => _doJPEG(docId));
}

// ── Internal renderers ────────────────────────

function _doPDF(docId) {
  const el = document.getElementById(docId);
  if (!el) return;
  const allStyles = Array.from(document.styleSheets).map(s => {
    try { return Array.from(s.cssRules).map(r => r.cssText).join('\n'); } catch(e) { return ''; }
  }).join('\n');
  const fontLink = document.querySelector('link[href*="fonts.googleapis"]');
  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write('<!DOCTYPE html><html><head><title>Form Porn</title>');
  if (fontLink) w.document.write(fontLink.outerHTML);
  w.document.write('<style>*{box-sizing:border-box;margin:0;padding:0;}body{background:#ddd;display:flex;justify-content:center;padding:30px;}@media print{body{background:white;padding:0;}@page{margin:0.5in;}}' + allStyles + '</style></head><body>');
  w.document.write(el.outerHTML);
  w.document.write('<script>document.fonts.ready.then(()=>{setTimeout(()=>window.print(),800)});<\/script></body></html>');
  w.document.close();
}

function _doPNG(docId) {
  const el = document.getElementById(docId);
  if (!el) { alert('Generate a document first.'); return; }
  if (typeof html2canvas === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = () => _capturePNG(el);
    document.head.appendChild(s);
  } else {
    _capturePNG(el);
  }
}

function _doJPEG(docId) {
  const el = document.getElementById(docId);
  if (!el) { alert('Generate a document first.'); return; }
  if (typeof html2canvas === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    s.onload = () => _captureJPEG(el);
    document.head.appendChild(s);
  } else {
    _captureJPEG(el);
  }
}

function _capturePNG(el) {
  html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false }).then(c => {
    const a = document.createElement('a');
    a.download = 'formporn.png';
    a.href = c.toDataURL('image/png', 1.0);
    a.click();
  }).catch(() => alert('PNG failed. Use PDF instead.'));
}

function _captureJPEG(el) {
  html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false }).then(c => {
    const a = document.createElement('a');
    a.download = 'formporn.jpg';
    a.href = c.toDataURL('image/jpeg', 0.95);
    a.click();
  }).catch(() => alert('JPEG failed. Use PDF instead.'));
}
