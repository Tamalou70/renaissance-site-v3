// Site Renaissance Roleplay (v3, « Archives du Directoire ») : lampe torche, rapport déclassifié, poste radio, voies.

const LIENS = {
  discord: 'https://discord.gg/K6rYRdWQD',
  bd: 'https://tamalou70.github.io/heritage-38eme-parallele/',
};
const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
// ?capture : page entière figée pour une capture d'écran (héros de 900 px, rapport déjà déclassifié)
const CAPTURE = new URLSearchParams(location.search).has('capture');
if (CAPTURE) document.documentElement.classList.add('capture');
const memoire = {
  lire(cle, defaut) { try { return JSON.parse(localStorage.getItem(cle)) ?? defaut; } catch { return defaut; } },
  ecrire(cle, valeur) { try { localStorage.setItem(cle, JSON.stringify(valeur)); } catch { /* navigation privée */ } },
};

// ---------- Liens ----------
document.querySelectorAll('[data-lien]').forEach(a => {
  const url = LIENS[a.dataset.lien];
  if (!url) { a.classList.add('indisponible'); a.removeAttribute('href'); return; }
  a.href = url; a.target = '_blank'; a.rel = 'noopener';
});

// ---------- Lampe torche ----------
(() => {
  const lampe = document.getElementById('lampe');
  let cible = { x: lampe.clientWidth * 0.62, y: lampe.clientHeight * 0.42 }, pos = { ...cible };
  let dernierGeste = -1e9, visible = true;
  const tactile = matchMedia('(hover: none)').matches;

  function viser(e) {
    const r = lampe.getBoundingClientRect();
    cible = { x: e.clientX - r.left, y: e.clientY - r.top };
    dernierGeste = performance.now();
  }
  lampe.addEventListener('pointermove', viser);
  lampe.addEventListener('pointerdown', viser);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(lampe);

  (function boucle(t) {
    requestAnimationFrame(boucle);
    if (!visible || document.hidden) return;
    const w = lampe.clientWidth, h = lampe.clientHeight;
    // sans geste depuis un moment (ou sur téléphone) : la lampe balaie le cratère toute seule
    if (t - dernierGeste > (tactile ? 2500 : 5000)) {
      cible = { x: w * (0.6 + 0.26 * Math.sin(t / 3100)), y: h * (0.46 + 0.14 * Math.sin(t / 2300 + 1)) };
    }
    const k = calme ? 1 : 0.12;
    pos.x += (cible.x - pos.x) * k; pos.y += (cible.y - pos.y) * k;
    // légère vie de la flamme : le rayon respire et tremble à peine
    const r = Math.min(w, h) * (tactile ? 0.42 : 0.34) * (calme ? 1 : 1 + Math.sin(t / 900) * 0.02 + (Math.random() - 0.5) * 0.015);
    lampe.style.setProperty('--mx', `${pos.x}px`);
    lampe.style.setProperty('--my', `${pos.y}px`);
    lampe.style.setProperty('--r', `${r}px`);
  })(0);
})();

// ---------- Rapport : les barres noires se lèvent quand on le lit ----------
(() => {
  const doc = document.getElementById('document');
  const barres = doc.querySelectorAll('.noir');
  barres.forEach((b, i) => b.style.setProperty('--i', i));
  doc.style.setProperty('--fin', `${barres.length * 0.45 + 0.9}s`);
  if (CAPTURE) { doc.classList.add('declassifie'); return; }
  new IntersectionObserver(([e], obs) => {
    if (e.isIntersecting) { doc.classList.add('declassifie'); obs.disconnect(); }
  }, { threshold: 0.45 }).observe(doc);
})();

// ---------- Poste radio ----------
const STATIONS = [
  { f: 884, source: 'Officier · 1945', texte: '« Bouclez le périmètre ! Personne n\'approche, c\'est un ordre ! »', son: 'sons/p01-c04-t02.mp3' },
  { f: 917, source: 'Officier · 1968', texte: '« Creusez plus profond. Personne ne doit jamais savoir ce qu\'on cache ici. »', son: 'sons/p02-c01-t02.mp3' },
  { f: 952, source: 'Laboratoire · 1968', texte: '« Elle réagit à notre présence… Sa lumière augmente. »', son: 'sons/p02-c02-t02.mp3' },
  { f: 998, source: 'Bulletin officiel · 2022', texte: '« Quarantaine biologique de niveau 4, suite à la fragilisation de fûts de déchets toxiques. Restez chez vous. »', son: 'sons/p04-c04-t01.mp3' },
  { f: 1031, source: 'Conseil d\'administration · 1995', texte: '« Il faut que tout cela reste top secret. »', son: 'sons/p03-c03-t02.mp3' },
  { f: 1066, source: 'Inconnu · près du Mur', texte: '« Tu entends ça ? Ce n\'est pas une station normale… »', son: 'sons/p05-c03-t02.mp3' },
  { f: 1077, source: 'Signal non identifié', texte: '[ Langue inconnue. Aucune correspondance dans les archives. ]', son: null },
];
const MIN = 875, MAX = 1080, LARGEUR_SIGNAL = 6; // en dixièmes de MHz

const Radio = (() => {
  const curseur = document.getElementById('curseur'), aiguille = document.getElementById('aiguille');
  const affichage = document.getElementById('frequence'), barres = document.querySelectorAll('.signal i');
  const transcription = document.getElementById('transcription'), interrupteur = document.getElementById('interrupteur');
  const journal = document.getElementById('journal'), compte = document.getElementById('compte');
  const oscillo = document.getElementById('oscillo'), go = oscillo.getContext('2d');
  let trouves = new Set(memoire.lire('ren_ecoute', []));
  let ctx = null, sortie = null, analyse = null, gBruit = null, gVoix = null, gMystere = null;
  const tampons = {};
  let stationJouee = null, voixEnCours = null, minuterieVoix = 0;

  // graduations du cadran
  const grad = document.getElementById('graduations');
  for (let f = 880; f <= 1080; f += 5) {
    const i = document.createElement('i');
    i.style.left = `${((f - MIN) / (MAX - MIN)) * 100}%`;
    if (f % 20 === 0) {
      i.className = 'grande';
      const b = document.createElement('b'); b.textContent = f / 10; b.style.left = i.style.left;
      if ((f / 20) % 2) b.className = 'secondaire'; // masqué sur téléphone
      grad.appendChild(b);
    }
    grad.appendChild(i);
  }

  function dessinerJournal() {
    journal.textContent = '';
    STATIONS.forEach(s => {
      const li = document.createElement('li');
      if (trouves.has(s.f)) { li.className = 'trouve'; li.innerHTML = `<b>${(s.f / 10).toFixed(1)} MHz</b>`; li.append(s.source); }
      else li.innerHTML = '<b>— — . — MHz</b>Non captée';
      journal.appendChild(li);
    });
    compte.textContent = `${trouves.size} / ${STATIONS.length}`;
  }

  function proche(f) {
    let meilleur = null, force = 0;
    for (const s of STATIONS) {
      const p = Math.max(0, 1 - Math.abs(f - s.f) / LARGEUR_SIGNAL);
      if (p > force) { force = p; meilleur = s; }
    }
    return { station: meilleur, force };
  }

  function regler(f) {
    f = Math.max(MIN, Math.min(MAX, Math.round(f)));
    curseur.value = f;
    affichage.textContent = (f / 10).toFixed(1);
    aiguille.style.left = `calc(${((f - MIN) / (MAX - MIN)) * 100}% - 1px)`;
    const { station, force } = proche(f);
    barres.forEach((b, i) => b.classList.toggle('allume', force > i / 5 + 0.05));
    const capte = force > 0.55;
    transcription.classList.toggle('capte', capte);
    transcription.querySelector('.transcription-source').textContent = capte ? `${(station.f / 10).toFixed(1)} MHz · ${station.source}` : force > 0.1 ? 'Signal faible…' : 'Aucun signal';
    transcription.querySelector('.transcription-texte').textContent = capte ? station.texte : 'Grésillements.';
    if (capte && !trouves.has(station.f)) { trouves.add(station.f); memoire.ecrire('ren_ecoute', [...trouves]); dessinerJournal(); }
    if (ctx) mixer(station, force);
  }

  // ----- son -----
  function bruitBlanc(secondes) {
    const n = ctx.sampleRate * secondes, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function saturation(k) {
    const c = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; c[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
    return c;
  }
  async function allumer() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    sortie = ctx.createGain(); sortie.gain.value = 0.9;
    analyse = ctx.createAnalyser(); analyse.fftSize = 1024;
    sortie.connect(analyse).connect(ctx.destination);

    const bruit = ctx.createBufferSource(); bruit.buffer = bruitBlanc(3); bruit.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 0.6;
    gBruit = ctx.createGain(); gBruit.gain.value = 0.18;
    bruit.connect(bp).connect(gBruit).connect(sortie); bruit.start();

    // chaîne « radio » des voix : bande étroite et légère saturation
    gVoix = ctx.createGain(); gVoix.gain.value = 0;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 380;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3100;
    const sat = ctx.createWaveShaper(); sat.curve = saturation(6);
    gVoix.connect(hp).connect(lp).connect(sat).connect(sortie);

    // le signal non identifié : deux tons qui glissent, modulés, comme une langue que personne ne connaît
    gMystere = ctx.createGain(); gMystere.gain.value = 0;
    const hache = ctx.createGain(); hache.gain.value = 0.5; // haché par un créneau, avant le volume de la station
    hache.connect(gMystere);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 3.3;
    const lfoG = ctx.createGain(); lfoG.gain.value = 140; lfo.connect(lfoG);
    for (const base of [420, 633]) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = base;
      lfoG.connect(o.frequency);
      const g = ctx.createGain(); g.gain.value = 0.12; o.connect(g).connect(hache); o.start();
    }
    const trem = ctx.createOscillator(); trem.frequency.value = 7; trem.type = 'square';
    const tremG = ctx.createGain(); tremG.gain.value = 0.5; trem.connect(tremG).connect(hache.gain);
    lfo.start(); trem.start();
    gMystere.connect(hp);

    await Promise.all(STATIONS.filter(s => s.son).map(async s => {
      try { tampons[s.f] = await ctx.decodeAudioData(await (await fetch(s.son)).arrayBuffer()); } catch { /* fichier absent : texte seul */ }
    }));
    regler(+curseur.value);
  }

  function jouerVoix(s) {
    clearTimeout(minuterieVoix);
    if (voixEnCours) { try { voixEnCours.stop(); } catch { } voixEnCours = null; }
    if (!s || !tampons[s.f]) return;
    const src = ctx.createBufferSource(); src.buffer = tampons[s.f]; src.connect(gVoix); src.start();
    voixEnCours = src;
    src.onended = () => { if (stationJouee === s) minuterieVoix = setTimeout(() => stationJouee === s && jouerVoix(s), 1600); };
  }

  function mixer(station, force) {
    const t = ctx.currentTime;
    const voix = station && station.son ? force : 0, mystere = station && !station.son ? force : 0;
    gVoix.gain.setTargetAtTime(Math.pow(voix, 1.4) * 1.1, t, 0.05);
    gMystere.gain.setTargetAtTime(mystere * 0.5, t, 0.05);
    gBruit.gain.setTargetAtTime(0.2 * (1 - 0.8 * force), t, 0.05);
    const s = force > 0.15 ? station : null;
    if (s !== stationJouee) { stationJouee = s; jouerVoix(s && s.son ? s : null); }
  }

  interrupteur.addEventListener('click', async () => {
    const allume = interrupteur.getAttribute('aria-pressed') !== 'true';
    interrupteur.setAttribute('aria-pressed', String(allume));
    interrupteur.querySelector('.interrupteur-texte').textContent = allume ? 'Éteindre le poste' : 'Allumer le poste';
    if (allume) { if (!ctx) await allumer(); else await ctx.resume(); }
    else if (ctx) await ctx.suspend();
  });
  document.addEventListener('visibilitychange', () => {
    if (ctx && document.hidden) ctx.suspend();
    else if (ctx && interrupteur.getAttribute('aria-pressed') === 'true') ctx.resume();
  });

  curseur.addEventListener('input', () => regler(+curseur.value));
  document.querySelectorAll('.reglage button').forEach(b => b.addEventListener('click', () => regler(+curseur.value + +b.dataset.pas)));

  // oscilloscope : ligne plate poste éteint, onde réelle du son sinon
  const donnees = new Uint8Array(1024);
  (function trace() {
    requestAnimationFrame(trace);
    const r = Math.min(devicePixelRatio || 1, 2), w = oscillo.clientWidth, h = oscillo.clientHeight;
    if (oscillo.width !== w * r) { oscillo.width = w * r; oscillo.height = h * r; }
    go.setTransform(r, 0, 0, r, 0, 0);
    go.clearRect(0, 0, w, h);
    go.strokeStyle = 'rgba(184, 255, 198, .85)'; go.lineWidth = 1.2; go.shadowBlur = 6; go.shadowColor = 'rgba(125,255,154,.6)';
    go.beginPath();
    const actif = ctx && ctx.state === 'running';
    if (actif) analyse.getByteTimeDomainData(donnees);
    for (let i = 0; i < w; i++) {
      const v = actif ? (donnees[Math.floor((i / w) * donnees.length)] - 128) / 128 : 0;
      const y = h / 2 + v * h * 0.45;
      i ? go.lineTo(i, y) : go.moveTo(i, y);
    }
    go.stroke();
  })();

  dessinerJournal();
  regler(CAPTURE ? 952 : 880);
})();

// ---------- Choisir sa voie (mémorisé dans ce navigateur) ----------
(() => {
  const NOMS = { revelateurs: 'Les Révélateurs', ombre: 'Les Maîtres de l\'ombre', eveilles: 'Les Éveillés' };
  const boutons = document.querySelectorAll('.voie'), resultat = document.getElementById('resultat');
  function choisir(v) {
    boutons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.voie === v)));
    resultat.textContent = v ? `Votre voie : ${NOMS[v]}. Elle se défend en jeu, au sud du Mur.` : '';
  }
  boutons.forEach(b => b.addEventListener('click', () => { choisir(b.dataset.voie); memoire.ecrire('ren_voie', b.dataset.voie); }));
  choisir(memoire.lire('ren_voie', null));
})();
