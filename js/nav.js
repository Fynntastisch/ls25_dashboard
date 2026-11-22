/* Gemeinsame Navigation und Passwort-Dialog für alle Seiten (erst nach init() aufrufen) */
function navLinks(active) {
  if (!ME) return '';
  const today = new Date().toLocaleDateString('sv');
  const late = DATA.tasks.filter(t => t.due && t.due < today && t.status !== 'Erledigt' && (ME.role === 'chef' || (t.assignees || []).includes(ME.name))).length;
  const items = [['uebersicht.html', 'Übersicht', 'uebersicht', 'house-door']];
  if (can('vehicles', 'view')) items.push(['dashboard.html', 'Fuhrpark', 'fuhrpark', 'truck']);
  if (can('tasks', 'view')) items.push(['aufgaben.html', 'Aufgaben', 'aufgaben', 'clipboard-check']);
  if (can('posts', 'view')) items.push(['infos.html', 'Infos', 'infos', 'info-circle']);
  if (ME.role === 'chef' || ME.role === 'dev') {
    items.push(['mitarbeiter.html', 'Mitarbeiter', 'mitarbeiter', 'people']);
    items.push(['logs.html', 'Protokoll', 'logs', 'journal-text']);
  }
  return items.map(([h, n, k, i]) =>
    `<a class="navi${k === active ? ' active' : ''}" href="${h}"${k === active ? ' aria-current="page"' : ''}><i class="bi bi-${i}" aria-hidden="true"></i><span>${n}</span>${k === 'aufgaben' && late ? ` <span class="badge text-bg-danger" title="Überfällige Aufgaben">${late}</span>` : ''}</a>`).join('');
}

/* Obere Leiste (Bootstrap-Navbar): am PC alles in einer Zeile, auf Handy und Tablet Hamburger-Button mit aufklappbarem Menü */
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function topbarHtml(active, title, opts = {}) {
  const who = escapeHtml(dispName(ME.name)) + ' (' + escapeHtml(ME.role) + ')';
  const farm = opts.farmSwitch ? '<button class="btn btn-sm btn-outline-light" onclick="S.farm=null;S.cat=\'Alle\';render()"><i class="bi bi-arrow-left-right" aria-hidden="true"></i> Farm wechseln</button>' : '';
  const acts = farm + '<button class="btn btn-sm btn-outline-light" onclick="openPw()"><i class="bi bi-key" aria-hidden="true"></i> Passwort</button><button class="btn btn-sm btn-hay" onclick="logout()">Abmelden <i class="bi bi-box-arrow-right" aria-hidden="true"></i></button>';
  return `<nav class="navbar navbar-expand-lg topbar" data-bs-theme="dark" aria-label="Hauptmenü">
  <div class="${opts.fluid ? 'container-fluid px-3 px-lg-4' : 'container'} gap-2">
    <a class="navbar-brand brand" href="uebersicht.html" title="Zur Übersicht"><img class="brand-logo" src="img/logo-nav.png" alt="Elmcreek Ranch, zur Übersicht"></a>
    <button class="navbar-toggler order-2" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Menü öffnen oder schließen"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse order-3 order-lg-0" id="navMenu">
      <div class="navl d-flex flex-column flex-lg-row me-lg-auto py-2 py-lg-0">${navLinks(active)}</div>
      <div class="menu-actions d-lg-none vstack gap-2 pt-2 border-top border-secondary">${acts}</div>
    </div>
    <a class="who small order-1 order-lg-0 ms-auto ms-lg-0" href="einstellungen.html" title="Einstellungen und Profilbild">${avatarHtml(ME, 28)} <span>${who}</span></a>
    <div class="d-none d-lg-flex align-items-center gap-2">${acts}</div>
  </div>
</nav>`;
}

/* Leiste neu aufbauen, z. B. nach dem Ändern des Profilbilds */
function refreshTopbar(active, title, opts) {
  const el = document.querySelector('nav.topbar');
  if (el) el.outerHTML = topbarHtml(active, title, opts);
}

/* Platzhalter (Bootstrap „placeholder“) für alles, was erst geladen werden muss */
const skel = {
  loading: '<span class="visually-hidden">Wird geladen …</span>',
  topbar() {
    return `<nav class="navbar topbar" aria-hidden="true"><div class="container py-1"><img class="brand-logo" src="img/logo-nav.png" alt="">
      <span class="placeholder-glow d-none d-lg-flex gap-3 ms-4 me-auto"><span class="placeholder rounded" style="width:90px;height:22px"></span><span class="placeholder rounded" style="width:80px;height:22px"></span><span class="placeholder rounded" style="width:90px;height:22px"></span></span>
      <span class="placeholder-glow ms-auto"><span class="placeholder rounded-pill" style="width:130px;height:28px"></span></span></div></nav>`;
  },
  rows(n = 3) {
    return `<div class="placeholder-glow" role="status">${this.loading}${Array.from({ length: n }, () => '<div class="py-2 border-bottom"><span class="placeholder col-7"></span><span class="placeholder col-2 ms-2"></span></div>').join('')}</div>`;
  },
  tiles(n = 4) {
    return Array.from({ length: n }, () => '<div class="placeholder-glow"><span class="placeholder tile-ph"></span></div>').join('');
  },
  table(rows = 5) {
    return `<div class="placeholder-glow" role="status">${this.loading}<span class="placeholder col-12 mb-3" style="height:1.6rem"></span>${Array.from({ length: rows }, () => '<span class="placeholder col-12 mb-2" style="height:1.9rem"></span>').join('')}</div>`;
  },
  cards(n = 3) {
    return Array.from({ length: n }, () => '<div class="post placeholder-glow" role="status"><span class="placeholder col-6 mb-2" style="height:1.5rem"></span><span class="placeholder col-4 d-block mb-3"></span><span class="placeholder col-12 d-block"></span><span class="placeholder col-10 d-block"></span></div>').join('');
  },
  board() {
    const col = '<div class="col-status placeholder-glow"><span class="placeholder col-5 mb-3 d-block" style="height:1.4rem"></span><div class="card-task"><span class="placeholder col-8 d-block mb-2"></span><span class="placeholder col-5"></span></div><div class="card-task"><span class="placeholder col-7 d-block mb-2"></span><span class="placeholder col-4"></span></div></div>';
    return `<div class="row g-3" role="status">${this.loading}${[1, 2, 3].map(() => `<div class="col-md-4">${col}</div>`).join('')}</div>`;
  },
  accordion(n = 3) {
    return Array.from({ length: n }, () => '<div class="accordion-item placeholder-glow p-3" role="status"><span class="placeholder col-4"></span><span class="placeholder col-2 ms-2"></span></div>').join('');
  },
  fleet() {
    return `<div class="page-head mb-3 placeholder-glow" role="status">${this.loading}<span class="placeholder rounded-3" style="width:48px;height:48px"></span><span class="placeholder col-3" style="height:1.8rem"></span></div><div class="panel p-3">${this.table(6)}</div>`;
  }
};

/* Kurze Meldung unten rechts (Bootstrap-Toast), verschwindet nach ein paar Sekunden */
function showToast(msg, kind = 'success') {
  let box = document.getElementById('toastBox');
  if (!box) {
    document.body.insertAdjacentHTML('beforeend', '<div id="toastBox" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index:1090"></div>');
    box = document.getElementById('toastBox');
  }
  const el = document.createElement('div');
  el.className = 'toast align-items-center border-0 text-bg-' + kind;
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  el.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Schließen"></button></div>';
  el.querySelector('.toast-body').textContent = msg;
  box.appendChild(el);
  el.addEventListener('hidden.bs.toast', () => el.remove());
  new bootstrap.Toast(el, { delay: 4000 }).show();
}

function openPw() {
  if (!document.getElementById('pwModal')) {
    document.body.insertAdjacentHTML('beforeend', `
<div class="modal fade" id="pwModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-dialog-scrollable modal-fullscreen-sm-down"><form class="modal-content" onsubmit="savePw(event)">
  <div class="modal-header"><h5 class="modal-title">Passwort ändern</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Schließen"></button></div>
  <div class="modal-body vstack gap-3">
    <div><label class="form-label" for="pwOld">Aktuelles Passwort</label><input class="form-control" type="password" id="pwOld" required autocomplete="current-password"></div>
    <div><label class="form-label" for="pwNew">Neues Passwort (mindestens 6 Zeichen)</label><input class="form-control" type="password" id="pwNew" required minlength="6" autocomplete="new-password"></div>
    <p class="text-danger small mb-0" id="pwErr" hidden></p>
  </div>
  <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Abbrechen</button><button class="btn btn-hay">Speichern</button></div>
</form></div></div>`);
  }
  document.getElementById('pwOld').value = '';
  document.getElementById('pwNew').value = '';
  document.getElementById('pwErr').hidden = true;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('pwModal')).show();
}

async function savePw(e) {
  e.preventDefault();
  const err = document.getElementById('pwErr');
  const fail = m => { err.textContent = m; err.hidden = false; };
  const { error: e1 } = await sb.auth.signInWithPassword({ email: emailOf(ME.name), password: document.getElementById('pwOld').value });
  if (e1) return fail('Das aktuelle Passwort stimmt nicht.');
  const { error: e2 } = await sb.auth.updateUser({ password: document.getElementById('pwNew').value });
  if (e2) return fail(e2.message);
  bootstrap.Modal.getOrCreateInstance(document.getElementById('pwModal')).hide();
  showToast('Dein Passwort wurde erfolgreich geändert.');
}
