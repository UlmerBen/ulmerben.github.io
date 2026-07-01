/**
 * Gemeinsame Bestenliste für die Seminar-Spiele – Google Apps Script Web App.
 *
 * Unterstützt MEHRERE Spiele über den Parameter `game`:
 *   - "memory" (Standard): wenigste Züge, bei Gleichstand schnellere Zeit
 *   - "skalen": meiste Punkte, bei Gleichstand schnellere Zeit
 *
 * Jedes Spiel schreibt in ein eigenes Tabellenblatt. Eine einzige
 * Bereitstellung (/exec-URL) bedient alle Spiele.
 *
 * Einrichtung: siehe SETUP.md
 * WICHTIG: Nach dem Einfügen dieses Codes unter
 *   Bereitstellen → Bereitstellungen verwalten → (Stift) → Neue Version
 * eine neue Version veröffentlichen. Die /exec-URL bleibt gleich.
 */

var MAX_RETURN = 10;

// Konfiguration pro Spiel: Tabellenblatt, Spalten und Sortierung.
var GAMES = {
  memory: {
    sheet: 'Bestenliste',
    header: ['name', 'moves', 'time', 'date'],
    parse: function (d) {
      var moves = parseInt(d.moves, 10);
      var time = parseInt(d.time, 10);
      if (isNaN(moves) || isNaN(time)) return null;
      return { name: cleanName_(d.name), moves: moves, time: time };
    },
    row: function (o) { return [o.name, o.moves, o.time, new Date()]; },
    map: function (r) { return { name: String(r[0]), moves: Number(r[1]), time: Number(r[2]) }; },
    sort: function (a, b) { return a.moves - b.moves || a.time - b.time; }
  },
  skalen: {
    sheet: 'Skalenniveau',
    header: ['name', 'score', 'time', 'date'],
    parse: function (d) {
      var score = parseInt(d.score, 10);
      var time = parseInt(d.time, 10);
      if (isNaN(score) || isNaN(time)) return null;
      return { name: cleanName_(d.name), score: score, time: time };
    },
    row: function (o) { return [o.name, o.score, o.time, new Date()]; },
    map: function (r) { return { name: String(r[0]), score: Number(r[1]), time: Number(r[2]) }; },
    sort: function (a, b) { return b.score - a.score || a.time - b.time; }
  }
};

function cleanName_(n) { return String(n || 'Anonym').substring(0, 18); }

function gameCfg_(name) { return GAMES[name] || GAMES.memory; }

function getSheet_(cfg) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(cfg.sheet);
  if (!sheet) {
    sheet = ss.insertSheet(cfg.sheet);
    sheet.appendRow(cfg.header);
  }
  return sheet;
}

/** Liefert die sortierte Top-Liste als JSON (GET, optional ?game=...). */
function doGet(e) {
  var cfg = gameCfg_(e && e.parameter ? e.parameter.game : null);
  return json_(topList_(cfg));
}

/** Nimmt ein neues Ergebnis entgegen (POST mit JSON-Body) und gibt die neue Liste zurück. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var data = JSON.parse(e.postData.contents);
    var cfg = gameCfg_(data.game);
    var parsed = cfg.parse(data);
    if (parsed) {
      getSheet_(cfg).appendRow(cfg.row(parsed));
    }
    return json_(topList_(cfg));
  } finally {
    lock.releaseLock();
  }
}

function topList_(cfg) {
  var sheet = getSheet_(cfg);
  var values = sheet.getDataRange().getValues();
  var rows = values.slice(1); // Kopfzeile weg
  var list = rows
    .filter(function (r) { return r[0] !== '' && r[1] !== ''; })
    .map(cfg.map);
  list.sort(cfg.sort);
  return list.slice(0, MAX_RETURN);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
