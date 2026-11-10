/* Gemeinsame Navigation und Passwort-Dialog für alle Seiten (erst nach init() aufrufen) */
function navLinks(active) {
  if (!ME) return '';
  const today = new Date().toLocaleDateString('sv');
  const late = DATA.tasks.filter(t => t.due && t.due < today && t.status !== 'Erledigt' && (ME.role === 'chef' || t.assignee === ME.name)).length;
  const items = [['uebersicht.html', 'Übersicht', 'uebersicht']];
  if (can('vehicles', 'view')) items.push(['dashboard.html', 'Fuhrpark', 'fuhrpark']);
  if (can('tasks', 'view')) items.push(['aufgaben.html', 'Aufgaben', 'aufgaben']);
  if (can('posts', 'view')) items.push(['infos.html', 'Infos', 'infos']);
  if (ME.role === 'chef' || ME.role === 'dev') {
    items.push(['mitarbeiter.html', 'Mitarbeiter', 'mitarbeiter']);
    items.push(['logs.html', 'Protokoll', 'logs']);
  }
  return items.map(([h, n, k]) =>
    `<a class="btn btn-sm ${k === active ? 'btn-hay' : 'btn-outline-light'}" href="${h}">${n}${k === 'aufgaben' && late ? ` <span class="badge text-bg-danger" title="Überfällige Aufgaben">${late}</span>` : ''}</a>`).join('');
}

/* Obere Leiste (Bootstrap-Navbar): am PC alles in einer Zeile, auf dem Handy Hamburger-Button und aufklappbares Menü */
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function topbarHtml(active, title, opts = {}) {
  const who = escapeHtml(dispName(ME.name)) + ' (' + escapeHtml(ME.role) + ')';
  const farm = opts.farmSwitch ? '<button class="btn btn-sm btn-outline-light" onclick="S.farm=null;S.cat=\'Alle\';render()">Farm wechseln</button>' : '';
  const acts = farm + '<button class="btn btn-sm btn-outline-light" onclick="openPw()">Passwort</button><button class="btn btn-sm btn-hay" onclick="logout()">Abmelden</button>';
  return `<nav class="navbar navbar-expand-md topbar" data-bs-theme="dark">
  <div class="${opts.fluid ? 'container-fluid px-3 px-md-4' : 'container'} gap-2">
    <a class="navbar-brand brand mb-0 py-0 fs-6 d-flex align-items-center gap-2" href="uebersicht.html" title="Zur Übersicht"><img class="brand-logo" src="img/logo-nav.png" alt="Elmcreek Ranch"><span class="opacity-75 fw-normal">${title ? '· ' + escapeHtml(title) : ''}</span></a>
    <button class="navbar-toggler order-2" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Menü öffnen oder schließen"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse order-3 order-md-0" id="navMenu">
      <div class="navl d-flex flex-column flex-md-row gap-1 me-md-auto py-2 py-md-0">${navLinks(active)}</div>
      <div class="menu-actions d-md-none vstack gap-1 border-top border-secondary pt-2">${acts}</div>
    </div>
    <span class="who small opacity-75 order-1 order-md-0 ms-auto ms-md-0">${who}</span>
    <div class="d-none d-md-flex align-items-center gap-2">${acts}</div>
  </div>
</nav>`;
}

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
