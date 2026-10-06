// Hero: the game's parallax layers and the player's Idle/Running clips.
// Key frames come from Assets/Animations/Player/*.anim (60 samples per second), stored as round(keyTime * 60).
(() => {
  const FPS = 60;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const CLIPS = {
    idle: { sheet: 'player_idle.png',    h: 64, keys: [0, 6, 10, 17, 23, 30, 34, 40], stop: 41 },
    run:  { sheet: 'player_running.png', h: 64, keys: [0, 5, 10, 15, 19, 24, 29, 34], stop: 35 },
  };

  const sheetUrl = (clip) => `assets/sprites/${clip.sheet}`;
  const keyIndexAt = (clip, frame) => {
    let k = 0;
    for (let i = 0; i < clip.keys.length; i++) if (clip.keys[i] <= frame) k = i;
    return k;
  };

  /* ---------- sprite painter ---------- */
  function paint(el, clip, keyIndex, px) {
    el.style.backgroundImage = `url("${sheetUrl(clip)}")`;
    el.style.backgroundSize = `${clip.keys.length * 96 * px}px ${clip.h * px}px`;
    el.style.backgroundPosition = `${-keyIndex * 96 * px}px 100%`;
  }
  const pxOf = (el) => parseFloat(getComputedStyle(el).getPropertyValue('--px')) || 3;

  /* ---------- hero: player + parallax (ParallaxScroll: offset = camera x * speed) ---------- */
  const bar = document.getElementById('bar');
  const hero = document.querySelector('.hero');
  const layers = [...document.querySelectorAll('.hero .layer')];
  const player = document.getElementById('heroPlayer');
  let heroClip = 'idle';
  let heroStart = performance.now();
  let lastScroll = 0;
  let scrollStopTimer = 0;
  let arriving = !reduce.matches;
  let arrivalStart = performance.now();
  let heroVisible = true;
  let ticking = false;

  function setHeroClip(name) {
    if (heroClip === name) return;
    heroClip = name;
    heroStart = performance.now();
  }

  function applyParallax(y) {
    for (const layer of layers) {
      const d = parseFloat(layer.dataset.depth);
      layer.style.backgroundPositionX = `${-(y * d * 1.6)}px`;
    }
  }

  function heroTick(now) {
    const px = pxOf(player);
    if (arriving) {
      const p = Math.min(1, (now - arrivalStart) / 1100);
      const eased = 1 - Math.pow(1 - p, 4);
      player.style.transform = `translateX(${(eased - 1) * 70}vw)`;
      setHeroClip(p < 1 ? 'run' : 'idle');
      if (p >= 1) { arriving = false; player.style.transform = ''; }
    }
    const clip = CLIPS[heroClip];
    const frame = Math.floor(((now - heroStart) / 1000) * FPS) % clip.stop;
    paint(player, clip, keyIndexAt(clip, frame), px);
    if (!reduce.matches && heroVisible) requestAnimationFrame(heroTick); else ticking = false;
  }

  function onScroll() {
    const y = window.scrollY;
    bar.classList.toggle('is-solid', y > 40);
    if (reduce.matches) return;
    if (y < hero.offsetHeight * 1.2) applyParallax(y);
    if (Math.abs(y - lastScroll) > 2 && !arriving) {
      setHeroClip('run');
      player.style.transform = y < lastScroll ? 'scaleX(-1)' : '';
      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => { setHeroClip('idle'); }, 160);
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (reduce.matches) {
    paint(player, CLIPS.idle, 0, pxOf(player));
  } else {
    ticking = true;
    requestAnimationFrame(heroTick);
    // stop painting the hero sprite while the hero is off screen
    new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible && !ticking) { ticking = true; requestAnimationFrame(heroTick); }
    }).observe(hero);
  }

})();
