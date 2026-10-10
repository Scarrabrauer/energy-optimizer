/* Add future offers to this registry. Supplier references are never cashflow inputs. */
(function(root){
 'use strict';
 const profiles={
  heidelberg:{id:'heidelberg',name:'Heidelberg Solar · aktuelles Angebot',source:'Vom Eigentümer übermittelte Angebots- und PV*SOL-Werte, Oktober 2026; Originalunterlagen hier nicht erneut geprüft.',
   hardware:{modules:'52 × AIKO A480-MCE54Db · 40 Süd + 12 Carport',inverter:'SigenStor EC 25.0 TP',battery:'2 × SigenStor BAT 10.0',usableBattery:17.52,pvsolBattery:18.1,gateway:'Sigen Energy Gateway HomeProTP'},
   parameters:{pvCost:30839,pvPower:24.96,pvYield:28429,houseDemand:6500,wpDemand:5000,tenantDemand:3500,evDemand:3000,batteryCapacity:17.52,tenantCoverage:70,tenantPrice:0.22,tenantGrowth:0,tenantEnabled:0},
   reference:{yield:28429,feed:15020,autarky:72.2,selfConsumption:47.1,paybackMonths:86},
   tenantAssumption:{coverage:70,energy:2450,price:0.22,revenue:539},
   notes:'3.000 kWh sind Fahrenergie im Jahresmodell. PV*SOL berücksichtigt abweichende Ladeenergie/Verluste. 18,1 kWh ist die Speichergröße im Anbieter-Modell, 17,52 kWh die angegebene nutzbare Kapazität.'}
 };
 if(typeof module!=='undefined'&&module.exports)module.exports=profiles;else root.EnergyOfferProfiles=profiles;
})(typeof window!=='undefined'?window:globalThis);
