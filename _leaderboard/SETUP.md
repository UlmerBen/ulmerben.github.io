# Geteilte Bestenliste über Google Sheet einrichten

So bekommt das Memory-Spiel eine **gemeinsame** Bestenliste, die alle
Studierenden sehen (statt nur lokal pro Browser). Dauer: ~10 Minuten,
kostenlos, kein zusätzliches Konto.

## 1. Tabelle anlegen
1. Öffne <https://sheets.google.com> und erstelle eine **neue Tabelle**,
   z. B. „Memory Bestenliste".

## 2. Apps Script einfügen
1. In der Tabelle: Menü **Erweiterungen → Apps Script**.
2. Lösche den vorhandenen Beispielcode und füge den **kompletten Inhalt
   von `Code.gs`** (in diesem Ordner) ein.
3. Speichern (Disketten-Symbol).

## 3. Als Web-App veröffentlichen
1. Oben rechts **Bereitstellen → Neue Bereitstellung**.
2. Zahnrad neben „Typ auswählen" → **Web-App**.
3. Einstellungen:
   - *Beschreibung:* beliebig (z. B. „Memory Bestenliste")
   - *Ausführen als:* **Ich** (dein Konto)
   - *Zugriff:* **Jeder** (auch „jeder, anonym", je nach Wortlaut)
4. **Bereitstellen** → beim ersten Mal Google-Berechtigungen bestätigen
   (ggf. „Erweitert → Trotzdem fortfahren", da es deine eigene App ist).
5. Kopiere die **Web-App-URL**. Sie endet auf `/exec`, z. B.
   `https://script.google.com/macros/s/AKfy.../exec`

## 4. URL ins Spiel eintragen
1. Öffne `slides/memory-grundbegriffe.html`.
2. Suche die Zeile:
   ```js
   const LEADERBOARD_URL = "";
   ```
3. Trage die kopierte `/exec`-URL ein:
   ```js
   const LEADERBOARD_URL = "https://script.google.com/macros/s/AKfy.../exec";
   ```
4. Speichern, dann die Website neu bauen:
   ```bash
   quarto render
   ```

Fertig. Ab jetzt landen alle Ergebnisse in der Tabelle (Tab „Bestenliste"),
und das Spiel zeigt die gemeinsamen Top 10.

## Beide Spiele über dieselbe URL (Memory + Skalenniveau)

Der aktuelle `Code.gs` bedient **beide** Spiele über **eine** Bereitstellung.
Unterschieden wird per `game`-Parameter; jedes Spiel schreibt in ein eigenes
Tabellenblatt:

- **Memory** → Tab „Bestenliste" (wenigste Züge)
- **Skalenniveau** → Tab „Skalenniveau" (meiste Punkte, dann schnellste Zeit) —
  wird beim ersten Eintrag automatisch angelegt.

Die `LEADERBOARD_URL` ist in `slides/skalenniveau-spiel.html` bereits auf die
gleiche `/exec`-URL gesetzt – es ist **keine zweite Einrichtung** nötig.

**Einmalig nötig:** Da `Code.gs` erweitert wurde, einmal eine **neue Version**
veröffentlichen (*Bereitstellen → Bereitstellungen verwalten → Stift → Neue
Version → Bereitstellen*). Die `/exec`-URL bleibt dieselbe.

## Hinweise
- Du kannst die Tabelle jederzeit öffnen, um Einträge zu sehen oder zu
  löschen (z. B. Quatsch-Namen entfernen). Änderungen wirken sofort.
- **Wichtig bei Code-Änderungen:** Wenn du `Code.gs` später anpasst, musst
  du unter *Bereitstellen → Bereitstellungen verwalten* eine **neue Version**
  veröffentlichen, sonst läuft weiter die alte. Die `/exec`-URL bleibt gleich.
- Solange `LEADERBOARD_URL` leer ist (oder der Server mal nicht erreichbar
  ist), fällt das Spiel automatisch auf die lokale Bestenliste zurück –
  es funktioniert also immer.
- Datenschutz: Es werden nur der eingegebene Name (max. 18 Zeichen), die
  Zügezahl und die Zeit gespeichert. Weise die Studierenden ggf. darauf hin,
  einen Spitznamen statt des Klarnamens zu verwenden.
