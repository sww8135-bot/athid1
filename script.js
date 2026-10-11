(() => {
  'use strict';

  /* =====================================================
   *  ข้อมูลสำหรับฝึกพิมพ์
   * ===================================================== */
  const WORDS = {
    easy: [
      'ตา', 'หู', 'มือ', 'ปาก', 'บ้าน', 'ดาว', 'แมว', 'ปลา', 'ไก่', 'นก',
      'ช้าง', 'ม้า', 'วัว', 'น้ำ', 'ไฟ', 'ลม', 'ดิน', 'ฟ้า', 'ฝน', 'ดี',
      'ใจ', 'รัก', 'กิน', 'นอน', 'เดิน', 'วิ่ง', 'นั่ง', 'ยืน', 'ใหญ่', 'เล็ก',
      'สวย', 'ร้อน', 'หนาว', 'ขาว', 'ดำ', 'แดง', 'เขียว', 'ภูเขา', 'ทะเล', 'ต้นไม้'
    ],
    medium: [
      'โรงเรียน', 'ครอบครัว', 'หนังสือ', 'เพื่อนบ้าน', 'ประเทศ', 'ภาษาไทย', 'อาหาร',
      'ตลาดสด', 'โทรศัพท์', 'รถไฟ', 'สนามบิน', 'ร้านกาแฟ', 'ความสุข', 'ความรัก',
      'ธรรมชาติ', 'สวนสาธารณะ', 'ผลไม้', 'ขนมหวาน', 'ห้องสมุด', 'โรงพยาบาล',
      'นักเรียน', 'ครูอาจารย์', 'ท่องเที่ยว', 'เดินทาง', 'ออกกำลังกาย', 'ทำงาน'
    ],
    hard: [
      'มหาวิทยาลัย', 'เทคโนโลยี', 'สถาปัตยกรรม', 'ผู้เชี่ยวชาญ', 'ความรับผิดชอบ',
      'สิ่งแวดล้อม', 'เศรษฐกิจ', 'วิทยาศาสตร์', 'คณิตศาสตร์', 'ประสิทธิภาพ',
      'อุตสาหกรรม', 'นักท่องเที่ยว', 'ปรากฏการณ์', 'นวัตกรรม', 'ความสำเร็จ',
      'ผลิตภัณฑ์', 'โครงสร้างพื้นฐาน', 'สัมพันธภาพ', 'คณะกรรมการ', 'ประชาธิปไตย',
      'วัฒนธรรม', 'พัฒนาการ', 'สถานการณ์', 'ผู้ประกอบการ'
    ]
  };

  const SENTENCES = [
    'วันนี้อากาศดีมาก เหมาะกับการออกไปเดินเล่นที่สวนสาธารณะ',
    'การฝึกพิมพ์ทุกวันช่วยให้เราพิมพ์ได้เร็วและแม่นยำขึ้น',
    'ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น',
    'ประเทศไทยมีอาหารอร่อยหลากหลายชนิดให้เลือกลิ้มลอง',
    'เด็กๆ ชอบเล่นอยู่ที่สนามหลังบ้านทุกเย็น',
    'ฉันชอบอ่านหนังสือในร้านกาแฟเงียบๆ ตอนเช้า',
    'ช้าๆ ได้พร้าเล่มงาม',
    'เทคโนโลยีใหม่ๆ ช่วยให้ชีวิตของเราสะดวกสบายมากขึ้น',
    'เมื่อฝนตกหนัก ถนนในเมืองมักจะมีน้ำท่วมขัง',
    'ครอบครัวของเรารวมตัวกันกินข้าวเย็นทุกวันอาทิตย์',
    'การออกกำลังกายสม่ำเสมอทำให้ร่างกายแข็งแรงและจิตใจแจ่มใส',
    'นักเรียนทุกคนตั้งใจฟังครูอธิบายบทเรียนในห้องเรียน'
  ];

  // แป้นเหย้าแป้นพิมพ์เกษมณี: ฟ ห ก ด เ ้ ่ า ส ว ง
  const TONE_1 = '่'; // ่
  const TONE_2 = '้'; // ้
  const HOME_ROW = ['ฟ', 'ห', 'ก', 'ด', 'เ', TONE_2, TONE_1, 'า', 'ส', 'ว', 'ง'];
  const HOME_CONSONANTS = ['ฟ', 'ห', 'ก', 'ด', 'ส', 'ว', 'ง'];
  const HOME_UNITS = [...HOME_CONSONANTS, 'า', 'เ'];

  // แบ่งข้อความเป็น "กลุ่มอักขระ" (พยัญชนะ + สระ/วรรณยุกต์ที่ประกอบกัน)
  // เพื่อให้การแสดงผลภาษาไทยไม่เพี้ยนเมื่อใส่สีแยกทีละตัว
  const CLUSTER_RE = /[฀-๿][ัิ-ฺ็-๎]*ำ?|[\s\S]/gu;

  /* =====================================================
   *  ตัวช่วยทั่วไป
   * ===================================================== */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem('thaitype.' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem('thaitype.' + key, JSON.stringify(value)); } catch (e) { /* ไม่เป็นไร */ }
    }
  };

  const rand = (n) => Math.floor(Math.random() * n);
  const pick = (arr) => arr[rand(arr.length)];
  function sample(arr, count) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, Math.min(count, copy.length));
  }

  const fmtTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };

  /* =====================================================
   *  ระบบเสียง (Web Audio API สังเคราะห์เสียงเอง ไม่ต้องโหลดไฟล์)
   * ===================================================== */
  const Sound = (() => {
    let ctx = null;
    let noiseBuf = null;
    const cfg = {
      muted: store.get('muted', false),
      volume: store.get('volume', 60),
      style: store.get('soundStyle', 'mechanical')
    };

    function ensure() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { ctx = new AC(); } catch (e) { return null; }
        noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.12), ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }

    const level = () => (cfg.muted ? 0 : Math.pow(cfg.volume / 100, 1.5));
    const jitter = (base, ratio) => base * (1 + (Math.random() * 2 - 1) * ratio);

    function noise(c, t, o) {
      const src = c.createBufferSource();
      src.buffer = noiseBuf;
      const filter = c.createBiquadFilter();
      filter.type = o.type || 'bandpass';
      filter.frequency.value = o.freq;
      filter.Q.value = o.q || 1;
      const g = c.createGain();
      g.gain.setValueAtTime(o.gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
      src.connect(filter); filter.connect(g); g.connect(c.destination);
      src.start(t); src.stop(t + o.dur + 0.02);
    }

    function tone(c, t, o) {
      const osc = c.createOscillator();
      osc.type = o.type || 'sine';
      osc.frequency.setValueAtTime(o.f0, t);
      if (o.f1 && o.f1 !== o.f0) osc.frequency.exponentialRampToValueAtTime(o.f1, t + o.dur);
      const g = c.createGain();
      g.gain.setValueAtTime(o.gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
      osc.connect(g); g.connect(c.destination);
      osc.start(t); osc.stop(t + o.dur + 0.02);
    }

    function play(fn) {
      const v = level();
      if (v <= 0) return;
      const c = ensure();
      if (!c) return;
      fn(c, c.currentTime, v);
    }

    return {
      cfg,
      unlock() { ensure(); },

      // เสียงกดแป้นถูกต้อง
      key() {
        play((c, t, v) => {
          if (cfg.style === 'click') {
            noise(c, t, { type: 'highpass', freq: jitter(5000, 0.15), q: 0.8, gain: 0.5 * v, dur: 0.025 });
          } else if (cfg.style === 'soft') {
            tone(c, t, { f0: jitter(320, 0.08), f1: 160, gain: 0.35 * v, dur: 0.06 });
          } else {
            noise(c, t, { freq: jitter(2600, 0.2), q: 0.9, gain: 0.55 * v, dur: 0.045 });
            tone(c, t, { f0: jitter(230, 0.1), f1: 110, gain: 0.4 * v, dur: 0.07 });
          }
        });
      },

      // เสียงพิมพ์ผิด
      error() {
        play((c, t, v) => {
          noise(c, t, { freq: 900, q: 1, gain: 0.25 * v, dur: 0.05 });
          tone(c, t, { f0: 150, f1: 105, type: 'triangle', gain: 0.4 * v, dur: 0.15 });
        });
      },

      // เสียง Backspace
      back() {
        play((c, t, v) => {
          noise(c, t, { freq: 1400, q: 1, gain: 0.22 * v, dur: 0.03 });
          tone(c, t, { f0: 140, f1: 90, gain: 0.2 * v, dur: 0.05 });
        });
      },

      // เสียงเมื่อพิมพ์จบ
      done() {
        play((c, t, v) => {
          [523.25, 659.25, 783.99].forEach((f, i) => {
            tone(c, t + i * 0.11, { f0: f, gain: 0.3 * v, dur: 0.28 });
          });
        });
      }
    };
  })();

  /* =====================================================
   *  อ้างอิง DOM
   * ===================================================== */
  const el = {
    display: $('#textDisplay'),
    input: $('#hiddenInput'),
    box: $('#typingBox'),
    wpm: $('#wpm'), cpm: $('#cpm'), acc: $('#acc'), time: $('#time'),
    progress: $('#progressBar'),
    levels: $('#levels'),
    homeRow: $('#homeRow'),
    bestLine: $('#bestLine'),
    modal: $('#resultModal'),
    muteBtn: $('#muteBtn'),
    soundStyle: $('#soundStyle'),
    volume: $('#volume'),
    themeBtn: $('#themeBtn')
  };

  /* =====================================================
   *  สถานะของเกม
   * ===================================================== */
  const state = {
    mode: store.get('mode', 'home'),
    level: store.get('level', 'easy'),
    target: '',
    clusters: [],
    spans: [],
    typed: '',
    started: false,
    finished: false,
    startTime: 0,
    elapsed: 0,
    keys: 0,
    errors: 0,
    timer: null
  };

  /* ---------- สร้างข้อความ ---------- */
  function genHome() {
    const groups = [];
    for (let i = 0; i < 12; i++) {
      const len = 2 + rand(3);
      let word = '';
      for (let j = 0; j < len; j++) {
        const unit = pick(HOME_UNITS);
        word += unit;
        // ใส่วรรณยุกต์เฉพาะหลังพยัญชนะ เพื่อไม่ให้เกิดตัวอักษรลอย
        if (HOME_CONSONANTS.includes(unit) && Math.random() < 0.25) {
          word += Math.random() < 0.5 ? TONE_1 : TONE_2;
        }
      }
      groups.push(word);
    }
    return groups.join(' ');
  }

  function generateText() {
    if (state.mode === 'home') return genHome();
    if (state.mode === 'words') return sample(WORDS[state.level], 14).join(' ');
    return sample(SENTENCES, 3).join(' ');
  }

  function splitClusters(text) {
    const out = [];
    let pos = 0;
    for (const m of text.matchAll(CLUSTER_RE)) {
      out.push({ text: m[0], start: pos, end: pos + m[0].length });
      pos += m[0].length;
    }
    return out;
  }

  function setText(text) {
    stopTimer();
    state.target = text;
    state.clusters = splitClusters(text);
    state.typed = '';
    state.started = false;
    state.finished = false;
    state.elapsed = 0;
    state.keys = 0;
    state.errors = 0;

    el.display.textContent = '';
    el.display.scrollTop = 0;
    const frag = document.createDocumentFragment();
    state.spans = state.clusters.map((c) => {
      const s = document.createElement('span');
      s.className = 'ch pending';
      s.textContent = c.text;
      frag.appendChild(s);
      return s;
    });
    el.display.appendChild(frag);

    el.input.value = '';
    el.input.readOnly = false;
    el.box.classList.remove('finished');
    el.modal.hidden = true;

    render();
    updateStats();
    updateBest();
  }

  /* =====================================================
   *  แสดงผลตัวอักษร
   * ===================================================== */
  function render() {
    const n = state.typed.length;
    let cursorIdx = -1;

    state.clusters.forEach((c, i) => {
      let cls = 'ch';
      if (n >= c.end) {
        cls += state.typed.slice(c.start, c.end) === c.text ? ' correct' : ' wrong';
      } else if (n > c.start) {
        const part = state.typed.slice(c.start);
        cls += c.text.startsWith(part) ? ' correct cursor' : ' wrong cursor';
        cursorIdx = i;
      } else {
        cls += ' pending';
        if (n === c.start && !state.finished) { cls += ' cursor'; cursorIdx = i; }
      }
      if (state.spans[i].className !== cls) state.spans[i].className = cls;
    });

    // เลื่อนข้อความให้เคอร์เซอร์อยู่ในบรรทัดที่มองเห็น
    if (cursorIdx >= 0) {
      const lineH = parseFloat(getComputedStyle(el.display).lineHeight) || 60;
      const line = Math.floor(state.spans[cursorIdx].offsetTop / lineH);
      el.display.scrollTop = Math.max(0, line - 1) * lineH;
    }

    // ไฮไลต์แป้นถัดไปในผังแป้นเหย้า
    const next = state.target[n];
    $$('.key').forEach((k) => k.classList.toggle('next', k.dataset.k === next));

    el.progress.style.width = (state.target.length ? (n / state.target.length) * 100 : 0) + '%';
  }

  /* =====================================================
   *  คำนวณสถิติ
   * ===================================================== */
  function calcStats() {
    let correct = 0;
    for (let i = 0; i < state.typed.length; i++) {
      if (state.typed[i] === state.target[i]) correct++;
    }
    const elapsed = state.started
      ? (state.finished ? state.elapsed : performance.now() - state.startTime)
      : 0;
    const minutes = Math.max(elapsed, 1000) / 60000;
    const cpm = state.started ? Math.round(correct / minutes) : 0;
    const wpm = state.started ? Math.round(correct / 5 / minutes) : 0; // 5 ตัวอักษร = 1 คำ (มาตรฐานสากล)
    const acc = state.keys > 0
      ? Math.max(0, Math.round(((state.keys - state.errors) / state.keys) * 100))
      : 100;
    return { wpm, cpm, acc, elapsed };
  }

  function updateStats() {
    const s = calcStats();
    el.wpm.textContent = s.wpm;
    el.cpm.textContent = s.cpm;
    el.acc.textContent = s.acc + '%';
    el.time.textContent = fmtTime(s.elapsed);
  }

  /* ---------- ตัวจับเวลา ---------- */
  function startTimer() {
    state.started = true;
    state.startTime = performance.now();
    state.timer = setInterval(updateStats, 100);
  }
  function stopTimer() {
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
  }

  /* =====================================================
   *  รับข้อมูลจากการพิมพ์
   * ===================================================== */
  function onInput() {
    if (state.finished) { el.input.value = state.typed; return; }

    let value = el.input.value;
    if (value.length > state.target.length) {
      value = value.slice(0, state.target.length);
      el.input.value = value;
    }

    const old = state.typed;
    let p = 0;
    const max = Math.min(old.length, value.length);
    while (p < max && old[p] === value[p]) p++;
    const added = value.slice(p);
    const removed = old.length - p;

    if (!state.started && added.length) startTimer();

    let lastOk = true;
    for (let i = 0; i < added.length; i++) {
      state.keys++;
      lastOk = added[i] === state.target[p + i];
      if (!lastOk) state.errors++;
    }

    state.typed = value;

    if (added.length) {
      (lastOk ? Sound.key : Sound.error)();
    } else if (removed) {
      Sound.back();
    }

    render();
    updateStats();

    if (value.length >= state.target.length) finish();
  }

  /* =====================================================
   *  จบการพิมพ์ / สถิติสูงสุด
   * ===================================================== */
  const bestKey = () => 'best.' + state.mode + (state.mode === 'words' ? '.' + state.level : '');
  const MODE_NAME = { home: 'แป้นเหย้า', words: 'คำศัพท์', sentences: 'ประโยค' };
  const LEVEL_NAME = { easy: 'ง่าย', medium: 'ปานกลาง', hard: 'ยาก' };

  function updateBest() {
    const best = store.get(bestKey(), null);
    const label = MODE_NAME[state.mode] + (state.mode === 'words' ? ' (' + LEVEL_NAME[state.level] + ')' : '');
    el.bestLine.textContent = best ? '🏆 สถิติสูงสุด' + label + ': ' + best + ' WPM' : '';
  }

  function finish() {
    state.finished = true;
    stopTimer();
    state.elapsed = performance.now() - state.startTime;
    el.input.readOnly = true;
    el.box.classList.add('finished');
    render();
    updateStats();
    Sound.done();

    const s = calcStats();
    const prev = store.get(bestKey(), 0);
    const isNew = s.wpm > prev;
    if (isNew) store.set(bestKey(), s.wpm);

    let msg = 'ลองพิมพ์ให้แม่นยำขึ้นอีกนิด แล้วความเร็วจะตามมา';
    if (s.acc >= 98 && s.wpm >= 30) msg = 'ยอดเยี่ยมมาก! ทั้งเร็วและแม่นยำ';
    else if (s.acc >= 95) msg = 'เยี่ยมเลย! ความแม่นยำสูงมาก';
    else if (s.acc >= 85) msg = 'ดีมาก! ฝึกต่อเนื่องแล้วจะดีขึ้นอีก';

    $('#rWpm').textContent = s.wpm;
    $('#rCpm').textContent = s.cpm;
    $('#rAcc').textContent = s.acc + '%';
    $('#rTime').textContent = fmtTime(s.elapsed);
    $('#resultMsg').textContent = msg;
    $('#rRecord').textContent = isNew && s.wpm > 0 ? '🎖️ สถิติใหม่!' : prev ? 'สถิติสูงสุด: ' + prev + ' WPM' : '';

    updateBest();
    setTimeout(() => {
      el.modal.hidden = false;
      $('#retryBtn').focus();
    }, 250);
  }

  /* =====================================================
   *  ปุ่มควบคุม
   * ===================================================== */
  function reset() { setText(state.target); focusInput(); }
  function newText() { setText(generateText()); focusInput(); }
  function focusInput() { el.input.focus({ preventScroll: true }); }

  function setMode(mode) {
    state.mode = mode;
    store.set('mode', mode);
    $$('.tab').forEach((t) => {
      const on = t.dataset.mode === mode;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
    });
    el.levels.hidden = mode !== 'words';
    el.homeRow.hidden = mode !== 'home';
    newText();
  }

  function setLevel(level) {
    state.level = level;
    store.set('level', level);
    $$('.chip').forEach((c) => c.classList.toggle('active', c.dataset.level === level));
    newText();
  }

  $$('.tab').forEach((t) => t.addEventListener('click', () => setMode(t.dataset.mode)));
  $$('.chip').forEach((c) => c.addEventListener('click', () => setLevel(c.dataset.level)));
  $('#resetBtn').addEventListener('click', reset);
  $('#newBtn').addEventListener('click', newText);
  $('#retryBtn').addEventListener('click', reset);
  $('#nextBtn').addEventListener('click', newText);

  /* ---------- ผังแป้นเหย้า ---------- */
  HOME_ROW.forEach((k) => {
    const d = document.createElement('div');
    d.className = 'key';
    d.dataset.k = k;
    // วรรณยุกต์ต้องมีพยัญชนะนำหน้าเพื่อให้แสดงผลถูกต้อง
    d.textContent = (k === TONE_1 || k === TONE_2) ? 'ก' + k : k;
    el.homeRow.appendChild(d);
  });

  /* ---------- อีเวนต์ของช่องพิมพ์ ---------- */
  el.input.addEventListener('input', onInput);
  el.input.addEventListener('paste', (e) => e.preventDefault());
  el.input.addEventListener('drop', (e) => e.preventDefault());
  el.input.addEventListener('keydown', (e) => {
    // กันการย้ายเคอร์เซอร์ไปกลางข้อความ
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) e.preventDefault();
  });
  const caretToEnd = () => {
    const n = el.input.value.length;
    try { el.input.setSelectionRange(n, n); } catch (e) { /* ไม่เป็นไร */ }
  };
  el.input.addEventListener('click', caretToEnd);
  el.input.addEventListener('select', caretToEnd);
  el.input.addEventListener('focus', () => el.box.classList.add('focused'));
  el.input.addEventListener('blur', () => el.box.classList.remove('focused'));
  el.box.addEventListener('pointerdown', () => Sound.unlock());

  // Esc = เริ่มใหม่ / พิมพ์ได้ทันทีแม้ยังไม่ได้คลิกที่ช่อง
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      reset();
      return;
    }
    if (el.modal.hidden && document.activeElement === document.body
        && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      Sound.unlock();
      focusInput();
    }
  });

  /* =====================================================
   *  ตั้งค่าเสียงและธีม
   * ===================================================== */
  function syncMute() {
    el.muteBtn.setAttribute('aria-pressed', String(Sound.cfg.muted));
  }
  el.muteBtn.addEventListener('click', () => {
    Sound.cfg.muted = !Sound.cfg.muted;
    store.set('muted', Sound.cfg.muted);
    syncMute();
    Sound.unlock();
    Sound.key();
    focusInput();
  });
  el.soundStyle.value = Sound.cfg.style;
  el.soundStyle.addEventListener('change', () => {
    Sound.cfg.style = el.soundStyle.value;
    store.set('soundStyle', Sound.cfg.style);
    Sound.unlock();
    Sound.key();
  });
  el.volume.value = Sound.cfg.volume;
  el.volume.addEventListener('input', () => {
    Sound.cfg.volume = Number(el.volume.value);
    store.set('volume', Sound.cfg.volume);
  });
  el.volume.addEventListener('change', () => { Sound.unlock(); Sound.key(); });
  syncMute();

  el.themeBtn.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store.set('theme', next);
    focusInput();
  });

  /* =====================================================
   *  เริ่มต้น
   * ===================================================== */
  (function init() {
    $$('.tab').forEach((t) => {
      const on = t.dataset.mode === state.mode;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on);
    });
    $$('.chip').forEach((c) => c.classList.toggle('active', c.dataset.level === state.level));
    el.levels.hidden = state.mode !== 'words';
    el.homeRow.hidden = state.mode !== 'home';
    setText(generateText());
    focusInput();
  })();
})();
