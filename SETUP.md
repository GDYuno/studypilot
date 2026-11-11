# StudyPilot

StudyPilot ist eine experimentelle Lernwebseite. Die Oberfläche läuft über GitHub Pages, speichert Modul- und Quizdaten lokal im jeweiligen Browser und kann ILIAS-PDFs **manuell** importieren. Keine direkte ILIAS-Synchronisierung, kein automatisches Hochschul-Login, keine Geräte-Synchronisierung.

## KI-Tutor einrichten (optional)

Der KI-Tutor benötigt einen eigenen Cloudflare Worker und einen OpenAI-API-Schlüssel. GitHub Pages kann API-Schlüssel nicht sicher speichern.

1. Erstelle in deinem eigenen Cloudflare-Konto einen Worker und verwende den Inhalt von `backend/worker.js`.
2. Hinterlege `OPENAI_API_KEY` als **Secret** im Worker, nicht in GitHub und nicht im Browser. Optional `OPENAI_MODEL` und `ALLOWED_ORIGIN=https://gdyuno.github.io` konfigurieren.
3. Deploye den Worker. Trage seine HTTPS-Adresse in StudyPilot unter **Lernen → KI-Tutor** ein.
4. Importiere ein PDF, wähle eine Folie und klicke auf **Aktuelle Folie mit KI erklären**.

**Datenschutz:** Bei KI-Anfragen wird der ausgewählte Folientext an den eigenen Worker und den konfigurierten KI-Dienst gesendet. Stelle sicher, dass dies nach den Nutzungsbedingungen deiner Hochschule zulässig ist. Keine ILIAS-Zugangsdaten eingeben. Ein öffentlich erreichbarer Worker ohne Benutzeranmeldung kann von Dritten missbraucht werden und Kosten verursachen; vor produktiver Nutzung ist eine Authentifizierung mit Quoten erforderlich. CORS ist **keine** Zugriffskontrolle.

## Noch nicht implementiert

- Automatische ILIAS-Anmeldung oder Synchronisierung (Schnittstelle und Authentifizierung der Hochschule müssen geprüft werden)
- Cloud-Speicherung und geräteübergreifender Fortschritt
- Zuverlässige PDF-Bilderkennung für Scans
- Sicherer Mehrbenutzerbetrieb des KI-Backends

Der aktuelle PDF-Importer erzeugt nur Platzhalterfragen. Erst mit konfiguriertem KI-Backend können einzelne Folien erklärt und Fragen ersetzt werden.
