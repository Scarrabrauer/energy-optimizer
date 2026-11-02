/* Add future offers to this registry. Supplier references are never cashflow inputs. */
(function(root){
 'use strict';
 const profiles={
  heidelberg:{id:'heidelberg',name:'Heidelberg Solar · aktuelles Angebot',source:'Angebot AG5172 und aktualisierte PV*SOL-Berechnung vom 09.10.2026; Mieterstromrechnung mit möglicher Doppelbewertung noch offen.',
   hardware:{modules:'52 × AIKO A480-MCE54Db · 40 Süd + 12 Carport',inverter:'SigenStor EC 25.0 TP',battery:'2 × SigenStor BAT 10.0',usableBattery:17.52,pvsolBattery:18.1,gateway:'Sigen Energy Gateway HomeProTP'},
   parameters:{pvCost:30839,pvPower:24.96,pvYield:28429,houseDemand:6500,wpDemand:5000,tenantDemand:3500,evDemand:3000,batteryCapacity:17.52,tenantCoverage:70,tenantPrice:0.22,tenantGrowth:0,tenantEnabled:0,meterCost:160},
   reference:{yield:28429,feed:15020,autarky:72.2,selfConsumption:47.1,paybackMonths:86},
   tenantAssumption:{coverage:70,energy:2450,price:0.22,revenue:539},
   notes:'3.000 kWh sind Fahrenergie im Jahresmodell. PV*SOL berücksichtigt abweichende Ladeenergie/Verluste. 18,1 kWh ist die Speichergröße im Anbieter-Modell, 17,52 kWh die angegebene nutzbare Kapazität. 160 €/Jahr Messstellenkosten sind eine gemeinsame Vergleichsannahme, keine Heidelberg-Zusage.'},
  nox:{id:'nox',name:'Nox Solartechnik · Phase 2',source:'Angebot ANG-2026-01218, PDF vom 10.10.2026. Anbieterrechnung mit unvollständigen Verbrauchsdaten; keine belastbare Anbieter-Amortisation.',
   hardware:{modules:'52 × AIKO Neostar 3S+ 480 W · Modelltext nennt widersprüchlich auch A485',inverter:'EcoFlow PowerOcean Plus 29,9 kW',battery:'4 × EcoFlow Ocean 2, je 5,02 kWh · 20,08 kWh nominal',usableBattery:18.072,usableEstimated:true,pvsolBattery:null,gateway:'Full Backup 63 A · Modell und Insel-Leistung bestätigen lassen'},
   parameters:{pvCost:31220,pvPower:24.96,pvYield:24960,houseDemand:6500,wpDemand:5000,tenantDemand:3500,evDemand:3000,batteryCapacity:18.072,tenantCoverage:70,tenantPrice:0.22,tenantGrowth:0,tenantEnabled:0,meterCost:160},
   reference:{yield:24960,feed:null,autarky:null,selfConsumption:null,paybackMonths:null},
   tenantAssumption:{coverage:70,energy:2450,price:0.22,revenue:539},
   notes:'24.960 kWh sind pauschal 1.000 kWh/kWp, nicht PV*SOL. Nutzbarer Speicher 18,072 kWh ist nur 90 % von 20,08 kWh nominal. 70 % Mieterdeckung und 0,22 €/kWh sind unsere gemeinsame Planannahme, keine Nox-Zusage. 160 €/Jahr Messstellenkosten sind ein SpotmyEnergy-Orientierungswert; verbindliche Kosten, zusätzliche Zähler und HEMS noch klären. Die optionale Wallbox zu 1.652,91 € ist nicht im Preis enthalten.'},
  solliving:{id:'solliving',name:'Sol-Living · 16.10.2026',source:'PV-Angebot 16.10.2026, S. 7–23; separates VREY-Angebot 13.10.2026, gültig bis 29.10.2026, Verlängerung offen.',
   hardware:{modules:'53 × AIKO A485-MCE54Db Neostar 3S+ · 25,705 kWp rechnerisch, Angebot gerundet 25,71',inverter:'FOX ESS H3-Pro-25.0',battery:'FOX ESS EK12 Plus + EK6 Plus mit HV-Junction Box-50 · 17,28 kWh angegeben',usableBattery:15.552,usableEstimated:true,capacityNote:'17,28 kWh angegeben; bei 90 % DoD vorsichtige nutzbare Annahme 15,552 kWh. Nenn-/Nutzkapazität und Misch-Parallelschaltung bestätigen.',pvsolBattery:null,gateway:'FOX ESS EPS Box Pro · dreiphasig; Smartfox Pro 3 inklusive'},
   parameters:{pvCost:38464.41,pvPower:25.71,pvYield:27304,houseDemand:6500,wpDemand:5000,tenantDemand:3500,evDemand:3000,batteryCapacity:15.552,tenantCoverage:70,tenantPrice:0.22,tenantGrowth:0,tenantEnabled:0,meterCost:160},
   reference:{yield:27304,feed:null,autarky:70,selfConsumption:37,paybackMonths:108,paybackNote:'9 Jahre Anbieterangabe; Heizkosteneffekte enthalten, WP-Investition fehlt im PV-Angebot. Nicht direkt mit Heidelberg vergleichbar.'},
   tenantAssumption:{coverage:70,energy:2450,price:0.22,revenue:539},
   commercial:{regularPrice:38464.41,advancePrice:37310.48,vreySetupGross:2856,vreyAnnualGross:734.11,insuranceAnnual:107.88},
   notes:'Regulärer Preis ohne Vorkasse. 3 % Skonto nur bei 100 % Zahlung mindestens 14 Tage vor Auftragsbeginn. Zahlung sonst 55/40/5, Bonitätsvorbehalt. Smartfox inklusive ohne angegebene Lizenzgebühren; reale Geräteintegration offen. VREY ist separat und standardmäßig aus: 2.856 € einmalig + 734,11 €/Jahr brutto; Installation ausgeschlossen. 800 € Mieterstromzähler und ggf. 1.400 € Zählerschrank zusätzlich ungeklärt. Optionale Versicherung 8,99 €/Monat ist nicht enthalten. 160 €/Jahr Messkosten ohne VREY nur gemeinsame Annahme.'},
  schuette:{id:'schuette',name:'Elektrotechnik Schütte · 26.10.2026',source:'Angebot V2609/6528-A vom 26.10.2026; K2-Base-Montage-/Statikbericht vom 16.10.2026 und Axitec-/Fronius-Datenblätter. Kein Energieertragsnachweis.',
   hardware:{modules:'39 × Axitec 460 W laut Angebot = 17,94 kWp; K2 plant 470 W = 18,33 kWp',inverter:'Fronius Hybrid 20 kW · genaue Baureihe nicht genannt',battery:'4 × Fronius Reserva Pro Modul 3,98 kWh laut Stückliste; Überschrift 19,8 kWh widersprüchlich',usableBattery:15.9,usableEstimated:false,capacityNote:'15,9 kWh nutzbar für vier Module laut Datenblatt. 19,9 kWh erfordern fünf Module. Lieferumfang schriftlich klären.',pvsolBattery:null,gateway:'Notstrom-Umschaltgerät 4,240,048.CK enthalten · Modell, Phasen und Insel-Leistung bestätigen'},
   parameters:{pvCost:28650.30,pvPower:17.94,pvYield:17940,houseDemand:6500,wpDemand:5000,tenantDemand:3500,evDemand:3000,batteryCapacity:15.9,tenantCoverage:70,tenantPrice:0.22,tenantGrowth:0,tenantEnabled:0,meterCost:160},
   reference:{yield:null,feed:null,autarky:null,selfConsumption:null,paybackMonths:null},
   tenantAssumption:{coverage:70,energy:2450,price:0.22,revenue:539},
   commercial:{regularPrice:28650.30,tilesExtra:2940},
   notes:'Basis 39 × 460 W aus dem Angebot, nicht 18,33 kWp aus dem abweichenden K2-Plan. Jahresertrag 17.940 kWh = 1.000 kWh/kWp ist nur unsere Vergleichsannahme; K2 Base berechnet Montage/Statik, keinen Stromertrag. Speicher 15,9 kWh laut vier Modulen, nicht zugesagte 19,8 kWh. Montage ohne Gerüst; 70 Solardachziegel à 42 € optional +2.940 €. Kosten für Gerüst, Zählerschrank, §42b/§14a und andere notwendige Arbeiten offen. Zahlung 80 % Lieferung / 10 % Baubeginn / 10 % Inbetriebnahme. 160 €/Jahr Messkosten nur gemeinsame Annahme. Netz-/Geräteintegration für 1.017 € benannt, aber konkretes EMS und WP-/Wallbox-Anbindung nicht belegt.'}
 };
 if(typeof module!=='undefined'&&module.exports)module.exports=profiles;else root.EnergyOfferProfiles=profiles;
})(typeof window!=='undefined'?window:globalThis);
