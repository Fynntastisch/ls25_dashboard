/* App-Installation (PWA): Service Worker anmelden und Button "App installieren" steuern */
let deferredInstall = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}

function toggleInstall(show) {
  document.querySelectorAll('[data-install]').forEach(b => b.classList.toggle('d-none', !show));
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstall = e;
  if (!IS_APP) toggleInstall(true);
});

window.addEventListener('appinstalled', () => {
  deferredInstall = null;
  toggleInstall(false);
  if (typeof showToast === 'function') showToast('App installiert.');
});

async function installApp() {
  if (!deferredInstall) return;
  deferredInstall.prompt();
  try { await deferredInstall.userChoice; } catch (e) {}
  deferredInstall = null;
  toggleInstall(false);
}
