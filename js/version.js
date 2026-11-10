/* Version und Update-Hinweise. Bei jedem Update hier oben einen Eintrag ergänzen und APP_VERSION anpassen. */
const APP_VERSION = 'Beta 1.1.1';
const CHANGELOG = [
  {
    version: 'Beta 1.1.1', date: '10.11.2026', title: 'Kleine Anpassungen',
    items: [
      'Login: Formular wieder an der alten Position, das Logo steht darüber',
      'Infos: Die Kacheln zeigen auch den letzten Bearbeiter',
      'Feinschliff bei Farben und Buttons rund um die Update-Logs'
    ]
  },
  {
    version: 'Beta 1.1.0', date: '10.11.2026', title: 'Logo, Infos als Kacheln und mehr',
    items: [
      'Neues Elmcreek-Ranch-Logo in der Menüleiste und auf der Login-Seite',
      'Update-Logs: Übersicht zeigt nur den neuesten Eintrag, alle früheren stehen auf einer eigenen Seite',
      'Infos werden als Kacheln angezeigt, ein Klick öffnet den ganzen Beitrag',
      'Fuhrpark: Neue Fahrzeuge lassen sich nur für die Farm anlegen, in der man gerade ist',
      'Protokoll: Der Chef kann Einträge löschen, die älter als 3 bis 7 Tage sind'
    ]
  },
  {
    version: 'Beta 1.0.2', date: '03.11.2026', title: 'Kleine Verbesserungen',
    items: [
      'Der Titel „LS25 Dashboard“ in der Menüleiste führt zur Übersicht',
      'Aufgaben merken sich die Schalter „Meine“ und „Erledigte ausblenden“'
    ]
  },
  {
    version: 'Beta 1.0.1', date: '02.11.2026', title: 'Verbesserungen für das Handy',
    items: [
      'Neues Menü mit Hamburger-Button statt breiter Menüleiste',
      'Passwort und Abmelden liegen auf dem Handy im Menü',
      'Fuhrpark: Kategorie und Sortierung als Auswahlfelder statt Reiter und Spaltenüberschriften',
      'Listen auf dem Handy ohne Spaltenüberschriften',
      'Update-Logs mit gut sichtbaren Aufzählungspunkten'
    ]
  },
  {
    version: 'Beta 1.0.0', date: '01.11.2026', title: 'Erste Testversion',
    items: [
      'Fuhrpark pro Farm mit Kategorien, Suche und Sortierung',
      'Aufgaben als Board und Liste mit Checklisten, Labels und Fahrzeug-Verknüpfung',
      'Infos-Seite für Beiträge und Ankündigungen',
      'Mitarbeiter-Verwaltung mit Rollen (Chef, Developer, Mitarbeiter, Test) und Einzelrechten',
      'Protokoll für Chef und Developer: wer hat wann was gemacht',
      'Infos zeigen Ersteller und letzten Bearbeiter mit Datum und Uhrzeit',
      'Erledigte Aufgaben und Protokoll-Einträge werden nach 7 Tagen automatisch gelöscht',
      'Beim Schließen des Tabs oder Fensters wirst du automatisch abgemeldet',
      'Bestätigungsmeldung nach dem Ändern des Passworts',
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
