/* Setzt Hell/Dunkel sofort beim Laden der Seite (verhindert Aufblitzen) */
(function () {
  var t = 'light';
  try { t = localStorage.getItem('ls25_theme') || 'light'; } catch (e) {}
  document.documentElement.setAttribute('data-bs-theme', t === 'dark' ? 'dark' : 'light');
})();
