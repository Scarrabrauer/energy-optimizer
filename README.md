# Energy Optimizer — PV + Wärmepumpe

Statische Web-App mit Dark Mode. Grundlage: die am 7. Oktober 2026 korrigierte Excel-Wirtschaftlichkeitsrechnung. Keine Installation, kein Build, keine externen Bibliotheken oder Dienste.

## Starten

Alle Dateien zusammen entpacken und index.html im Browser öffnen. Einstellungen werden lokal gespeichert, soweit der Browser das zulässt. Für Hosting oder lokale Vorschau bleiben alle Dateien im gleichen Ordner.

## GitHub Pages

1. Die Inhalte dieses Ordners in den Root eines GitHub-Repositories laden: index.html, app.js, styles.css, dark.css und .nojekyll. README.md kann mit hochgeladen werden.
2. Im Repository unter Settings → Pages die Veröffentlichung aus einem Branch wählen.
3. Branch main und Ordner / (root) einstellen. Die dort angezeigte Pages-Adresse öffnet die App.

Alle Asset-Pfade sind relativ. Die App funktioniert auch unter einer Repository-Unteradresse. Kein Backend, keine Schlüssel und keine Laufzeit-Abhängigkeiten erforderlich.

## Funktionen

- Dashboard mit Gesamt-/Nettoinvestition, Amortisation und 10-Jahres-Saldo
- Vier Szenarien: Konservativ, Basis, Optimistisch, Manuell
- Vergleich der drei vorgegebenen Szenarien mit aktuellen Projekt- und Verbrauchsparametern
- Kumulierte Wirtschaftlichkeit, jährlicher Nettonutzen, PV-Verteilung und Nutzenblöcke als SVG-Grafiken
- 5-/10-Jahres-Auswertung und Jahres-Cashflow mit separaten Einsparungen, Einspeisung, Mieterstrom, Steuern, Zuschüssen und laufenden Kosten
- Tageszeit-Priorisierung und farbige Matrix aus dem Excel-Modell
- Editierbare Parameter, lokale Speicherung, Rücksetzen und JSON-Export als Datei oder Zwischenablage
- Responsive Oberfläche mit horizontal scrollbaren Diagrammen/Tabellen auf kleinen Displays

## Rechenmodell

Zehn Jahresperioden, keine Abzinsung. PV-Ertrag nimmt jährlich entsprechend der Degradation ab. Eigener PV-Verbrauch und Mieterstrom werden durch Bedarf, Deckungsquote und verfügbaren PV-Ertrag begrenzt. Eigene Nutzung wird vor Mieterstrom zugeordnet. Rest-PV wird eingespeist.

Baseline: Haushalts-/Wallboxstrom, bisheriger Gasverbrauch, Grundpreise und Gaswartung. Projekt: verbleibender Netzstrom plus Strom-Grundpreis. Die Differenz ist die direkte Einsparung. WP-/PV-Wartung und Abrechnung werden gesondert abgezogen. Der Strom-Grundpreis bleibt im Projekt bestehen und fällt deshalb aus der Einsparungsdifferenz heraus.

Förderung wird einmalig in Jahr 1 gebucht. Nettoinvestition dient nur der Anzeige; der Cashflow startet mit der Bruttoinvestition und zählt Zuschüsse somit nur einmal. PV-Umsatzsteuer ist rein informativ. Steuerannahmen übernehmen die Excel-Planwerte, ohne aktuelle Anspruchsprüfung.

V+V: WP-Kosten × vermieteter Flächenanteil abzüglich zugeordnetem KfW-Grundzuschuss, verteilt über 2–5 Jahre. §35a: PV-Arbeitskosten × selbstgenutzter Anteil × 20 %, begrenzt auf 1.200 €, optional deaktivierbar.

Amortisation ist der erste Übergang des kumulierten Saldos auf mindestens null. Der Übergang innerhalb eines Jahres wird linear auf Monate interpoliert. Ohne Übergang im Zehnjahreszeitraum wird „> 10 Jahre“ angezeigt. Es handelt sich um eine Jahresmodell-Näherung, insbesondere bei einmaligen Rückflüssen in Jahr 1.

## Verbrauchsstrategie und Grenzen

Die Strategiemodi verändern die Deckungsquoten anhand der Excel-Faktoren: Standard 0,92 / 0,95, Optimal 1 / 1, Max. Autarkie 1,04 / 1,03 (eigen / Mieter). Eigene Deckung maximal 90 %, Mieter maximal 100 %.

Batteriegröße und SOC-Ziele sind Betriebsvorgaben. Sie ändern im Jahresmodell nicht automatisch den Cashflow. Zusätzliche Speicherkosten, Stundenprofile, Speicherverluste, reale Ladezustände und saisonale Wetterdaten sind nicht modelliert. Warmwasser ist im WP-Verbrauch enthalten und wird nicht zusätzlich gerechnet. Finanzierung ist nicht Teil der App. Prioritäten sind Betriebsempfehlungen, keine berechneten Stromflüsse oder automatische Gerätesteuerung. Für 23–24 Uhr gilt der Nachtmodus.

## Korrigierte Excel-Bezüge

- Effektive Mieterstromdeckung in Verbrauchsstrategie!G10 ergänzt; abhängige Formeln entsprechend verbunden.
- Steuer_VuV!B9 verwendet Eingaben!B22 (vermieteter Flächenanteil).
- Steuer_VuV!B15 verwendet Eingaben!B23 (selbstgenutzter Flächenanteil).

## Prüfung

Basisszenario: Investition 70.839 €, modellierte Zuschüsse 14.900 €, Nettoinvestition 55.939 €, Saldo nach fünf Jahren −25.237,26 €, nach zehn Jahren +3.576,18 €, Amortisation 9 Jahre 5 Monate.

Browser-Prüfung in Microsoft Edge: alle Szenarien, manuelle Eingaben, lokale Speicherung, Rücksetzen, Tageszeiten, SOC, JSON-Download, Nullertrag, ungültige Eingabe und Smartphone-Layout. Die Simulation wurde mit den Jahreswerten der korrigierten Excel abgeglichen. Kein Live-Deployment auf GitHub durchgeführt.

## Haus & Energie — Erweiterung

Neuer Bereich mit fünf geführten Frageschritten, 31 editierbaren Angaben, Quellenkennzeichnung und offenen Prüfpunkten. Startwerte: 281 m² Wohnfläche, 400,62 m² Gebäudenutzfläche, 1.400 m² Grundstück, Baujahr 2007, Kaltmiete 990 €/Monat, Gas 26.530,69 kWh/Jahr, drei Raummeter Buche. Planungsdaten aus dem Wärmeschutznachweis werden von tatsächlicher Anlagentechnik unterschieden.

Gas wird für die Heizenergiekennzahl mit 0,9 auf Heizwertbasis umgerechnet. Nutzwärme = Gas-Heizwert × Gasnutzungsgrad + Holz-Heizwert × Ofennutzungsgrad. WP-Strom = verbleibende Nutzwärme nach künftiger Holznutzung / Jahresarbeitszahl. PV-Deckung betrifft nur den geschätzten WP-Netzstrom, nicht die ungesicherte Energieausweisklasse. Verbrauchsnäherung ohne normgerechten Ausweis, ohne technischen Hilfsstrom und ohne gesicherte Wetterbereinigung. Kosten der historischen Gasrechnung sind Information, kein aktueller Tarif.

Hauswert: Gesamtwohnfläche × Vergleichspreis inklusive Grundstück × begründete Anpassung minus Reparaturen. Optional kann ein eigener aktueller Gesamtwert verwendet werden. Startpreis 3.732 €/m² aus Mannheims veröffentlichten EFH-Verkäufen 2025; keine spezifische Scharhof-Bewertung. Startkorridor ±30 %, frei veränderbare Modellunsicherheit, kein statistisches Konfidenzintervall. Der Grundstückswert und die Miete werden nicht nochmals addiert. Der Bodenrichtwert ist nur ein separater Plausibilitätsvergleich. Qualitative Antworten zeigen Prüfbedarf; sie erzeugen keine empirisch unbelegten automatischen Aufschläge. Szenarien 3/5/7 % bleiben separate Planannahmen und fließen nicht in den Energie-Cashflow.

Hausdaten werden separat lokal gespeichert und über die bestehenden JSON-Exportknöpfe mit exportiert. Der bewusste Übernahmeknopf aktualisiert Gas- und WP-Verbrauch der bestehenden Wirtschaftlichkeitsrechnung. Deren übrige Excel-Startwerte bleiben erhalten.

Für Veröffentlichung zusätzlich property.js hochladen. Vollständiges Paket: index.html, app.js, property.js, styles.css, dark.css, .nojekyll, README.md. Die vorausgefüllten Haus- und Mietdaten sind bei öffentlicher Veröffentlichung ebenfalls öffentlich; Originalrechnungen und personenbezogene Identifikatoren sind nicht enthalten.

Geprüft: JavaScript-Syntax, Browseranzeige, Frageschritte, Änderung der JAZ mit Neuberechnung, Speicherung nach Neuladen, Übernahme des Verbrauchs in Wirtschaftlichkeit. Keine Veröffentlichung auf GitHub durchgeführt.
