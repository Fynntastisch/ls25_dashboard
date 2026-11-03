const loginForm = document.getElementById('loginForm');
const errorBox = document.getElementById('loginError');
const showError = m => { errorBox.textContent = m; errorBox.hidden = false; };

// Schon angemeldet? Dann direkt weiter. Gesperrte Accounts bekommen einen Hinweis.
(async () => {
  const { data: { session } } = await sb.auth.getSession();
  if (session) { location.replace('uebersicht.html'); return; }
  if (new URLSearchParams(location.search).has('gesperrt')) {
    showError('Dein Account ist noch nicht freigeschaltet oder wurde gesperrt. Frag den Chef.');
  }
})();

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.hidden = true;
  const btn = loginForm.querySelector('button[type=submit]');
  btn.disabled = true;
  const name = document.getElementById('loginUser').value.trim();
  const pw = document.getElementById('loginPassword').value;
  const { error } = await sb.auth.signInWithPassword({ email: emailOf(name), password: pw });
  btn.disabled = false;
  if (error) { showError('Benutzername oder Passwort stimmt nicht.'); return; }
  location.href = 'uebersicht.html';
});
