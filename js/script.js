document.getElementById('year').textContent = new Date().getFullYear();

const header = document.getElementById('header');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navLinks.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  revealObserver.observe(el);
});

// Active nav link
const navAnchors = [...navLinks.querySelectorAll('a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navAnchors.forEach((a) =>
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`)
      );
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

// Count-up stats
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countObserver.unobserve(el);
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

// Experience tabs
const tabs = document.querySelectorAll('.xp-tab');
tabs.forEach((tab) =>
  tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('.xp-panel').forEach((p) => {
      p.hidden = p.id !== tab.dataset.tab;
    });
  })
);

// Decorative hero telemetry
const socEl = document.getElementById('soc');
const socBar = document.getElementById('socBar');
const psetEl = document.getElementById('pset');
const spark = document.getElementById('sparkLine');
const series = Array.from({ length: 20 }, (_, i) => 4.8 + Math.sin(i / 2) * 0.4);
let soc = 72;

function tick() {
  soc = Math.min(88, Math.max(45, soc + (Math.random() - 0.5) * 3));
  socEl.textContent = Math.round(soc);
  socBar.style.width = `${soc}%`;

  const next = Math.min(5.6, Math.max(4.0, series[series.length - 1] + (Math.random() - 0.5) * 0.5));
  series.push(next);
  series.shift();
  psetEl.textContent = next.toFixed(1);
  spark.setAttribute('points', series.map((v, i) => `${(i / 19) * 100},${22 - ((v - 4) / 1.6) * 20}`).join(' '));
}

tick();
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(tick, 1800);

// Spotlight on expertise tiles
document.querySelectorAll('.tile').forEach((tile) =>
  tile.addEventListener('pointermove', (e) => {
    const r = tile.getBoundingClientRect();
    tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
    tile.style.setProperty('--my', `${e.clientY - r.top}px`);
  })
);

// ---------- Simulated VPP control room ----------
const cr = document.querySelector('.cr');
if (cr) {
  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const N = 60; // chart points
  const setSeries = Array.from({ length: N }, () => 5);
  const actSeries = Array.from({ length: N }, () => 5);
  const yMin = 0, yMax = 10;

  const toY = (v) => 190 - ((v - yMin) / (yMax - yMin)) * 180;
  const toPts = (arr) => arr.map((v, i) => `${(i / (N - 1)) * 600},${toY(v).toFixed(1)}`).join(' ');

  const assets = [
    { name: 'BESS Essen 01', proto: 'IEC 104', pw: 4.2, soc: 72, mode: 'dis' },
    { name: 'BESS Dortmund 02', proto: 'IEC 104', pw: 3.1, soc: 58, mode: 'dis' },
    { name: 'BESS Duisburg 03', proto: 'Modbus', pw: -2.4, soc: 41, mode: 'chg' },
    { name: 'PV Park Recklinghausen', proto: 'IEC 104', pw: 6.8, soc: null, mode: 'gen' },
    { name: 'BESS Bochum 04', proto: 'Modbus', pw: 0, soc: 66, mode: 'idle' },
    { name: 'BESS Gelsenkirchen 05', proto: 'IEC 104', pw: 1.9, soc: 83, mode: 'dis' },
    { name: 'PV Roofing Essen', proto: 'MQTT', pw: 1.2, soc: null, mode: 'gen' },
    { name: 'BESS Mülheim 06', proto: 'Modbus', pw: -1.1, soc: 49, mode: 'chg' },
  ];

  const assetsEl = $('assets');
  assetsEl.innerHTML = assets
    .map((a) => {
      const socCell = a.soc === null
        ? '<span class="proto">—</span>'
        : `<span class="soc"><span class="track"><span class="fill" style="width:${a.soc}%"></span></span>${a.soc}%</span>`;
      const modeLabel = { chg: 'Charging', dis: 'Discharging', idle: 'Standby', gen: 'Generating' }[a.mode];
      return `<div class="asset" data-name="${a.name}">
        <span class="name"><i class="dot ok"></i>${a.name}</span>
        <span class="proto">${a.proto}</span>
        <span class="pw">${a.pw > 0 ? '+' : ''}${a.pw.toFixed(1)} MW</span>
        ${socCell}
        <span class="mode ${a.mode}">${modeLabel}</span>
      </div>`;
    })
    .join('');
  $('assetCount').textContent = `${assets.length} assets`;

  const logEl = $('log');
  const logTags = ['SCADA', 'VPP', 'BESS', 'GRID', 'IEC104'];
  const logMsgs = [
    'Schedule received for next 15-min interval',
    'Setpoint acknowledged by BESS Essen 01',
    'Telemetry snapshot stored (60 s window)',
    'Frequency deviation within band',
    'Modbus poll cycle completed, 0 errors',
    'State of charge balanced across fleet',
    'FCR reserve confirmed for delivery period',
    'Asset heartbeat OK across all gateways',
    'Ramp-rate limit applied to BESS Dortmund 02',
    'Day-ahead position updated in dispatch plan',
  ];
  const warnMsgs = [
    'BESS Bochum 04 in standby — awaiting schedule',
    'Latency spike on Modbus gateway, retrying',
  ];

  function addLog(msg, warn = false) {
    const li = document.createElement('li');
    const t = new Date().toLocaleTimeString('en-GB');
    li.innerHTML = `<time>${t}</time><span class="tag${warn ? ' w' : ''}">${warn ? 'WARN' : logTags[Math.floor(Math.random() * logTags.length)]}</span>${msg}`;
    logEl.prepend(li);
    while (logEl.children.length > 14) logEl.lastChild.remove();
  }

  let out = 14.7, freq = 50.002, energy = 61.4, msgs = 840, fcr = 6.0;

  function tickCR() {
    // setpoint: slow random-walk schedule; actual chases it
    const target = clamp(setSeries[N - 1] + rand(-0.8, 0.8), 1, 9);
    setSeries.push(target); setSeries.shift();
    const prev = actSeries[N - 1];
    actSeries.push(clamp(prev + (target - prev) * 0.45 + rand(-0.25, 0.25), 0.5, 9.5));
    actSeries.shift();

    $('chartSet').setAttribute('points', toPts(setSeries));
    $('chartAct').setAttribute('points', toPts(actSeries));
    const d = `M0,${toY(actSeries[0]).toFixed(1)} ` + actSeries.map((v, i) => `L${((i / (N - 1)) * 600).toFixed(1)},${toY(v).toFixed(1)}`).join(' ') + ` L600,200 L0,200 Z`;
    $('chartArea').setAttribute('d', d);

    // KPIs
    const act = actSeries[N - 1];
    const outNew = clamp(out + rand(-0.6, 0.6), 8, 22);
    $('kOut').textContent = outNew.toFixed(1);
    $('kOutDelta').textContent = `${outNew >= out ? '▲' : '▼'} ${Math.abs(outNew - out).toFixed(1)}`;
    $('kOutDelta').className = outNew >= out ? 'up' : 'down';
    out = outNew;

    freq = clamp(freq + rand(-0.012, 0.012), 49.96, 50.04);
    $('kFreq').textContent = freq.toFixed(3);
    $('kFreqDev').textContent = `Δ ${Math.round((freq - 50) * 1000)} mHz`;
    $('needle').style.transform = `rotate(${clamp((freq - 50) * 1800, -90, 90)}deg)`;

    energy = clamp(energy + rand(-0.8, 0.8), 20, 92);
    $('kEnergy').textContent = energy.toFixed(1);

    msgs = Math.round(clamp(msgs + rand(-40, 40), 700, 980));
    $('kMsgs').textContent = msgs;
    $('kLat').textContent = `Latency ${Math.round(rand(6, 24))} ms`;

    $('kFcr').textContent = fcr.toFixed(1);
    $('lIec').textContent = `${Math.round(rand(8, 18))} ms`;
    $('lMb').textContent = `${Math.round(rand(5, 12))} ms`;
    $('lMq').textContent = `${Math.round(rand(15, 30))} ms`;

    // asset rows: small power/soc drift
    document.querySelectorAll('.asset').forEach((row, i) => {
      const a = assets[i];
      if (a.soc !== null) {
        a.soc = clamp(a.soc + (a.mode === 'chg' ? rand(0, 0.4) : a.mode === 'dis' ? rand(-0.4, 0) : rand(-0.1, 0.1)), 5, 98);
        row.querySelector('.fill').style.width = `${a.soc}%`;
        row.querySelector('.soc').lastChild.textContent = `${Math.round(a.soc)}%`;
      }
      if (a.mode !== 'idle') {
        a.pw = clamp(a.pw + rand(-0.15, 0.15), -5, 8);
        row.querySelector('.pw').textContent = `${a.pw > 0 ? '+' : ''}${a.pw.toFixed(1)} MW`;
      }
    });

    $('crClock').textContent = new Date().toLocaleTimeString('en-GB');
  }

  tickCR();
  addLog('Control room connected — streaming simulated telemetry');
  if (!reduced) {
    setInterval(tickCR, 1500);
    setInterval(() => addLog(logMsgs[Math.floor(Math.random() * logMsgs.length)]), 4200);
    setInterval(() => addLog(warnMsgs[Math.floor(Math.random() * warnMsgs.length)], true), 15000);
  }

  // pause the simulation while off-screen
  let timer = null;
  new IntersectionObserver(([e]) => {
    if (reduced) return;
    if (e.isIntersecting && !timer) {
      timer = setInterval(tickCR, 1500);
    } else if (!e.isIntersecting && timer) {
      clearInterval(timer); timer = null;
    }
  }, { threshold: 0.1 }).observe(cr);
}
