/* PV/WP planning model. Plain browser script, no network or build dependencies.
 * Source: supplied workbook, October 2026. See README for corrected references.
 */
(function () {
  'use strict';
  const STORAGE_KEY = 'energy-optimizer.config.v1';
  const offers = typeof module !== 'undefined' && module.exports ? require('./profiles.js') : window.EnergyOfferProfiles;
  // [key, label, default, unit, min, max, step, source]. Percent inputs use 0..100.
  const fields = [
    ['pvCost','PV-Investition',30839,'€',0,1000000,100,'Eingaben!B4'],
    ['pvPower','PV-Leistung',24.96,'kWp',0,1000,0.01,'Eingaben!B5'],
    ['wpCost','Wärmepumpen-Projektkosten',40000,'€',0,1000000,100,'Eingaben!B6'],
    ['eligibleCap','Förderfähige Kostenobergrenze',42250,'€',0,1000000,100,'Eingaben!B7'],
    ['kfwOwnShare','KfW-Kostenanteil selbstgenutzt',50,'%',0,100,0.1,'Eingaben!B8'],
    ['houseDemand','Haushalt',6500,'kWh/Jahr',0,1000000,100,'Eingaben!B9'],
    ['evDemand','Wallbox',3000,'kWh/Jahr',0,1000000,100,'Eingaben!B10'],
    ['wpDemand','Wärmepumpe inkl. Warmwasser',5000,'kWh/Jahr',0,1000000,100,'Eingaben!B11'],
    ['tenantDemand','Mietwohnung',3500,'kWh/Jahr',0,1000000,100,'Eingaben!B12'],
    ['electricityPrice','Strompreis',0.24,'€/kWh',0,10,0.001,'Eingaben!B13'],
    ['electricityBase','Strom-Grundpreis',18,'€/Monat',0,10000,1,'Eingaben!B14'],
    ['guaranteeYears','Preisgarantie Strom',5,'Jahre',0,10,1,'Eingaben!B15'],
    ['gasDemand','Gasverbrauch bisher',24200,'kWh/Jahr',0,1000000,100,'Eingaben!B16'],
    ['gasBase','Gas-Grundpreis',180,'€/Jahr',0,100000,10,'Eingaben!B17'],
    ['gasMaintenance','Wartung Gasheizung',250,'€/Jahr',0,100000,10,'Eingaben!B18'],
    ['wpMaintenance','Wartung Wärmepumpe',200,'€/Jahr',0,100000,10,'Eingaben!B19'],
    ['pvMaintenance','Wartung / Versicherung PV',150,'€/Jahr',0,100000,10,'Eingaben!B20'],
    ['billingCost','Messung / Abrechnung',180,'€/Jahr',0,100000,10,'Eingaben!B21'],
    ['rentedShare','Vermieteter Flächenanteil',100/3,'%',0,100,0.01,'Eingaben!B22'],
    ['taxRate','Grenzsteuersatz',35,'%',0,100,0.1,'Eingaben!B24'],
    ['taxUsability','Nutzbarer V+V-Steuereffekt',100,'%',0,100,1,'Eingaben!B25'],
    ['taxYears','V+V-Verteilungsdauer',5,'Jahre',2,5,1,'Eingaben!B26'],
    ['grantRentedShare','V+V-Anteil KfW-Grundzuschuss',100/3,'%',0,100,0.01,'Eingaben!B27'],
    ['laborCost','PV-Arbeitskosten (Platzhalter)',7000,'€',0,1000000,100,'Eingaben!B28'],
    ['use35a','PV §35a nutzbar',1,'0 = nein, 1 = ja',0,1,1,'Eingaben!B29'],
    ['pvYield','PV-Ertrag Jahr 1',28523,'kWh',0,1000000,100,'Szenarien!C3'],
    ['degradation','PV-Degradation',0.4,'%/Jahr',0,100,0.1,'Szenarien!C4'],
    ['ownCoverage','Basis-PV-Deckung eigen',70,'%',0,100,0.1,'Szenarien!C5'],
    ['tenantCoverage','Basis-PV-Deckung Mieter',65,'%',0,100,0.1,'Szenarien!C6'],
    ['electricityGrowth','Strompreisanstieg nach Garantie',3,'%/Jahr',0,100,0.1,'Szenarien!C7'],
    ['gasPrice','Gaspreis Start',0.1,'€/kWh',0,10,0.001,'Szenarien!C8'],
    ['gasGrowth','Gaspreisanstieg',3,'%/Jahr',0,100,0.1,'Szenarien!C9'],
    ['tenantPrice','Preis PV-Strom an Mieter',0.21,'€/kWh',0,10,0.001,'Szenarien!C10'],
    ['tenantGrowth','Mieterstrom-Preisanstieg',1,'%/Jahr',0,100,0.1,'Szenarien!C11'],
    ['feedTariff','Einspeisevergütung',0.0708,'€/kWh',0,10,0.0001,'Szenarien!C12'],
    ['localGrant','Regionaler WP-Zuschuss (Annahme)',500,'€',0,1000000,100,'Szenarien!C13'],
    ['baseGrantRate','KfW-Grundförderung (Annahme)',30,'%',0,100,1,'Szenarien!C14'],
    ['climateRate','Klimabonus (Annahme)',12,'%',0,100,1,'Szenarien!C15']
  ];
  const scenarioKeys = ['pvYield','degradation','ownCoverage','tenantCoverage','electricityGrowth','gasPrice','gasGrowth','tenantPrice','tenantGrowth','feedTariff','localGrant','baseGrantRate','climateRate'];
  const presets = {
    Konservativ: [27000,0.5,62,55,3.5,0.09,2,0.19,0,0.0708,0,30,12],
    Basis: [28523,0.4,70,65,3,0.1,3,0.21,1,0.0708,500,30,12],
    Optimistisch: [30000,0.3,76,72,2.5,0.12,4,0.22,2,0.0708,1200,30,12]
  };
  const factors = {Standard:[0.92,0.95], Optimal:[1,1], 'Max. Autarkie':[1.04,1.03]};
  const times = ['00–06','06–09','09–11','11–15','15–18','18–23'];
  const priorities = [
    ['Hausstrom eigene Wohnung',[5,5,5,5,5,5],'Grundlast immer zuerst decken.'],
    ['Mietwohnung / Gebäudestrom',[5,5,5,5,5,5],'Gleichrangige Grundlast; PV-Verkauf nur bei zeitgleicher Zuordnung.'],
    ['Wärmepumpe Heizung',[3,4,4,5,4,2],'Heizbedarf möglichst in die Solarzeit verschieben.'],
    ['Warmwasser',[1,1,4,5,3,1],'Bevorzugt mittags; im WP-Jahresverbrauch enthalten.'],
    ['Batterie laden',[1,1,3,4,5,1],'Nach Direktverbrauch für den Abend vorbereiten.'],
    ['Batterie entladen',[4,4,1,1,1,5],'Hausbedarf unterstützen; Mindest-SOC beachten.'],
    ['Wallbox',[1,1,3,5,3,1],'PV-Laden bevorzugt 10–16 Uhr; nicht aus dem Hausspeicher.'],
    ['Einspeisung',[1,1,1,1,2,1],'Verbleibenden PV-Überschuss einspeisen.'],
    ['Netzbezug',[2,2,1,1,1,2],'Verbleibenden Bedarf aus dem Netz decken.']
  ];
  const interpretations = [
    'Nachts: Batterie für Hausbedarf; Wärmepumpe bedarfsgeführt. Keine planmäßige Wallboxladung.',
    'Morgens: Grundlast decken, Batterie unterstützt den Morgenpeak; PV nutzen, sobald verfügbar.',
    'Solarphase beginnt: Wärmepumpe und Warmwasser vorbereiten, Batterie moderat laden.',
    'Haupt-Solarfenster: Haus und Mietwohnung, dann Wärmepumpe/Warmwasser und PV-Wallbox; verbleibenden Strom speichern.',
    'Abend vorbereiten: Batterie fertig laden, Wallbox nur bei echtem PV-Überschuss.',
    'Abends: Batterie für Hausbedarf entladen, Netz deckt Restbedarf. Wallbox nicht aus dem Hausspeicher laden.'
  ];
  function defaults() {
    return Object.assign(Object.fromEntries(fields.map(f => [f[0], f[2]])), {scenario:'Basis',strategy:'Optimal',batteryCapacity:17.52,socMin:15,socTarget:85,timeIndex:3,offerId:'',tenantEnabled:1});
  }
  function normalize(raw) {
    const c = defaults();
    if (!raw || typeof raw !== 'object') return c;
    if (Object.hasOwn(offers,raw.offerId)) c.offerId=raw.offerId;
    if (raw.tenantEnabled===0 || raw.tenantEnabled===1) c.tenantEnabled=raw.tenantEnabled;
    fields.forEach(([key,,value,,min,max,step]) => {
      if (typeof raw[key] === 'number' && Number.isFinite(raw[key])) c[key] = Math.min(max,Math.max(min,step === 1 ? Math.round(raw[key]) : raw[key]));
    });
    if (['Basis','Konservativ','Optimistisch','Manuell'].includes(raw.scenario)) c.scenario = raw.scenario;
    if (Object.hasOwn(factors,raw.strategy)) c.strategy = raw.strategy;
    ['batteryCapacity','socMin','socTarget','timeIndex'].forEach(key => {
      if (typeof raw[key] === 'number' && Number.isFinite(raw[key])) c[key] = raw[key];
    });
    c.batteryCapacity = Math.min(35.04,Math.max(8.76,Math.round(c.batteryCapacity/8.76)*8.76));
    c.socMin = Math.min(35,Math.max(5,Math.round(c.socMin/5)*5));
    c.socTarget = Math.min(100,Math.max(60,Math.round(c.socTarget/5)*5));
    c.timeIndex = Math.min(5,Math.max(0,Math.round(c.timeIndex)));
    return c;
  }
  function simulate(input) {
    const c = normalize(input), f = factors[c.strategy];
    const ownCoverage = Math.min(0.9,c.ownCoverage/100*f[0]);
    const tenantCoverage = c.tenantEnabled ? Math.min(1,c.tenantCoverage/100*f[1]) : 0;
    const investment = c.pvCost+c.wpCost;
    const eligible = Math.min(c.wpCost,c.eligibleCap);
    const baseGrant = eligible*c.baseGrantRate/100;
    const climateGrant = eligible*c.kfwOwnShare/100*c.climateRate/100;
    const grant = baseGrant+climateGrant+c.localGrant;
    // Correct workbook B9/B15 to the labelled rented/self-used floor shares.
    const deductible = Math.max(0,c.wpCost*c.rentedShare/100-baseGrant*c.grantRentedShare/100);
    const annualTax = deductible/c.taxYears*c.taxRate/100*c.taxUsability/100;
    const tax35a = c.use35a ? Math.min(1200,c.laborCost*(1-c.rentedShare/100)*0.2) : 0;
    const ownDemand = c.houseDemand+c.evDemand+c.wpDemand;
    let cumulative = -investment, payback = investment === 0 ? 0 : null;
    const years = [];
    for (let year=1; year<=10; year++) {
      const ratio = Math.pow(1-c.degradation/100,year-1);
      const pv = c.pvYield*ratio;
      const price = c.electricityPrice*Math.pow(1+c.electricityGrowth/100,Math.max(0,year-c.guaranteeYears));
      const gasPrice = c.gasPrice*Math.pow(1+c.gasGrowth/100,year-1);
      const own = Math.min(ownDemand,ownDemand*ownCoverage*ratio,pv);
      const tenant = Math.min(c.tenantDemand,c.tenantDemand*tenantCoverage*ratio,Math.max(0,pv-own));
      const feed = Math.max(0,pv-own-tenant), grid = Math.max(0,ownDemand-own);
      const baseline = (c.houseDemand+c.evDemand)*price+c.electricityBase*12+c.gasDemand*gasPrice+c.gasBase+c.gasMaintenance;
      const project = grid*price+c.electricityBase*12;
      const savings = baseline-project;
      const feedIncome = feed*c.feedTariff;
      const tenantIncome = tenant*c.tenantPrice*Math.pow(1+c.tenantGrowth/100,year-1);
      const costs = c.wpMaintenance+c.pvMaintenance+(c.tenantEnabled?c.billingCost:0);
      const tax = (year<=c.taxYears ? annualTax : 0)+(year===1 ? tax35a : 0);
      const grants = year===1 ? grant : 0;
      const net = savings+feedIncome+tenantIncome-costs+tax+grants;
      const previous = cumulative;
      cumulative += net;
      if (payback === null && previous<0 && cumulative>=0 && net>0) payback = year-1-previous/net;
      years.push({year,pv,price,gasPrice,own,tenant,feed,grid,baseline,project,savings,feedIncome,tenantIncome,costs,tax,grants,net,cumulative});
    }
    function totals(n) {
      return years.slice(0,n).reduce((t,r) => {
        t.savings+=r.savings; t.income+=r.feedIncome+r.tenantIncome; t.tax+=r.tax; t.costs+=r.costs; t.grants+=r.grants; t.net+=r.net;
        t.balance=r.cumulative; return t;
      },{savings:0,income:0,tax:0,costs:0,grants:0,net:0,balance:-investment});
    }
    return {config:c,investment,netInvestment:investment-grant,eligible,baseGrant,climateGrant,grant,deductible,annualTax,tax35a,vatInfo:c.pvCost*0.19,ownCoverage,tenantCoverage,years,payback,five:totals(5),ten:totals(10)};
  }
  function applyOffer(input,id) {
    if (!Object.hasOwn(offers,id)) return normalize(input);
    return normalize({...normalize(input),...offers[id].parameters,offerId:id,scenario:'Manuell'});
  }
  const api = {defaults,normalize,simulate,fields,presets,priorities,offers,applyOffer};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof document === 'undefined') return;
  const euro = n => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const number = n => new Intl.NumberFormat('de-DE',{maximumFractionDigits:2}).format(n);
  const energy = n => number(n)+' kWh';
  const $ = id => document.getElementById(id);
  const text = (id,value) => { $(id).textContent = value; };
  let config = defaults();
  function status(message) { text('appStatus',message); }
  function save() {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify({version:1,config})); }
    catch (_) { status('Lokales Speichern ist gesperrt. Änderungen gelten nur für diese Sitzung.'); }
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.version === 1) config = normalize(saved.config);
    } catch (_) { status('Gespeicherte Einstellungen konnten nicht geladen werden. Standardwerte sind aktiv.'); }
  }
  function controls() {
    $('inputControls').innerHTML = fields.map(([key,label,,unit,min,max,step,source]) =>
      `<label for="param-${key}">${label}</label><input id="param-${key}" data-key="${key}" type="number" min="${min}" max="${max}" step="${step}" required aria-describedby="unit-${key}" title="Quelle: ${source}" /><div class="control-unit" id="unit-${key}">${unit}</div>`).join('');
    $('inputControls').addEventListener('input',event => {
      const el = event.target, key = el.dataset.key;
      if (!key) return;
      if (el.value.trim() === '' || !Number.isFinite(el.valueAsNumber) || Number(el.value)<Number(el.min) || Number(el.value)>Number(el.max) || (Number(el.step)===1 && !Number.isInteger(el.valueAsNumber))) {
        el.setCustomValidity('Bitte einen gültigen Wert innerhalb der angezeigten Grenzen eingeben.');
        el.setAttribute('aria-invalid','true'); status('Ungültige Eingabe: Die Ergebnisse zeigen den zuletzt gültigen Stand.'); return;
      }
      el.setCustomValidity(''); el.removeAttribute('aria-invalid');
      config[key] = el.valueAsNumber; config.scenario = 'Manuell';
      $('scenarioSelect').value = 'Manuell'; status(''); update();
    });
  }
  function sync() {
    $('offerSelect').value=config.offerId;
    $('tenantEnabled').checked=Boolean(config.tenantEnabled);
    fields.forEach(([key]) => { const el=$('param-'+key); el.value=Number(config[key].toFixed(4)); el.setCustomValidity(''); el.removeAttribute('aria-invalid'); });
    $('scenarioSelect').value=config.scenario;
    $('strategyMode').value=config.strategy;
    ['batteryCapacity','socMin','socTarget'].forEach(key => { $(key).value=config[key]; });
  }
  function chart(m) {
    const values = [-m.investment,...m.years.map(r=>r.cumulative)];
    let lo=Math.min(0,...values), hi=Math.max(0,...values);
    const pad=Math.max(100,(hi-lo)*0.12); lo-=pad; hi+=pad;
    const x = i => 85+i*69, y = v => 280-(v-lo)/(hi-lo)*245;
    const points = values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
    let svg = '<title>Kumulierter Saldo nach Investition über zehn Jahre</title>';
    for (let i=0;i<=4;i++) { const value=lo+(hi-lo)*i/4; svg+=`<line class="grid" x1="85" x2="775" y1="${y(value)}" y2="${y(value)}"/><text x="77" y="${y(value)+4}" text-anchor="end">${number(value/1000)} T€</text>`; }
    svg+=`<line class="zero" x1="85" x2="775" y1="${y(0)}" y2="${y(0)}"/><polyline class="line" points="${points}"/>`;
    values.forEach((v,i)=> { svg+=`<circle class="dot" cx="${x(i)}" cy="${y(v)}" r="4"><title>Jahr ${i}: ${euro(v)}</title></circle><text x="${x(i)}" y="303" text-anchor="middle">${i}</text>`; });
    if (m.payback!==null) svg+=`<line class="payback" x1="${x(m.payback)}" x2="${x(m.payback)}" y1="35" y2="280"/>`;
    svg+='<text x="430" y="325" text-anchor="middle">Jahr</text>';
    $('cashflowChart').innerHTML=svg;
  }
  function strategy() {
    text('batteryValue',energy(config.batteryCapacity)); text('socMinValue',number(config.socMin)+' %'); text('socTargetValue',number(config.socTarget)+' %');
    $('timeButtons').innerHTML = times.map((t,i)=>`<button type="button" data-time="${i}" class="${i===config.timeIndex?'active':''}" aria-pressed="${i===config.timeIndex}">${t}</button>`).join('');
    $('priorityTable').innerHTML='<thead><tr><th scope="col">Verbraucher / Aktion</th>'+times.map(t=>`<th scope="col">${t}</th>`).join('')+'</tr></thead><tbody>'+priorities.map(([name,scores,note])=>`<tr><th scope="row" title="${note}">${name}</th>${scores.map(v=>`<td class="score p${v}">${v}</td>`).join('')}</tr>`).join('')+'</tbody>';
    const sorted=priorities.map(([name,scores,note],i)=>({name,score:scores[config.timeIndex],note,i})).sort((a,b)=>b.score-a.score||a.i-b.i);
    $('flowStage').innerHTML=`<div class="flow-source"><strong>${times[config.timeIndex]} Uhr</strong><span>${config.timeIndex===0||config.timeIndex===5?'Batterie / Restbedarf Netz':'PV nach Verfügbarkeit'}</span></div><p>${interpretations[config.timeIndex]}</p>`+sorted.map(r=>`<div class="flow-target p${r.score}"><span class="rank">${r.score}</span><div><strong>${r.name}</strong><div class="meta">${r.note}</div></div><span class="score">P${r.score}</span></div>`).join('')+`<div class="callout">Gleiche Zahlen bedeuten gleichen Rang. Die Matrix ist eine Betriebsempfehlung für alle Strategiemodi. Mindest-SOC ${config.socMin} %, Ziel um 15 Uhr ${config.socTarget} %. Für 23–24 Uhr gilt ergänzend der Nachtmodus.</div>`;
  }
  function render(m) {
    renderOffer();
    text('kpiInvestment',euro(m.investment)); text('kpiNetInvestment',euro(m.netInvestment)); text('kpiTenYear',euro(m.ten.balance));
    const months=m.payback===null?null:Math.round(m.payback*12);
    text('kpiPayback',months===null?'> 10 Jahre':`${Math.floor(months/12)} J. ${months%12} Mon.`);
    text('scenarioPill',config.scenario); chart(m);
    const r=m.years[0];
    [['energyPv',r.pv],['energyOwn',r.own],['energyTenant',r.tenant],['energyFeed',r.feed],['energyGrid',r.grid]].forEach(([id,v])=>text(id,energy(v)));
    const bars=[['Direkte Einsparungen',r.savings],['Einspeiseerlöse',r.feedIncome],['Mieterstrom brutto',r.tenantIncome],['Steuerwirkung',r.tax],['Zuschüsse',r.grants],['Laufende Zusatzkosten',-r.costs]];
    const max=Math.max(1,...bars.map(b=>Math.abs(b[1])));
    $('benefitBars').innerHTML=bars.map(([label,v])=>`<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.abs(v)/max*100}%;${v<0?'background:#b42318':''}"></div></div><b class="${v<0?'negative':''}">${euro(v)}</b></div>`).join('');
    ['five','ten'].forEach(period=> { const t=m[period]; ['Savings','Income','Tax'].forEach(label=>text(period+label,euro(t[label.toLowerCase()]))); });
    text('fiveResidual',euro(-m.five.balance)); text('tenResidual',euro(m.ten.balance));
    $('cashflowTable').innerHTML=`<tr><td>0 · Investition</td><td colspan="7">${euro(-m.investment)}</td><td class="negative">${euro(-m.investment)}</td></tr>`+m.years.map(r=>`<tr><td>${r.year}</td>${[r.savings,r.feedIncome,r.tenantIncome,r.tax,r.grants,-r.costs,r.net,r.cumulative].map(v=>`<td class="${v<0?'negative':'positive'}">${euro(v)}</td>`).join('')}</tr>`).join('');
    [['taxEligible',m.eligible],['taxBaseGrant',m.baseGrant],['taxClimateGrant',m.climateGrant],['taxLocalGrant',config.localGrant],['taxGrantTotal',m.grant],['taxDeductible',m.deductible],['taxAnnual',m.annualTax],['tax35a',m.tax35a],['taxVatInfo',m.vatInfo]].forEach(([id,v])=>text(id,euro(v)));
    text('taxYears',config.taxYears+' Jahre');
    text('modelCoverage',`Effektive PV-Deckung: eigen ${number(m.ownCoverage*100)} %, Mietwohnung ${number(m.tenantCoverage*100)} %. Laufende Zusatzkosten: ${euro(r.costs)} pro Jahr.`);
    graphics(m);
    strategy();
  }
  function graphics(m) {
    const r=m.years[0], colors=['#88ecc2','#8cc7ef','#f0bc76'];
    const items=[['Eigene Nutzung',r.own],['Mietwohnung',r.tenant],['Einspeisung',r.feed]];
    let offset=0;
    const circumference=2*Math.PI*85;
    $('energyDonut').innerHTML='<title>Aufteilung des PV-Ertrags im ersten Jahr</title><circle cx="120" cy="120" r="85" fill="none" stroke="#253443" stroke-width="21"/>'+items.map(([label,value],i)=>{
      const length=r.pv>0?value/r.pv*circumference:0;
      const segment=`<circle cx="120" cy="120" r="85" fill="none" stroke="${colors[i]}" stroke-width="21" stroke-dasharray="${length} ${circumference-length}" stroke-dashoffset="${-offset}" transform="rotate(-90 120 120)"><title>${label}: ${energy(value)}</title></circle>`;
      offset+=length; return segment;
    }).join('')+`<text x="120" y="108" text-anchor="middle" fill="#9db3c5" font-size="12">PV-ERTRAG</text><text x="120" y="139" text-anchor="middle" fill="#eaf2f8" font-size="27" font-weight="600">${number(r.pv)}</text><text x="120" y="159" text-anchor="middle" fill="#9db3c5" font-size="11">kWh / Jahr</text>`;
    $('energyLegend').innerHTML=items.map(([label,value],i)=>`<div class="legend-item"><span class="legend-dot" style="background:${colors[i]}"></span><div>${label}<b>${energy(value)}</b><span>${number(r.pv?value/r.pv*100:0)} % des PV-Ertrags</span></div></div>`).join('');
    const cases=Object.keys(presets).map(name=>{
      const c={...config,scenario:name}; scenarioKeys.forEach((key,i)=>c[key]=presets[name][i]); return [name,simulate(c).ten.balance];
    });
    const peak=Math.max(1,...cases.map(([,v])=>Math.abs(v)));
    $('scenarioComparison').innerHTML=cases.map(([name,value])=>`<div class="scenario-result"><span>${name}</span><b class="${value<0?'negative':'positive'}">${euro(value)}</b><div class="bar-track"><div class="bar-fill" style="width:${Math.abs(value)/peak*100}%;background:${value<0?'#e78d93':'#88ecc2'}"></div></div></div>`).join('');
    const hi=Math.max(1,...m.years.map(r=>r.net))*1.08;
    const lo=Math.min(0,...m.years.map(r=>r.net))*1.08;
    const y = v=>270-(v-lo)/(hi-lo)*225;
    let svg='<title>Jährlicher Nettonutzen inklusive Zuschüsse und Steuerwirkung</title>';
    for(let i=0;i<=4;i++) {const val=lo+(hi-lo)*i/4; svg+=`<line class="grid" x1="85" x2="785" y1="${y(val)}" y2="${y(val)}"/><text x="75" y="${y(val)+4}" text-anchor="end">${number(val/1000)} T€</text>`;}
    svg+=`<line class="zero" x1="85" x2="785" y1="${y(0)}" y2="${y(0)}"/>`;
    m.years.forEach((row,i)=>{
      const x=99+i*68, h=Math.abs(y(row.net)-y(0));
      svg+=`<rect x="${x}" y="${Math.min(y(row.net),y(0))}" width="36" height="${h}" rx="5" fill="${row.net<0?'#e78d93':i===0?'#f0bc76':'#88ecc2'}"><title>Jahr ${row.year}: ${euro(row.net)}</title></rect><text x="${x+18}" y="292" text-anchor="middle">${row.year}</text>`;
    });
    svg+='<text x="430" y="320" text-anchor="middle">Jahr · Zuschüsse im ersten Jahr · negative Werte rot</text>';
    $('annualChart').innerHTML=svg;
  }
  function update() { config=normalize(config); render(simulate(config)); save(); }
  function renderOffer() {
    const offer=offers[$('offerSelect').value];
    $('tenantEnabled').checked=Boolean(config.tenantEnabled);
    $('applyOffer').disabled=!offer;
    if(!offer){$('offerDetail').textContent='Kein Anbieterprofil ausgewählt. Nox kann später mit eigenen, belegten Angebotsdaten ergänzt werden.';return;}
    const h=offer.hardware,r=offer.reference;
    const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    $('offerDetail').innerHTML=`<div class="callout"><strong>${escape(offer.name)}</strong><p>${escape(h.modules)}<br>${escape(h.inverter)} · ${escape(h.battery)}<br>${escape(h.gateway)}<br>Speicher: ${number(h.usableBattery)} kWh nutzbar / ${number(h.pvsolBattery)} kWh in PV*SOL</p><p>${escape(offer.source)}</p></div><div class="energy-summary"><div><span>Angebotspreis PV</span><b>${euro(offer.parameters.pvCost)}</b></div><div><span>PV*SOL-Ertrag</span><b>${energy(r.yield)}</b></div><div><span>PV*SOL-Einspeisung</span><b>${energy(r.feed)}</b></div><div><span>PV*SOL-Autarkie</span><b>${number(r.autarky)} %</b></div><div><span>PV*SOL-Eigenverbrauch</span><b>${number(r.selfConsumption)} %</b></div></div><p><strong>Anbieterreferenz PV: ${Math.floor(r.paybackMonths/12)} Jahre ${r.paybackMonths%12} Monate Amortisation</strong> ohne zusätzlich angesetzten Mieterstromerlös. Kein Zielwert unserer kombinierten PV-/WP-Rechnung.</p><p>${escape(offer.notes)}</p><p>Mieterstrom-Annahme im Profil: 70 % × 3.500 kWh = 2.450 kWh zu 0,22 €/kWh = 539 € brutto/Jahr vor Abrechnungskosten. Strategiemodus, Degradation, verfügbarer PV-Ertrag und manuelle Änderungen können den tatsächlichen Modellwert verändern. Der Erlös wird aus den zugeordneten kWh berechnet, niemals pauschal zusätzlich addiert.</p><p>Aktive Rechenbasis: ${config.offerId===offer.id?'Dieses Profil wurde übernommen; aktuelle Eingaben und Szenarioänderungen gelten.':'Dieses Angebot wird nur angezeigt. Bitte Profilwerte übernehmen.'}</p>`;
  }
  async function exportConfig() {
    const json=JSON.stringify({version:1,model:'PV-WP-Jahresmodell-2026',house:window.energyHouseExport?.(),config:normalize(config)},null,2);
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(json); status('Konfiguration als JSON kopiert.');
    } catch (_) { download(json); status('Zwischenablage nicht verfügbar. Konfiguration als JSON heruntergeladen.'); }
  }
  function download(json) {
    const url=URL.createObjectURL(new Blob([json],{type:'application/json;charset=utf-8'}));
    const a=document.createElement('a'); a.href=url; a.download='pv-wp-konfiguration.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function init() {
    const message=document.createElement('p'); message.id='appStatus'; message.setAttribute('role','status'); message.setAttribute('aria-live','polite'); document.querySelector('main').prepend(message);
    Object.values(offers).forEach(offer=>{const option=document.createElement('option');option.value=offer.id;option.textContent=offer.name;$('offerSelect').appendChild(option);});
    load(); controls(); sync(); render(simulate(config));
    $('offerSelect').addEventListener('change',renderOffer);
    $('applyOffer').addEventListener('click',()=>{config=applyOffer(config,$('offerSelect').value);sync();update();status('Angebotsprofil übernommen. PV*SOL-Referenzen bleiben getrennt von der eigenen Simulation.');});
    $('tenantEnabled').addEventListener('change',event=>{config.tenantEnabled=event.target.checked?1:0;config.scenario='Manuell';sync();update();});
    document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=> {
      document.querySelectorAll('[data-tab]').forEach(b=> { b.classList.toggle('active',b===button); b.setAttribute('aria-pressed',String(b===button)); });
      document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===button.dataset.tab));
    }));
    $('scenarioSelect').addEventListener('change',event=> {
      config.scenario=event.target.value;
      if (presets[config.scenario]) scenarioKeys.forEach((key,i)=> { config[key]=presets[config.scenario][i]; });
      status(''); sync(); update();
    });
    $('strategyMode').addEventListener('change',event=> { config.strategy=event.target.value; update(); });
    ['batteryCapacity','socMin','socTarget'].forEach(key=>$(key).addEventListener('input',event=> { config[key]=Number(event.target.value); update(); }));
    $('timeButtons').addEventListener('click',event=> { const button=event.target.closest('[data-time]'); if(button) {config.timeIndex=Number(button.dataset.time); update();} });
    $('resetBtn').addEventListener('click',()=> {config=defaults(); status('Standardwerte wiederhergestellt.'); sync(); update(); });
    $('shareBtn').addEventListener('click',exportConfig);
    $('downloadBtn').addEventListener('click',()=>download(JSON.stringify({version:1,model:'PV-WP-Jahresmodell-2026',house:window.energyHouseExport?.(),config},null,2)));
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

