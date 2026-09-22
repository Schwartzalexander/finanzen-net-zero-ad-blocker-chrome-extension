# finanzen.net zero Werbeentferner

Chrome-Erweiterung, die Werbe-Hinweise auf finanzen.net zero automatisch dauerhaft schliesst.

## Funktion

Die Erweiterung laeuft auf `finanzen.net` und `finanzen-zero.net` und sucht nach Hinweis-/Werbe-Kacheln mit dem bekannten `Nicht mehr anzeigen`-Kontrollkaestchen und dem X-Icon.

Wenn eine solche Anzeige gefunden wird, passiert automatisch:

1. `Nicht mehr anzeigen` wird angeklickt.
2. Danach wird die Anzeige ueber das X geschlossen.

Ein `MutationObserver` ueberwacht die Seite, damit auch spaeter geladene Anzeigen entfernt werden.

## Installation

1. In Chrome `chrome://extensions` oeffnen.
2. Den Entwicklermodus aktivieren.
3. `Entpackte Erweiterung laden` auswaehlen.
4. Diesen Projektordner auswaehlen.

Nach Aenderungen an der Extension muss sie in `chrome://extensions` bzw. `vivaldi://extensions` neu geladen und die finanzen-zero-Seite aktualisiert werden.

## Dateien

- `manifest.json`: Manifest-V3-Konfiguration.
- `content.js`: Automatische Erkennung und Klick-Logik.
- `popup.html` und `popup.css`: Kleines Extension-Menue am Icon.
- `icons/icon-16.png`, `icons/icon-48.png`, `icons/icon-128.png`: Vivaldi-/Chrome-kompatible Extension-Icons.
