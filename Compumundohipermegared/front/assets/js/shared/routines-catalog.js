/**
 * Catálogo oficial FitPower — valores de cada rutina del manual.
 */
(function (global) {
  function ex(name, detail, rest, videoUrl) {
    return { name: name, detail: detail, rest: rest || '-', videoUrl: videoUrl || '' };
  }

  var YT = {
    bike: 'https://www.youtube.com/watch?v=R0mMyV5OtcM',
    mobility: 'https://www.youtube.com/watch?v=c7VPDXnJT_0',
    bands: 'https://www.youtube.com/watch?v=IODxDxX7oiE',
    squat: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
    bench: 'https://www.youtube.com/watch?v=rT7DgAp-b2c',
    lat: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    rdl: 'https://www.youtube.com/watch?v=2SHsk9AzdjA',
    ohp: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
    curl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    dips: 'https://www.youtube.com/watch?v=0326dy_-CzM',
    plank: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    crunch: 'https://www.youtube.com/watch?v=Xyd_fa5zoEU',
    stretch: 'https://www.youtube.com/watch?v=g_tea8ZNk5A',
    rower: 'https://www.youtube.com/watch?v=zQ82RYIFLN8',
    deadlift: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    incline: 'https://www.youtube.com/watch?v=DbFgADa2PL8',
    pullup: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    lunges: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U',
    arnold: 'https://www.youtube.com/watch?v=6Z15_WdXmVw',
    facepull: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
    farmer: 'https://www.youtube.com/watch?v=rt17lmnaLSM',
    sideplank: 'https://www.youtube.com/watch?v=K2VljzCC16g',
    rope: 'https://www.youtube.com/watch?v=1BZM2Vre5oc',
    shadow: 'https://www.youtube.com/watch?v=kL2oLjiZ2nU',
    bag: 'https://www.youtube.com/watch?v=xSUXMwqZ3z0',
    burpee: 'https://www.youtube.com/watch?v=TU8QYVW0gDU',
    pushup: 'https://www.youtube.com/watch?v=IODxDxX7oiE',
    abs: 'https://www.youtube.com/watch?v=3p8EBPVZ2Iw',
    run: 'https://www.youtube.com/watch?v=5dbVEQKpBxY',
    ladder: 'https://www.youtube.com/watch?v=AG7g2f_5Q0I',
    pads: 'https://www.youtube.com/watch?v=2L2lnxIcWMo',
    battlerope: 'https://www.youtube.com/watch?v=r2RMN4l6tQI',
    medball: 'https://www.youtube.com/watch?v=ml6cT4AHmdw',
    breath: 'https://www.youtube.com/watch?v=K56Z12XNQ5c',
    hundred: 'https://www.youtube.com/watch?v=2IcWJobNDck',
    rollup: 'https://www.youtube.com/watch?v=i6iu4pqR5lA',
    bridge: 'https://www.youtube.com/watch?v=f5nPKdU_s6I',
    spine: 'https://www.youtube.com/watch?v=pLxSx_E1vG0',
    swan: 'https://www.youtube.com/watch?v=lLgYiXLTQJM',
    sidekick: 'https://www.youtube.com/watch?v=0Z2YcYk0k0Y',
    legcircles: 'https://www.youtube.com/watch?v=Zz6tqfzYkJQ',
    cat: 'https://www.youtube.com/watch?v=kqnua4rHVQU',
    teaser: 'https://www.youtube.com/watch?v=2IcWJobNDck',
    swimming: 'https://www.youtube.com/watch?v=i6iu4pqR5lA',
    salsa: 'https://www.youtube.com/watch?v=8DZktowZo_k',
    merengue: 'https://www.youtube.com/watch?v=fpja5v0kV8s',
    reggaeton: 'https://www.youtube.com/watch?v=8DZktowZo_k',
    cumbia: 'https://www.youtube.com/watch?v=fpja5v0kV8s',
    bachata: 'https://www.youtube.com/watch?v=8DZktowZo_k',
    samba: 'https://www.youtube.com/watch?v=fpja5v0kV8s',
    pop: 'https://www.youtube.com/watch?v=8DZktowZo_k',
    hiphop: 'https://www.youtube.com/watch?v=fpja5v0kV8s',
    spin: 'https://www.youtube.com/watch?v=Ag7Dui9Plys',
    spinHiit: 'https://www.youtube.com/watch?v=5X7rmRF0yUs',
    hydroWalk: 'https://www.youtube.com/watch?v=ErsH0x5suiA',
    hydroRun: 'https://www.youtube.com/watch?v=oqQvjr1i3tY',
    hydroJump: 'https://www.youtube.com/watch?v=ErsH0x5suiA',
    hydroKick: 'https://www.youtube.com/watch?v=oqQvjr1i3tY',
  };

  var IMG = {
    musculacion: '/assets/img/activities/musculacion.png',
    boxeo: '/assets/img/activities/boxeo.png',
    pilates: '/assets/img/activities/pilates.png',
    zumba: '/assets/img/activities/zumba.png',
    spinning: '/assets/img/activities/spinning.png',
    hidro: '/assets/img/activities/hidrogimnasia.png',
  };

  var routines = [
    {
      id: 'musculacion-hipertrofia',
      categoryId: 'musculacion',
      category: 'MUSCULACIÓN',
      label: 'Hipertrofia Full Body',
      title: 'HIPERTROFIA FULL BODY',
      desc: 'Rutina 1 · Duración: 70 minutos. Calentamiento, bloque principal, core y vuelta a la calma.',
      image: IMG.musculacion,
      videoUrl: YT.squat,
      exercises: [
        ex('Bicicleta o cinta', '5 min', '-', YT.bike),
        ex('Movilidad dinámica', 'Calentamiento', '-', YT.mobility),
        ex('Activación con bandas elásticas', 'Calentamiento', '-', YT.bands),
        ex('Sentadilla con barra', '4 × 8-10', '90 s', YT.squat),
        ex('Press de banca', '4 × 8-10', '90 s', YT.bench),
        ex('Jalón al pecho', '4 × 10', '75 s', YT.lat),
        ex('Peso muerto rumano', '3 × 10', '90 s', YT.rdl),
        ex('Press militar', '3 × 12', '60 s', YT.ohp),
        ex('Curl de bíceps con barra', '3 × 12', '60 s', YT.curl),
        ex('Fondos en banco', '3 × 15', '60 s', YT.dips),
        ex('Plancha frontal', '3 × 45 s', '-', YT.plank),
        ex('Crunch en polea', '3 × 20', '-', YT.crunch),
        ex('Estiramientos generales', '8 min', '-', YT.stretch),
      ],
    },
    {
      id: 'musculacion-fuerza',
      categoryId: 'musculacion',
      category: 'MUSCULACIÓN',
      label: 'Fuerza Funcional',
      title: 'FUERZA FUNCIONAL',
      desc: 'Rutina 2 · Calentamiento, bloque principal de fuerza y final.',
      image: IMG.musculacion,
      videoUrl: YT.deadlift,
      exercises: [
        ex('Remo ergómetro', '8 min', '-', YT.rower),
        ex('Movilidad articular', 'Calentamiento', '-', YT.mobility),
        ex('Peso muerto', '5 × 5', '-', YT.deadlift),
        ex('Press inclinado', '4 × 8', '-', YT.incline),
        ex('Dominadas asistidas', '4 × 8', '-', YT.pullup),
        ex('Zancadas con mancuernas', '3 × 12', '-', YT.lunges),
        ex('Press Arnold', '3 × 10', '-', YT.arnold),
        ex('Face Pull', '3 × 15', '-', YT.facepull),
        ex('Farmer Walk', '4 × 30 m', '-', YT.farmer),
        ex('Plancha lateral', '3 × 40 s', '-', YT.sideplank),
      ],
    },
    {
      id: 'boxeo-tecnica',
      categoryId: 'boxeo',
      category: 'BOXEO',
      label: 'Técnica y Potencia',
      title: 'TÉCNICA Y POTENCIA',
      desc: 'Rutina 1 · Duración: 60 minutos. Activación, técnica, potencia, condicionamiento y estiramientos.',
      image: IMG.boxeo,
      videoUrl: YT.shadow,
      exercises: [
        ex('Cuerda', '5 min', '-', YT.rope),
        ex('Movilidad y coordinación', '5 min', '-', YT.mobility),
        ex('Sombra', '3 rounds', '-', YT.shadow),
        ex('Combinaciones (1-2, 1-2-3, 2-3-2)', '4 rounds', '-', YT.shadow),
        ex('Trabajo de desplazamientos', '3 rounds', '-', YT.shadow),
        ex('Saco pesado', '6 rounds × 2 min', '45 s', YT.bag),
        ex('Burpees', '×15 · 4 vueltas', '-', YT.burpee),
        ex('Flexiones', '×20 · 4 vueltas', '-', YT.pushup),
        ex('Abdominales', '×25 · 4 vueltas', '-', YT.abs),
        ex('Estiramientos', 'Final', '-', YT.stretch),
      ],
    },
    {
      id: 'boxeo-resistencia',
      categoryId: 'boxeo',
      category: 'BOXEO',
      label: 'Resistencia de Combate',
      title: 'RESISTENCIA DE COMBATE',
      desc: 'Rutina 2 · Calentamiento, circuito de 5 estaciones (3 vueltas) y final.',
      image: IMG.boxeo,
      videoUrl: YT.bag,
      exercises: [
        ex('Carrera suave', 'Calentamiento', '-', YT.run),
        ex('Cuerda', 'Calentamiento', '-', YT.rope),
        ex('Golpes al saco', '2 min · 3 vueltas', '-', YT.bag),
        ex('Escalera de coordinación', '3 vueltas', '-', YT.ladder),
        ex('Golpes con manoplas', '3 vueltas', '-', YT.pads),
        ex('Battle Rope', '45 s · 3 vueltas', '-', YT.battlerope),
        ex('Golpes explosivos con balón medicinal', '3 vueltas', '-', YT.medball),
        ex('Trabajo abdominal', 'Final', '-', YT.abs),
        ex('Respiración y elongación', 'Final', '-', YT.stretch),
      ],
    },
    {
      id: 'pilates-control',
      categoryId: 'pilates',
      category: 'PILATES',
      label: 'Control y Estabilidad',
      title: 'CONTROL Y ESTABILIDAD',
      desc: 'Rutina 1 · Respiración, ejercicios (3 series c/u) y relajación.',
      image: IMG.pilates,
      videoUrl: YT.hundred,
      exercises: [
        ex('Respiración', '5 min', '-', YT.breath),
        ex('Hundred', '3 series', '-', YT.hundred),
        ex('Roll Up', '3 series', '-', YT.rollup),
        ex('Shoulder Bridge', '3 series', '-', YT.bridge),
        ex('Spine Stretch', '3 series', '-', YT.spine),
        ex('Swan', '3 series', '-', YT.swan),
        ex('Side Kick', '3 series', '-', YT.sidekick),
        ex('Leg Circles', '3 series', '-', YT.legcircles),
        ex('Relajación', '10 min', '-', YT.stretch),
      ],
    },
    {
      id: 'pilates-core',
      categoryId: 'pilates',
      category: 'PILATES',
      label: 'Core y Flexibilidad',
      title: 'CORE Y FLEXIBILIDAD',
      desc: 'Rutina 2 · Activación, bloque principal y enfriamiento.',
      image: IMG.pilates,
      videoUrl: YT.teaser,
      exercises: [
        ex('Respiración diafragmática', 'Activación', '-', YT.breath),
        ex('Movilidad vertebral', 'Activación', '-', YT.mobility),
        ex('Cat Stretch', 'Bloque principal', '-', YT.cat),
        ex('Double Leg Stretch', 'Bloque principal', '-', YT.hundred),
        ex('Teaser', 'Bloque principal', '-', YT.teaser),
        ex('Swimming', 'Bloque principal', '-', YT.swimming),
        ex('Corkscrew', 'Bloque principal', '-', YT.rollup),
        ex('Side Plank', 'Bloque principal', '-', YT.sideplank),
        ex('Mermaid Stretch', 'Bloque principal', '-', YT.spine),
        ex('Estiramientos globales', 'Enfriamiento', '-', YT.stretch),
      ],
    },
    {
      id: 'zumba-cardio',
      categoryId: 'zumba',
      category: 'ZUMBA',
      label: 'Cardio Dance',
      title: 'CARDIO DANCE',
      desc: 'Rutina 1 · Duración: 55 minutos. Calentamiento, parte principal y fin.',
      image: IMG.zumba,
      videoUrl: YT.salsa,
      exercises: [
        ex('Salsa', 'Calentamiento', '-', YT.salsa),
        ex('Merengue', 'Calentamiento', '-', YT.merengue),
        ex('Reggaetón', 'Parte principal', '-', YT.reggaeton),
        ex('Cumbia', 'Parte principal', '-', YT.cumbia),
        ex('Bachata', 'Parte principal', '-', YT.bachata),
        ex('Samba', 'Parte principal', '-', YT.samba),
        ex('Pop Latino', 'Parte principal', '-', YT.pop),
        ex('Core con música', 'Fin', '-', YT.abs),
        ex('Estiramientos', 'Fin', '-', YT.stretch),
      ],
    },
    {
      id: 'zumba-dance',
      categoryId: 'zumba',
      category: 'ZUMBA',
      label: 'Dance Fitness',
      title: 'DANCE FITNESS',
      desc: 'Rutina 2 · Calentamiento, bloque aeróbico y bloque final.',
      image: IMG.zumba,
      videoUrl: YT.hiphop,
      exercises: [
        ex('Movilidad y pasos básicos', 'Calentamiento', '-', YT.mobility),
        ex('Hip Hop', 'Bloque aeróbico', '-', YT.hiphop),
        ex('Dance', 'Bloque aeróbico', '-', YT.pop),
        ex('Salsa', 'Bloque aeróbico', '-', YT.salsa),
        ex('Electrónica Latina', 'Bloque aeróbico', '-', YT.reggaeton),
        ex('Reggaetón', 'Bloque aeróbico', '-', YT.reggaeton),
        ex('Ritmo moderado', 'Bloque final', '-', YT.merengue),
        ex('Respiración', 'Bloque final', '-', YT.breath),
        ex('Estiramientos', 'Bloque final', '-', YT.stretch),
      ],
    },
    {
      id: 'spinning-endurance',
      categoryId: 'spinning',
      category: 'SPINNING',
      label: 'Endurance Ride',
      title: 'ENDURANCE RIDE',
      desc: 'Rutina 1 · Duración: 50 minutos. Calentamiento, trabajo principal y enfriamiento.',
      image: IMG.spinning,
      videoUrl: YT.spin,
      exercises: [
        ex('Calentamiento', '10 min', '-', YT.spin),
        ex('Resistencia media', '8 min', '-', YT.spin),
        ex('Recuperación', '3 min', '-', YT.spin),
        ex('Subida progresiva', '8 min', '-', YT.spin),
        ex('Recuperación', '3 min', '-', YT.spin),
        ex('Sprint controlado', '6 min', '-', YT.spinHiit),
        ex('Pedaleo continuo', '5 min', '-', YT.spin),
        ex('Enfriamiento', '7 min', '-', YT.stretch),
      ],
    },
    {
      id: 'spinning-hiit',
      categoryId: 'spinning',
      category: 'SPINNING',
      label: 'Interval Training',
      title: 'INTERVAL TRAINING',
      desc: 'Rutina 2 · Calentamiento, HIIT (10 rondas) y final.',
      image: IMG.spinning,
      videoUrl: YT.spinHiit,
      exercises: [
        ex('Calentamiento', '8 min', '-', YT.spin),
        ex('HIIT · máxima intensidad', '10 rondas × 40 s', '80 s activa', YT.spinHiit),
        ex('Subida larga', '8 min', '-', YT.spin),
        ex('Pedaleo suave', 'Final', '-', YT.spin),
        ex('Estiramientos', 'Final', '-', YT.stretch),
      ],
    },
    {
      id: 'hidro-resistencia',
      categoryId: 'hidro',
      category: 'HIDROGIMNASIA',
      label: 'Resistencia Acuática',
      title: 'RESISTENCIA ACUÁTICA',
      desc: 'Rutina 1 · Entrada en calor, trabajo principal y final.',
      image: IMG.hidro,
      videoUrl: YT.hydroRun,
      exercises: [
        ex('Caminata frontal', 'Entrada en calor', '-', YT.hydroWalk),
        ex('Caminata lateral', 'Entrada en calor', '-', YT.hydroWalk),
        ex('Movilidad articular', 'Entrada en calor', '-', YT.mobility),
        ex('Running acuático', '4 min', '-', YT.hydroRun),
        ex('Jumping Jacks', '3 min', '-', YT.hydroJump),
        ex('Patadas frontales', '3 × 20', '-', YT.hydroKick),
        ex('Elevación de rodillas', '3 × 20', '-', YT.hydroKick),
        ex('Mancuernas acuáticas', '4 × 15', '-', YT.hydroJump),
        ex('Bicicleta suspendida', '5 min', '-', YT.hydroRun),
        ex('Respiración', 'Final', '-', YT.breath),
        ex('Flotación', 'Final', '-', YT.hydroWalk),
        ex('Estiramientos', 'Final', '-', YT.stretch),
      ],
    },
    {
      id: 'hidro-circuito',
      categoryId: 'hidro',
      category: 'HIDROGIMNASIA',
      label: 'Circuito Acuático',
      title: 'CIRCUITO ACUÁTICO',
      desc: 'Rutina 2 · Calentamiento, circuito (4 vueltas) y vuelta a la calma.',
      image: IMG.hidro,
      videoUrl: YT.hydroJump,
      exercises: [
        ex('Calentamiento', '10 min', '-', YT.hydroWalk),
        ex('Sprint acuático', '1 min · 4 vueltas', '-', YT.hydroRun),
        ex('Saltos verticales', '20 reps · 4 vueltas', '-', YT.hydroJump),
        ex('Empuje con tabla', '15 reps · 4 vueltas', '-', YT.hydroJump),
        ex('Remo con mancuernas acuáticas', '20 reps · 4 vueltas', '-', YT.hydroKick),
        ex('Desplazamiento lateral', '2 min · 4 vueltas', '-', YT.hydroWalk),
        ex('Rodillas al pecho', '20 reps · 4 vueltas', '-', YT.hydroKick),
        ex('Caminata lenta', 'Vuelta a la calma', '-', YT.hydroWalk),
        ex('Ejercicios respiratorios', 'Vuelta a la calma', '-', YT.breath),
        ex('Estiramientos dentro del agua', 'Vuelta a la calma', '-', YT.stretch),
      ],
    },
  ];

  var categories = [];
  var seen = {};
  routines.forEach(function (r) {
    if (seen[r.categoryId]) return;
    seen[r.categoryId] = true;
    categories.push({ id: r.categoryId, label: r.category });
  });

  var DAYS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

  var DAY_FOCUS = {
    musculacion: {
      LUN: 'Empuje inferior',
      MAR: 'Empuje superior',
      MIE: 'Tirón',
      JUE: 'Full body',
      VIE: 'Hipertrofia',
      SAB: 'Técnica ligera',
    },
    boxeo: {
      LUN: 'Técnica',
      MAR: 'Potencia',
      MIE: 'Combinaciones',
      JUE: 'Condicionamiento',
      VIE: 'Circuito',
      SAB: 'Activo / sombra',
    },
    pilates: {
      LUN: 'Control',
      MAR: 'Core',
      MIE: 'Flexibilidad',
      JUE: 'Estabilidad',
      VIE: 'Flujo completo',
      SAB: 'Movilidad suave',
    },
    zumba: {
      LUN: 'Cardio base',
      MAR: 'Ritmos latinos',
      MIE: 'Alta energía',
      JUE: 'Baile mix',
      VIE: 'Party mode',
      SAB: 'Ritmo moderado',
    },
    spinning: {
      LUN: 'Resistencia',
      MAR: 'Subidas',
      MIE: 'Intervalos',
      JUE: 'Tempo',
      VIE: 'HIIT',
      SAB: 'Rodaje suave',
    },
    hidro: {
      LUN: 'Resistencia',
      MAR: 'Patadas',
      MIE: 'Circuito',
      JUE: 'Cardio acuático',
      VIE: 'Fuerza en agua',
      SAB: 'Recuperación',
    },
    asignada: {
      LUN: 'Día 1',
      MAR: 'Día 2',
      MIE: 'Día 3',
      JUE: 'Día 4',
      VIE: 'Día 5',
      SAB: 'Día 6',
    },
  };

  function cloneEx(item) {
    return {
      name: item.name,
      detail: item.detail || '',
      rest: item.rest || '-',
      videoUrl: item.videoUrl || item.video_url || '',
    };
  }

  function isWarmup(item) {
    var t = ((item.name || '') + ' ' + (item.detail || '')).toLowerCase();
    return /calentamiento|activaci[oó]n|entrada en calor|respiraci[oó]n(?!.*final)|movilidad|bicicleta o cinta|remo erg[oó]metro|cuerda$|carrera suave|pasos b[aá]sicos/.test(t)
      && !/bloque principal|parte principal|hiit|circuito/.test(t);
  }

  function isFinisher(item) {
    var t = ((item.name || '') + ' ' + (item.detail || '')).toLowerCase();
    return /estiramiento|relajaci[oó]n|enfriamiento|vuelta a la calma|flotaci[oó]n|pedaleo suave|ritmo moderado|^fin$|final$/.test(t)
      || (item.detail || '').toLowerCase() === 'fin'
      || (item.detail || '').toLowerCase() === 'final'
      || (item.detail || '').toLowerCase() === 'enfriamiento'
      || (item.detail || '').toLowerCase() === 'vuelta a la calma';
  }

  function tweakDetail(detail, dayIndex) {
    var d = String(detail || '');
    // Sábados: volumen más liviano
    if (dayIndex === 5) {
      d = d.replace(/(\d+)\s*×\s*(\d+)/g, function (_, a, b) {
        return Math.max(2, Number(a) - 1) + ' × ' + b;
      });
      d = d.replace(/4 vueltas/g, '3 vueltas').replace(/3 vueltas/g, '2 vueltas');
    }
    // Viernes: un poco más de volumen
    if (dayIndex === 4) {
      d = d.replace(/\b3\s*×/g, '4 ×').replace(/3 series/g, '4 series');
    }
    // Martes: énfasis en intensidad (menos reps si hay rango)
    if (dayIndex === 1) {
      d = d.replace(/8-10/g, '6-8').replace(/10-12/g, '8-10');
    }
    return d;
  }

  function pickMainForDay(main, dayIndex) {
    var n = main.length;
    if (n === 0) return [];
    if (n <= 3) return main.map(cloneEx);

    // Sábado: sesión más corta
    var take = dayIndex === 5
      ? Math.max(2, Math.ceil(n * 0.4))
      : Math.max(3, Math.ceil(n * 0.6));

    var start = (dayIndex * Math.max(1, Math.floor(n / 3))) % n;
    var picked = [];
    var seenIdx = {};
    for (var i = 0; i < take; i++) {
      var idx = (start + i) % n;
      if (seenIdx[idx]) continue;
      seenIdx[idx] = true;
      picked.push(cloneEx(main[idx]));
    }
    // Garantizar variedad: si faltan, completar
    var j = 0;
    while (picked.length < Math.min(take, n) && j < n) {
      if (!seenIdx[j]) {
        seenIdx[j] = true;
        picked.push(cloneEx(main[j]));
      }
      j++;
    }
    return picked;
  }

  /**
   * Devuelve { focus, exercises } para una rutina + día (LUN…SAB).
   */
  function getFitpowerExercisesForDay(routine, dayCode) {
    var day = DAYS.indexOf(dayCode) >= 0 ? dayCode : 'LUN';
    var dayIndex = DAYS.indexOf(day);
    var base = (routine && routine.exercises) ? routine.exercises : [];
    var cat = (routine && routine.categoryId) || 'asignada';
    var focusMap = DAY_FOCUS[cat] || DAY_FOCUS.asignada;
    var focus = focusMap[day] || ('Día ' + day);

    if (routine && routine.byDay && Array.isArray(routine.byDay[day]) && routine.byDay[day].length) {
      return {
        focus: focus,
        exercises: routine.byDay[day].map(cloneEx),
      };
    }

    var warm = [];
    var main = [];
    var fin = [];
    base.forEach(function (item) {
      if (isWarmup(item) && fin.length === 0 && main.length === 0) {
        warm.push(item);
      } else if (isFinisher(item)) {
        fin.push(item);
      } else if (isWarmup(item) && main.length === 0) {
        warm.push(item);
      } else {
        main.push(item);
      }
    });

    // Si la clasificación falló, partir la lista en tercios
    if (!main.length && base.length) {
      var third = Math.max(1, Math.floor(base.length / 3));
      warm = base.slice(0, Math.min(2, third));
      main = base.slice(warm.length, base.length - Math.min(2, third));
      fin = base.slice(warm.length + main.length);
    }

    var selectedMain = pickMainForDay(main, dayIndex).map(function (item) {
      item.detail = tweakDetail(item.detail, dayIndex);
      return item;
    });

    // Sábado: priorizar finisher / movilidad
    var selectedWarm = warm.map(cloneEx);
    var selectedFin = fin.map(cloneEx);
    if (dayIndex === 5 && selectedFin.length) {
      selectedFin = selectedFin.map(function (item) {
        var copy = cloneEx(item);
        if (/estiramiento/i.test(copy.name) && !/\d+\s*min/i.test(copy.detail)) {
          copy.detail = '10–12 min';
        }
        return copy;
      });
    }

    var exercises = selectedWarm.concat(selectedMain).concat(selectedFin);
    if (!exercises.length) {
      exercises = base.map(function (item) {
        var copy = cloneEx(item);
        copy.detail = tweakDetail(copy.detail, dayIndex);
        return copy;
      });
    }

    return { focus: focus, exercises: exercises };
  }

  global.FITPOWER_ROUTINES = routines;
  global.FITPOWER_CATEGORIES = categories;
  global.FITPOWER_DAYS = DAYS;
  global.getFitpowerRoutineById = function (id) {
    return routines.find(function (r) { return r.id === id; }) || null;
  };
  global.getFitpowerRoutinesByCategory = function (categoryId) {
    return routines.filter(function (r) { return r.categoryId === categoryId; });
  };
  global.getFitpowerExercisesForDay = getFitpowerExercisesForDay;
})(typeof window !== 'undefined' ? window : globalThis);
