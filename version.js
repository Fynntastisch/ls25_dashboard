/* Version und Update-Hinweise. Bei jedem Update hier oben einen Eintrag ergänzen und APP_VERSION anpassen. */
const APP_VERSION = 'Beta 1.0.0';
const CHANGELOG = [
  {
    version: 'Beta 1.0.0', date: '01.11.2026', title: 'Erste Testversion',
    items: [
      'Fuhrpark pro Farm mit Kategorien, Suche und Sortierung',
      'Aufgaben als Board und Liste mit Checklisten, Labels und Fahrzeug-Verknüpfung',
      'Infos-Seite für Beiträge und Ankündigungen',
      'Mitarbeiter-Verwaltung mit Rollen (Chef, Developer, Mitarbeiter, Test) und Einzelrechten',
      'Protokoll für Chef und Developer: wer hat wann was gemacht',
      'Optimiert für Handy und PC'
    ]
  }
];

/* Kleine Versionsanzeige unten mittig auf jeder Seite */
(function () {
  const css = '.app-version{position:fixed;left:50%;bottom:3px;transform:translateX(-50%);font-size:.72rem;opacity:.7;pointer-events:none;z-index:5;color:#6b5d4d}body{padding-bottom:1.5rem}';
  document.head.insertAdjacentHTML('beforeend', '<style>' + css + '</style>');
  document.body.insertAdjacentHTML('beforeend', '<div class="app-version">' + APP_VERSION + '</div>');
})();
