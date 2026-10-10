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
   notes:'24.960 kWh sind pauschal 1.000 kWh/kWp, nicht PV*SOL. Nutzbarer Speicher 18,072 kWh ist nur 90 % von 20,08 kWh nominal. 70 % Mieterdeckung und 0,22 €/kWh sind unsere gemeinsame Planannahme, keine Nox-Zusage. 160 €/Jahr Messstellenkosten sind ein SpotmyEnergy-Orientierungswert; verbindliche Kosten, zusätzliche Zähler und HEMS noch klären. Die optionale Wallbox zu 1.652,91 € ist nicht im Preis enthalten.'}
 };
 if(typeof module!=='undefined'&&module.exports)module.exports=profiles;else root.EnergyOfferProfiles=profiles;
})(typeof window!=='undefined'?window:globalThis);
