/* Gemeinsamer Datenzugriff (Supabase) für alle Seiten.
   Seiten rufen init() auf und arbeiten danach mit DATA (users, vehicles, tasks).
   store.save(data) gleicht Änderungen an Fahrzeugen und Aufgaben mit der Datenbank ab. */
/* Die Anmeldung liegt nur im sessionStorage: Schließt man Tab oder Fenster, ist man automatisch abgemeldet. */
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { storage: window.sessionStorage } });
/* Aus einem Namen wie "Max Müller" wird der Login-Name "max.mueller" (klein, ohne Leerzeichen und Umlaute) */
function loginName(n) {
  return String(n).trim().toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/\s+/g, '.');
}
const emailOf = n => `${loginName(n)}@${EMAIL_DOMAIN}`;

let ME = null, DATA = null;
const UIDS = {}, NAMES = {}, SNAP = { vehicles: new Map(), tasks: new Map(), posts: new Map() };
const getSessionUser = () => ME;

/* Anzeigename zu einem Benutzernamen (ohne Anzeigenamen bleibt der Benutzername) */
function dispName(n) {
  const u = DATA && DATA.users.find(x => x.name === n);
  return (u && u.display) || n;
}

/* Einzelrechte: Der Chef darf immer alles */
function can(area, action) {
  return !!ME && (ME.role === 'chef' || !!(ME.perms && ME.perms[area] && ME.perms[area][action] === true));
}

/* Umwandlung zwischen Datenbank und Seite */
const vRow = v => ({ id: v.id, farm: v.farm, cat: v.cat, marke: v.marke, modell: v.modell, kz: v.kz, gebiet: v.gebiet || '' });
const vLocal = r => ({ id: r.id, farm: r.farm, cat: r.cat, marke: r.marke, modell: r.modell, kz: r.kz, gebiet: r.gebiet || '' });
const tRow = (t, vids) => ({
  id: t.id, title: t.title, descr: t.desc || '', status: t.status, assignee: UIDS[t.assignee] || null,
  due: t.due || null, prio: t.prio, farm: t.farm, vehicle: vids.has(t.vehicle) ? t.vehicle : null,
  labels: t.labels || [], checklist: t.checklist || []
});
const tLocal = r => ({
  id: r.id, title: r.title, desc: r.descr || '', status: r.status, assignee: NAMES[r.assignee] || '',
  due: r.due || '', prio: r.prio, farm: r.farm, vehicle: r.vehicle, labels: r.labels || [], checklist: r.checklist || []
});

const pRow = p => ({ id: p.id, title: p.title, body: p.body || '', author: UIDS[p.author] || null, created_at: p.created, updated_at: p.updated });
const pLocal = r => ({ id: r.id, title: r.title, body: r.body || '', author: NAMES[r.author] || '', created: r.created_at, updated: r.updated_at, edited: NAMES[r.edited_by] || '' });

function takeSnapshot() {
  const vids = new Set(DATA.vehicles.map(v => v.id));
  SNAP.vehicles = new Map(DATA.vehicles.map(v => [v.id, JSON.stringify(vRow(v))]));
  SNAP.tasks = new Map(DATA.tasks.map(t => [t.id, JSON.stringify(tRow(t, vids))]));
  SNAP.posts = new Map(DATA.posts.map(p => [p.id, JSON.stringify(pRow(p))]));
}

async function init(opts = {}) {
  const never = new Promise(() => {});
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { location.replace('index.html'); return never; }

  const { data: me } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  if (!me || !me.active) { await sb.auth.signOut(); location.replace('index.html?gesperrt=1'); return never; }

  const [pr, ve, ta, po] = await Promise.all([
    sb.from('profiles').select('*').order('username'),
    sb.from('vehicles').select('*').order('id'),
    sb.from('tasks').select('*').order('id'),
    sb.from('posts').select('*').order('id')   /* fehlt die Tabelle noch, bleibt die Liste einfach leer */
  ]);
  const err = pr.error || ve.error || ta.error;
  if (err) { alert('Die Daten konnten nicht geladen werden: ' + err.message); return never; }

  const users = pr.data.map(u => ({ id: u.id, name: u.username, role: u.role, farm: u.farm, dept: u.dept, perms: u.perms, active: u.active, display: u.display_name || '' }));
  users.forEach(u => { UIDS[u.name] = u.id; NAMES[u.id] = u.name; });
  ME = users.find(u => u.id === me.id);
  DATA = { users, vehicles: ve.data.map(vLocal), tasks: ta.data.map(tLocal), posts: (po.error ? [] : po.data).map(pLocal) };
  takeSnapshot();

  if (opts.roles && !opts.roles.includes(ME.role)) { location.replace('dashboard.html'); return never; }
  return DATA;
}

/* Änderungen (neu, geändert, gelöscht) an die Datenbank schicken */
async function pushChanges(d) {
  const vids = new Set(d.vehicles.map(v => v.id));
  const tables = [['vehicles', d.vehicles, vRow], ['tasks', d.tasks, t => tRow(t, vids)], ['posts', d.posts || [], pRow]];
  for (const [table, list, toRow] of tables) {
    const snap = SNAP[table];
    const cur = new Map(list.map(x => { const r = toRow(x); return [r.id, r]; }));
    const del = [...snap.keys()].filter(id => !cur.has(id));
    const add = [], upd = [];
    for (const [id, r] of cur) {
      if (!snap.has(id)) add.push(r);
      else if (snap.get(id) !== JSON.stringify(r)) upd.push(r);
    }
    if (add.length) { const { error } = await sb.from(table).insert(add); if (error) throw error; }
    for (const r of upd) { const { error } = await sb.from(table).update(r).eq('id', r.id); if (error) throw error; }
    if (del.length) { const { error } = await sb.from(table).delete().in('id', del); if (error) throw error; }
    SNAP[table] = new Map([...cur].map(([id, r]) => [id, JSON.stringify(r)]));
  }
}

let chain = Promise.resolve();
const store = {
  save(d) {
    chain = chain.then(() => pushChanges(d)).catch(e => {
      alert('Das konnte nicht gespeichert werden (' + (e.message || e) + '). Die Seite wird neu geladen.');
      location.reload();
    });
    return chain;
  }
};
