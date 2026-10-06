// Playable slice of Ma Cảnh's combat.
// Numbers come from the game's scripts (PlayerMovement, PlayerAttack, PlayerHealth, EnemyBase, Slime, ShieldEnemy).
// Animation key frames come from Assets/Animations/**/*.anim at 60 samples per second.
// Gravity and the attackPoint offset live in the Unity scene, not in code, so they are estimates here.
(() => {
  const canvas = document.getElementById('game');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const arena = document.getElementById('arena');
  const startBtn = document.getElementById('btnStart');
  const debugEl = document.getElementById('debug');
  const logEl = document.getElementById('debugLog');
  const hudEl = document.getElementById('hud');

  const U = 32;                 // sprite pixels per Unity unit (spritePixelsToUnits)
  const VIEW_H = 110;
  const LAYER_Y = -26;          // layers drawn 26px up so the forest window fills the view
  const GROUND = 114 + LAYER_Y; // front layer's grass line is row 114
  const WORLD_W = 960;
  const GRAVITY = 49 * U;       // estimate: gives the jumpForce of 14 about a 2-unit jump

  const P = {                   // PlayerMovement / PlayerAttack / PlayerHealth defaults
    moveSpeed: 7, jumpForce: 14, dashSpeed: 20, dashDuration: 0.2, dashCooldown: 1,
    attackCooldown: 0.25, airAttackCooldown: 0.3, parryWindow: 0.25, parryCooldown: 0.4,
    attackDamage: 20, attackRange: 0.5, blockHoldThreshold: 0.18, knockbackLockTime: 0.12,
    maxHealth: 100, invincible: 1.2, knockX: 6, knockY: 2,
  };
  const SLIME = { health: 100, moveSpeed: 2, detect: 6, attackRange: 1.2, attackCooldown: 1.25, contactDamage: 5, contactCooldown: 0.75 };
  const SHIELD = {
    health: 100, moveSpeed: 2, chaseMul: 1.15, detect: 6, attackRange: 1.3, pushCooldown: 2, pushDamage: 8,
    pushKnockX: 10, pushKnockY: 1.5, pushApproachMul: 2.25, attackCooldown: 1.25, attackDamage: 12, hitRadius: 0.9,
  };

  // key frames (in 60 fps frames), stop frame, sheet, cell width, cell height
  const CLIP = {
    idle:   { img: 'player_idle',       w: 96, h: 64, keys: [0, 6, 10, 17, 23, 30, 34, 40], stop: 41, loop: true },
    run:    { img: 'player_running',    w: 96, h: 64, keys: [0, 5, 10, 15, 19, 24, 29, 34], stop: 35, loop: true },
    jump:   { img: 'player_jump',       w: 96, h: 64, keys: [0, 7, 13, 20], stop: 21 },
    combo1: { img: 'player_attack',     w: 96, h: 64, keys: [0, 6, 12, 17, 23], stop: 24 },
    combo2: { img: 'player_attack2',    w: 96, h: 64, keys: [0, 8, 17, 25], stop: 26 },
    combo3: { img: 'player_attack3',    w: 96, h: 64, keys: [0, 6, 12, 18, 24, 30], stop: 31 },
    air:    { img: 'player_jumpattack', w: 96, h: 80, keys: [0, 4, 9, 13, 17, 21, 26, 30], stop: 31 },
    dash:   { img: 'player_dash',       w: 96, h: 64, keys: [0, 5, 10, 16, 21, 26, 31], stop: 32 },
    parry:  { img: 'player_barry',      w: 96, h: 80, keys: [0, 6, 13, 21], stop: 22 },
    block:  { img: 'player_blockhit',   w: 96, h: 64, keys: [0], stop: 1, loop: true },
    blockhit: { img: 'player_blockhit', w: 96, h: 64, keys: [0, 4, 8, 12], stop: 13 },
    hurt:   { img: 'player_hurt',       w: 96, h: 64, keys: [0, 5, 12, 17, 23, 28, 35, 40], stop: 41 },
    die:    { img: 'player_die',        w: 96, h: 64, keys: [0, 10, 21, 31, 41, 51, 62, 72, 82, 92, 103, 113], stop: 114 },
    s_idle:   { img: 'slime_idle',   w: 100, h: 100, keys: [0, 11, 24, 35], stop: 36, loop: true },
    s_run:    { img: 'slime_run',    w: 100, h: 100, keys: [0, 8, 17, 25], stop: 26, loop: true },
    s_attack: { img: 'slime_attack', w: 100, h: 100, keys: [0, 7, 14, 21, 28, 35], stop: 36 },
    s_hurt:   { img: 'slime_hurt',   w: 100, h: 100, keys: [0, 10, 20, 30], stop: 31 },
    s_die:    { img: 'slime_die',    w: 100, h: 100, keys: [0, 8, 16, 24, 32, 40], stop: 41 },
    h_idle:   { img: 'shield_idle',   w: 100, h: 100, keys: [0, 10, 20, 30], stop: 31, loop: true },
    h_walk:   { img: 'shield_walk',   w: 100, h: 100, keys: [0, 6, 11, 17, 23, 29, 34, 40], stop: 41, loop: true },
    h_push:   { img: 'shield_push',   w: 100, h: 100, keys: [0, 6, 11, 17, 23, 29, 34, 40], stop: 41 },
    // EndAttack fires at 0.517 s (frame 31); DealAttackDamage at 0.4 s (frame 24)
    h_attack: { img: 'shield_attack', w: 100, h: 100, keys: [0, 8, 16, 24, 31], stop: 32 },
    h_hurt:   { img: 'shield_hit',    w: 100, h: 100, keys: [0, 7, 13, 20], stop: 21 },
  };

  const images = {};
  const layerImgs = [];
  const toLoad = [...new Set(Object.values(CLIP).map((c) => c.img))];
  let loaded = 0;
  // the game state exists before any art arrives; each finished image just triggers a redraw
  const onLoad = () => { loaded++; if (!running) draw(); };
  for (const name of toLoad) {
    const im = new Image(); im.onload = onLoad; im.onerror = onLoad; im.src = `assets/sprites/${name}.png`; images[name] = im;
  }
  for (let i = 5; i >= 1; i--) {
    const im = new Image(); im.onload = onLoad; im.onerror = onLoad; im.src = `assets/parallax/l${i}.png`; layerImgs.push(im);
  }
  // ParallaxScroll.cs offsets each layer's texture by camera.x * parallaxSpeed
  const LAYER_SPEED = [0.08, 0.25, 0.45, 0.7, 1];

  /* ---------- state ---------- */
  let viewW = 400;
  let cam = 0;
  let player;
  let enemies;
  let kills = 0;
  let running = false;
  let visible = true;
  let last = 0;
  let clock = 0;
  const keys = new Set();
  const fx = [];

  function makePlayer() {
    return {
      x: Math.min(140, Math.round(viewW * 0.25)), y: GROUND, vx: 0, vy: 0, face: 1, grounded: true,
      hp: P.maxHealth, inv: 0, lock: 0, dead: false,
      clip: 'idle', t: 0, action: null,
      lastAttack: -9, lastAir: -9, attackIndex: 1,
      dashing: 0, dashReadyAt: 0,
      parrying: 0, lastParry: -9, blocking: false, lDown: -1,
    };
  }
  function makeEnemy(kind, x) {
    const s = kind === 'slime' ? SLIME : SHIELD;
    return {
      kind, x, y: GROUND, face: -1, hp: s.health, clip: kind === 'slime' ? 's_idle' : 'h_idle', t: 0,
      state: 'idle', nextAttack: 0, nextPush: 0, nextContact: 0, pushHit: false, attackHit: false,
      deadAt: 0, bar: 0, flash: 0,
    };
  }
  function reset() {
    player = makePlayer();
    enemies = [makeEnemy('slime', Math.min(300, viewW - 36)), makeEnemy('shield', 640)];
    kills = 0; clock = 0; fx.length = 0;
    log('Màn mới: một Slime và một quái Khiên.');
  }

  /* ---------- helpers ---------- */
  const keyIndex = (clip, frame) => { let k = 0; for (let i = 0; i < clip.keys.length; i++) if (clip.keys[i] <= frame) k = i; return k; };
  const play = (ent, name) => { if (ent.clip !== name) { ent.clip = name; ent.t = 0; } };
  const restart = (ent, name) => { ent.clip = name; ent.t = 0; };
  const clipDone = (ent) => ent.t * 60 >= CLIP[ent.clip].stop;
  const fmt = (n, d = 2) => n.toFixed(d).replace('.', ',');
  const box = (e) => e.kind === 'slime' ? { w: 30, h: 18 } : { w: 34, h: 50 };
  let lastLog = '';
  function log(msg) { if (msg === lastLog) return; lastLog = msg; if (logEl) logEl.textContent = msg; }
  function popText(x, y, text, color) { fx.push({ x, y, text, color, t: 0 }); }

  /* ---------- player actions (mirror the C# methods) ---------- */
  function tryAttack() {
    const p = player;
    if (p.dead || p.dashing > 0 || p.blocking) return;
    if (p.grounded) {
      if (clock < p.lastAttack + P.attackCooldown) { log(`Bỏ qua J: attackCooldown còn ${fmt(p.lastAttack + P.attackCooldown - clock)} s.`); return; }
      p.lastAttack = clock;
      const idx = p.attackIndex;
      p.action = `combo${idx}`; restart(p, p.action);
      p.attackIndex = idx >= 3 ? 1 : idx + 1;
      dealDamage(`Đòn ${idx}`);
    } else {
      if (clock < p.lastAir + P.airAttackCooldown) return;
      p.lastAir = clock;
      p.action = 'air'; restart(p, 'air');
      dealDamage('Chém trên không');
    }
  }
  function dealDamage(label) {
    const p = player;
    // attackPoint offset is set in the scene; 0.7 unit ahead and 0.6 up is an estimate
    const ax = p.x + p.face * 0.7 * U;
    const ay = p.y - 0.6 * U;
    const r = P.attackRange * U;
    for (const e of enemies) {
      if (e.state === 'dead') continue;
      const b = box(e);
      const cx = Math.max(e.x - b.w / 2, Math.min(ax, e.x + b.w / 2));
      const cy = Math.max(e.y - b.h, Math.min(ay, e.y));
      if ((cx - ax) ** 2 + (cy - ay) ** 2 <= (r + 6) ** 2) {
        e.hp -= P.attackDamage; e.bar = 2; e.flash = 0.1;
        popText(e.x, e.y - b.h - 6, '-20', '#f2e9e4');
        if (e.hp <= 0) {
          e.state = 'dead'; e.deadAt = clock; kills++;
          play(e, e.kind === 'slime' ? 's_die' : 'h_hurt');
          log(`${label} hạ ${e.kind === 'slime' ? 'Slime' : 'quái Khiên'}. Đã hạ ${kills}.`);
        } else {
          e.state = 'hurt'; restart(e, e.kind === 'slime' ? 's_hurt' : 'h_hurt');
          log(`${label} trúng, quái còn ${e.hp}/100 máu.`);
        }
      }
    }
  }
  function tryDash() {
    const p = player;
    if (p.dead || p.dashing > 0) return;
    if (clock < p.dashReadyAt) { log(`Chưa lướt được: canDash = false thêm ${fmt(p.dashReadyAt - clock)} s.`); return; }
    p.dashing = P.dashDuration;
    p.dashReadyAt = clock + P.dashDuration + P.dashCooldown;
    p.vx = p.face * P.dashSpeed * U; p.vy = 0;
    restart(p, 'dash'); p.action = 'dash';
  }
  function tryJump() {
    const p = player;
    if (p.dead || !p.grounded || p.dashing > 0) return;
    p.vy = -P.jumpForce * U; p.grounded = false;
    if (!p.action) restart(p, 'jump');
  }
  function lPress() {
    const p = player;
    if (p.dead || p.lDown >= 0) return;
    p.lDown = clock;
  }
  function lRelease() {
    const p = player;
    if (p.lDown < 0) return;
    const held = clock - p.lDown;
    p.lDown = -1;
    if (p.blocking) { p.blocking = false; return; }
    if (held >= P.blockHoldThreshold) return;
    if (clock < p.lastParry + P.parryCooldown) { log(`Bỏ qua: parryCooldown còn ${fmt(p.lastParry + P.parryCooldown - clock)} s.`); return; }
    p.lastParry = clock; p.parrying = P.parryWindow;
    p.action = 'parry'; restart(p, 'parry');
    log(`Chạm L ${fmt(held)} s: phản đòn, isParrying = true trong 0,25 s.`);
  }

  // PlayerHealth.ApplyDamage(damage, allowDefense: true)
  function hurtPlayer(dmg, dir, kx, ky, source) {
    const p = player;
    if (p.dead || p.inv > 0) return false;
    if (p.parrying > 0) { popText(p.x, p.y - 44, 'PARRY', '#7bc3b6'); log(`Phản đòn đúng lúc: chặn ${dmg} sát thương từ ${source}.`); return false; }
    if (p.blocking) { restart(p, 'blockhit'); popText(p.x, p.y - 44, 'ĐỠ', '#7bc3b6'); log(`Đỡ được ${dmg} sát thương từ ${source}.`); return false; }
    p.hp = Math.max(0, p.hp - dmg);
    p.inv = P.invincible;
    p.vx = dir * kx * U; p.vy = -ky * U; p.grounded = false; p.lock = P.knockbackLockTime;
    p.action = 'hurt'; restart(p, 'hurt');
    popText(p.x, p.y - 44, `-${dmg}`, '#e8705f');
    log(`${source} gây ${dmg} sát thương. Máu còn ${p.hp}/100, bất tử 1,2 s.`);
    if (p.hp <= 0) { p.dead = true; p.action = 'die'; restart(p, 'die'); log('Nhân vật gục. Bấm R hoặc nút Chơi lại.'); }
    return true;
  }

  /* ---------- update ---------- */
  function update(dt) {
    clock += dt;
    const p = player;
    p.t += dt;

    if (!p.dead) {
      if (p.lDown >= 0 && !p.blocking && clock - p.lDown >= P.blockHoldThreshold) { p.blocking = true; log('Giữ L quá 0,18 s: isBlocking = true.'); }
      if (p.parrying > 0) p.parrying = Math.max(0, p.parrying - dt);
      if (p.inv > 0) p.inv = Math.max(0, p.inv - dt);
      if (p.lock > 0) p.lock = Math.max(0, p.lock - dt);

      const dir = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
      if (p.dashing > 0) {
        p.dashing = Math.max(0, p.dashing - dt);
        if (p.dashing === 0) { p.vx = 0; if (p.action === 'dash') p.action = null; }
      } else if (p.lock === 0) {
        p.vx = p.blocking ? 0 : dir * P.moveSpeed * U;
        if (dir !== 0 && !p.blocking) p.face = dir;
      }
      if (p.dashing === 0) p.vy += GRAVITY * dt;
    } else {
      p.vx *= 0.9; p.vy += GRAVITY * dt;
    }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.grounded = true; } else p.grounded = false;
    p.x = Math.max(14, Math.min(WORLD_W - 14, p.x));

    // animation choice
    if (p.dead) play(p, 'die');
    else if (p.action && !clipDone(p)) { /* keep action clip */ }
    else {
      if (p.action === 'hurt' || p.action === 'parry' || p.action?.startsWith('combo') || p.action === 'air') p.action = null;
      if (p.blocking) play(p, p.clip === 'blockhit' && !clipDone(p) ? 'blockhit' : 'block');
      else if (!p.grounded) play(p, 'jump');
      else if (Math.abs(p.vx) > 1) play(p, 'run');
      else play(p, 'idle');
    }

    for (const e of enemies) updateEnemy(e, dt);
    // simple separation so two enemies never stand on the same spot
    for (let i = 0; i < enemies.length; i++) {
      for (let j = i + 1; j < enemies.length; j++) {
        const a = enemies[i], b = enemies[j];
        if (a.state === 'dead' || b.state === 'dead') continue;
        const gap = 30 - Math.abs(a.x - b.x);
        if (gap > 0) { const s = a.x <= b.x ? -1 : 1; a.x += s * gap / 2; b.x -= s * gap / 2; }
      }
    }

    // respawn: 2.5 s after a death, a new enemy of the same kind walks in from the side away from the player
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.state === 'dead' && clock - e.deadAt > 2.5) {
        const x = player.x < WORLD_W / 2 ? WORLD_W - 40 : 40;
        enemies[i] = makeEnemy(e.kind, x);
      }
    }

    for (const f of fx) f.t += dt;
    while (fx.length && fx[0].t > 0.8) fx.shift();

    const target = Math.max(0, Math.min(WORLD_W - viewW, p.x - viewW * 0.4));
    cam += (target - cam) * Math.min(1, dt * 6);
  }

  function updateEnemy(e, dt) {
    e.t += dt;
    if (e.flash > 0) e.flash -= dt;
    if (e.bar > 0) e.bar -= dt;
    const p = player;
    const s = e.kind === 'slime' ? SLIME : SHIELD;
    const pre = e.kind === 'slime' ? 's_' : 'h_';
    if (e.state === 'dead') {
      if (e.kind === 'shield') e.flash = (Math.floor(clock * 12) % 2) * 0.1;
      return;
    }
    const dx = p.x - e.x;
    const dist = Math.abs(dx) / U;
    const toward = Math.sign(dx) || e.face;

    if (e.state === 'hurt') { if (clipDone(e)) e.state = 'idle'; else return; }

    if (e.kind === 'slime') {
      if (e.state === 'attack') { if (clipDone(e)) e.state = 'idle'; }
      else if (!p.dead && dist <= s.attackRange && clock >= e.nextAttack) {
        e.state = 'attack'; e.face = toward; restart(e, 's_attack'); e.nextAttack = clock + s.attackCooldown;
      } else if (!p.dead && dist <= s.detect && dist > 0.5) {
        e.state = 'chase'; e.face = toward; e.x += toward * s.moveSpeed * U * dt; play(e, 's_run');
      } else { e.state = 'idle'; play(e, 's_idle'); }
      // Slime.OnCollisionStay2D: contact damage every contactDamageCooldown
      const b = box(e);
      const overlap = Math.abs(dx) < (b.w / 2 + 9) && p.y > e.y - b.h - 2;
      if (overlap && p.dashing === 0 && clock >= e.nextContact) {
        e.nextContact = clock + s.contactCooldown;
        hurtPlayer(s.contactDamage, toward, P.knockX, P.knockY, 'Slime');
      }
    } else {
      if (e.state === 'push') {
        e.x += e.face * s.moveSpeed * s.pushApproachMul * U * dt;
        // DealPushDamage runs on every key of the Push clip; one hit per push
        if (!e.pushHit && Math.abs(dx) < 30 && p.y > e.y - 50 && p.dashing === 0) {
          e.pushHit = true;
          hurtPlayer(s.pushDamage, e.face, s.pushKnockX, s.pushKnockY, 'cú đẩy khiên');
        }
        if (clipDone(e)) { e.state = 'idle'; }
      } else if (e.state === 'attack') {
        if (!e.attackHit && e.t * 60 >= 24) {
          e.attackHit = true;
          const hx = e.x + e.face * 0.7 * U;
          if (Math.abs(p.x - hx) <= s.hitRadius * U + 8 && p.y > e.y - 56) hurtPlayer(s.attackDamage, e.face, P.knockX, P.knockY, 'nhát chém của quái Khiên');
        }
        if (clipDone(e)) e.state = 'idle';
      } else if (!p.dead && dist <= s.attackRange && clock >= e.nextPush) {
        e.state = 'push'; e.face = toward; e.pushHit = false; restart(e, 'h_push'); e.nextPush = clock + s.pushCooldown;
      } else if (!p.dead && dist <= s.attackRange + 0.3 && clock >= e.nextAttack) {
        e.state = 'attack'; e.face = toward; e.attackHit = false; restart(e, 'h_attack'); e.nextAttack = clock + s.attackCooldown;
      } else if (!p.dead && dist <= s.detect && dist > 0.9) {
        e.state = 'chase'; e.face = toward; e.x += toward * s.moveSpeed * s.chaseMul * U * dt; play(e, 'h_walk');
      } else { e.state = 'idle'; play(e, 'h_idle'); }
    }
    e.x = Math.max(20, Math.min(WORLD_W - 20, e.x));
    if (!CLIP[e.clip].loop && clipDone(e) && e.state === 'idle') play(e, pre + 'idle');
  }

  /* ---------- draw ---------- */
  function drawClip(ent, name, feetFromBottom) {
    const c = CLIP[name];
    const frame = c.loop ? Math.floor(ent.t * 60) % c.stop : Math.min(c.stop - 1, Math.floor(ent.t * 60));
    const k = keyIndex(c, frame);
    const img = images[c.img];
    if (!img || !img.complete || !img.naturalWidth) return;
    const sx = Math.round(ent.x - cam);
    const top = Math.round(ent.y + feetFromBottom - c.h);
    ctx.save();
    if (ent.face < 0) { ctx.translate(sx, 0); ctx.scale(-1, 1); ctx.translate(-sx, 0); }
    ctx.drawImage(img, k * c.w, 0, c.w, c.h, sx - c.w / 2, top, c.w, c.h);
    ctx.restore();
  }
  function draw() {
    if (!player) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, viewW, VIEW_H);
    layerImgs.forEach((im, i) => {
      if (!im.complete || !im.naturalWidth) return;
      const off = -((cam * LAYER_SPEED[i]) % 300);
      for (let x = off; x < viewW; x += 300) ctx.drawImage(im, Math.round(x), LAYER_Y);
    });

    for (const e of enemies) {
      if (e.state === 'dead' && e.kind === 'slime' && clipDone(e)) continue;
      // enemy sheets face left; the game flips them toward the player
      const flipped = { ...e, face: -e.face };
      ctx.globalAlpha = e.flash > 0 ? 0.55 : 1;
      drawClip(flipped, e.clip, 35);
      ctx.globalAlpha = 1;
      if (e.bar > 0 && e.state !== 'dead') {
        const b = box(e); const x = Math.round(e.x - cam - 14); const y = Math.round(e.y - b.h - 10);
        ctx.fillStyle = '#041310'; ctx.fillRect(x - 1, y - 1, 30, 4);
        ctx.fillStyle = '#b23a2d'; ctx.fillRect(x, y, Math.round(28 * e.hp / 100), 2);
      }
    }

    const p = player;
    const blink = p.inv > 0 && !p.dead && Math.floor(p.inv / 0.12) % 2 === 1;
    if (!blink) drawClip(p, p.clip, 15);

    for (const f of fx) {
      ctx.globalAlpha = Math.max(0, 1 - f.t / 0.8);
      ctx.fillStyle = f.color;
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(f.text, Math.round(f.x - cam), Math.round(f.y - f.t * 16));
      ctx.globalAlpha = 1;
    }

    // HUD: currentHealth
    ctx.fillStyle = '#041310'; ctx.fillRect(5, 3, 64, 7);
    ctx.fillStyle = '#293c39'; ctx.fillRect(6, 4, 62, 5);
    ctx.fillStyle = '#b23a2d'; ctx.fillRect(6, 4, Math.round(62 * p.hp / P.maxHealth), 5);
    if (hudEl) { const t = `Máu ${p.hp} · Đã hạ ${kills}`; if (hudEl.textContent !== t) hudEl.textContent = t; }
  }

  /* ---------- debug panel ---------- */
  const rows = {};
  if (debugEl) {
    for (const k of ['currentHealth', 'attackIndex', 'chờ attackCooldown', 'isDashing', 'canDash', 'isParrying', 'isBlocking', 'invincibleTimer']) {
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); rows[k] = dd;
      debugEl.append(dt, dd);
    }
  }
  function updateDebug() {
    if (!debugEl || !player) return;
    const p = player;
    const set = (k, v, on) => { if (rows[k].textContent !== v) rows[k].textContent = v; rows[k].classList.toggle('is-on', !!on); };
    set('currentHealth', `${p.hp} / 100`, p.hp < 100);
    set('attackIndex', String(p.attackIndex), false);
    const cd = Math.max(0, p.lastAttack + P.attackCooldown - clock);
    set('chờ attackCooldown', cd > 0 ? `${fmt(cd)} s` : '0', cd > 0);
    set('isDashing', String(p.dashing > 0), p.dashing > 0);
    set('canDash', String(clock >= p.dashReadyAt), clock < p.dashReadyAt);
    set('isParrying', String(p.parrying > 0), p.parrying > 0);
    set('isBlocking', String(p.blocking), p.blocking);
    set('invincibleTimer', p.inv > 0 ? `${fmt(p.inv)} s` : '0', p.inv > 0);
  }

  /* ---------- loop ---------- */
  let debugTick = 0;
  function frame(now) {
    if (!running || !visible) { last = 0; return; }
    const dt = last ? Math.min(1 / 30, (now - last) / 1000) : 1 / 60;
    last = now;
    update(dt);
    draw();
    debugTick += dt;
    if (debugTick > 0.08) { debugTick = 0; updateDebug(); }
    requestAnimationFrame(frame);
  }
  function start() {
    arena.classList.add('is-playing');
    arena.focus({ preventScroll: true });
    if (!running) { running = true; last = 0; requestAnimationFrame(frame); }
  }
  function pause() {
    running = false;
    keys.clear();
    arena.classList.remove('is-playing');
  }

  /* ---------- sizing ---------- */
  function resize() {
    const cw = arena.clientWidth || 400;
    // about 3x on desktop, 2x on phones, never wider than the 300px layer art repeats comfortably
    viewW = Math.round(Math.max(180, Math.min(380, cw / (cw < 600 ? 1.9 : 3))));
    canvas.width = viewW; canvas.height = VIEW_H;
    if (player) { cam = Math.max(0, Math.min(WORLD_W - viewW, player.x - viewW * 0.4)); draw(); }
  }
  window.addEventListener('resize', resize);

  resize();
  reset();
  draw();
  updateDebug();

  /* ---------- input ---------- */
  const MAP = { a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' };
  function press(action) {
    if (!player) return;
    if (!running) start();
    if (action === 'left' || action === 'right') keys.add(action);
    else if (action === 'jump') tryJump();
    else if (action === 'attack') tryAttack();
    else if (action === 'dash') tryDash();
    else if (action === 'guard') lPress();
    else if (action === 'restart') reset();
  }
  function release(action) {
    if (action === 'left' || action === 'right') keys.delete(action);
    else if (action === 'guard') lRelease();
  }
  function actionFor(e) {
    const k = e.key.toLowerCase();
    if (MAP[k]) return MAP[k];
    if (k === ' ' || k === 'w' || k === 'arrowup') return 'jump';
    if (k === 'j') return 'attack';
    if (k === 'k' || k === 'shift') return 'dash';
    if (k === 'l') return 'guard';
    if (k === 'r') return 'restart';
    return null;
  }
  arena.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { pause(); return; }
    const a = actionFor(e);
    if (!a) return;
    e.preventDefault();
    if (e.repeat && a !== 'left' && a !== 'right') return;
    press(a);
  });
  arena.addEventListener('keyup', (e) => { const a = actionFor(e); if (a) { e.preventDefault(); release(a); } });
  arena.addEventListener('blur', () => { if (player && player.lDown >= 0) lRelease(); keys.clear(); });
  arena.addEventListener('pointerdown', (e) => { if (e.target === canvas) start(); });
  startBtn.addEventListener('click', start);
  // the hero's "Chơi thử combat" link lands on the arena with keyboard focus
  const playLink = document.getElementById('playLink');
  if (playLink) playLink.addEventListener('click', () => setTimeout(() => arena.focus({ preventScroll: true }), 400));

  document.querySelectorAll('[data-act]').forEach((btn) => {
    const a = btn.dataset.act;
    const down = (e) => { e.preventDefault(); btn.classList.add('is-down'); press(a); };
    const up = () => { if (!btn.classList.contains('is-down')) return; btn.classList.remove('is-down'); release(a); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) down(e); });
    btn.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') up(); });
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  });

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && running) { last = 0; requestAnimationFrame(frame); }
  }, { threshold: 0.15 }).observe(arena);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
})();
