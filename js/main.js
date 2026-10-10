/**
 * AXEL V. // MONTEUR VIDÉO PROFESSIONNEL
 * Main Engine: Audio Synthesizer, Countdown Leader, Timecode HUD, NLE Scroll Tracking & Cinema Showreel
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 01. AUDIO SYNTHESIZER (WEB AUDIO API - ZERO DEPENDENCY)
  // =========================================================================
  class SoundController {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.init();
    }

    init() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.1) {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio error silent fallback
      }
    }

    // Effet Bip Leader 1kHz
    beepLeader() {
      this.playTone(1000, 'sine', 0.1, 0.18);
    }

    // Effet Clic de montage / Cut
    clickCut() {
      this.playTone(1800, 'triangle', 0.03, 0.08);
    }

    // Effet Snap de Clap de cinéma (Basse percussive + aigu)
    clapSnap() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      try {
        // Coup de basse
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);
        gain1.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start();
        osc1.stop(this.ctx.currentTime + 0.2);

        // Clac en bois
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(800, this.ctx.currentTime);
        gain2.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start();
        osc2.stop(this.ctx.currentTime + 0.05);
      } catch (e) {}
    }

    // Whoosh transition
    whoosh() {
      if (!this.enabled || !this.ctx) return;
      this.resume();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
      } catch(e) {}
    }
  }

  const sfx = new SoundController();

  // Audio Toggle Button in Header
  const audioToggle = document.getElementById('audioToggle');
  const soundIconOn = document.getElementById('soundIconOn');
  const soundIconOff = document.getElementById('soundIconOff');
  const audioLabel = document.getElementById('audioLabel');

  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      if (sfx.enabled) {
        soundIconOn.classList.remove('hidden');
        soundIconOff.classList.add('hidden');
        audioLabel.textContent = 'SFX ON';
        audioToggle.classList.add('active');
        sfx.beepLeader();
      } else {
        soundIconOn.classList.add('hidden');
        soundIconOff.classList.remove('hidden');
        audioLabel.textContent = 'SFX OFF';
        audioToggle.classList.remove('active');
      }
    });
  }

  // 02. COUNTDOWN LEADER REMOVED FOR INSTANT ZERO-LATENCY LOAD


  // =========================================================================
  // 03. CUSTOM CURSOR PLAYHEAD
  // =========================================================================
  const customCursor = document.getElementById('customCursor');
  const cursorBadge = document.getElementById('cursorBadge');
  const cursorTc = document.getElementById('cursorTc');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  if (customCursor && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth cursor interpolation
    function renderCursor() {
      cursorX += (mouseX - cursorX) * 0.25;
      cursorY += (mouseY - cursorY) * 0.25;
      customCursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover badge contextual states
    document.querySelectorAll('a, button, .project-card, .split-slider-box').forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (el.classList.contains('project-card')) {
          cursorBadge.textContent = 'SCRUB';
        } else if (el.classList.contains('split-slider-box')) {
          cursorBadge.textContent = 'DRAG';
        } else if (el.id === 'btnPlayShowreelHero' || el.id === 'btnCinemaPlay') {
          cursorBadge.textContent = 'PLAY';
        } else {
          cursorBadge.textContent = 'SELECT';
        }
      });
      el.addEventListener('mouseleave', () => {
        cursorBadge.textContent = 'CUT';
      });
    });
  }


  // =========================================================================
  // 04. TIMECODE RUNNER (60 FPS NLE CLOCK)
  // =========================================================================
  const globalTcDisplay = document.getElementById('globalTcDisplay');
  const timelineTcLive = document.getElementById('timelineTcLive');

  let frameCount = 0;
  setInterval(() => {
    frameCount++;
    const totalFrames = frameCount % (60 * 60 * 60 * 24);
    const frames = totalFrames % 60;
    const totalSeconds = Math.floor(totalFrames / 60);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const hours = Math.floor(totalMinutes / 60) % 24;

    const pad = (n) => String(n).padStart(2, '0');
    const tcString = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;

    if (globalTcDisplay) globalTcDisplay.textContent = tcString;
    if (timelineTcLive) timelineTcLive.textContent = tcString;
    if (cursorTc) cursorTc.textContent = `${pad(seconds)}:${pad(frames)}`;
  }, 1000 / 60);


  // =========================================================================
  // 05. FIXED TIMELINE NLE & SCROLL TRACKING
  // =========================================================================
  const timelinePlayhead = document.getElementById('timelinePlayhead');
  const currentSectionName = document.getElementById('currentSectionName');
  const nleClips = document.querySelectorAll('.nle-clip');

  const sections = [
    { id: 'hero', name: 'HERO // INTRO' },
    { id: 'showreel', name: 'SHOWREEL 2026' },
    { id: 'projets', name: 'PROJETS // REELS & CLIPS' },
    { id: 'avant-apres', name: 'COLOR GRADING // DAVINCI' },
    { id: 'tarifs', name: 'TARIFS & SERVICES' },
    { id: 'process', name: 'WORKFLOW EN 6 CUTS' },
    { id: 'commande', name: 'NOUVEAU BRIEF' }
  ];

  function updateTimeline() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

    // Move playhead needle across tracks
    if (timelinePlayhead) {
      timelinePlayhead.style.left = `${scrollPercent}%`;
    }

    // Determine current active section
    let activeSec = sections[0];
    for (const sec of sections) {
      const el = document.getElementById(sec.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) {
          activeSec = sec;
        }
      }
    }

    if (currentSectionName) {
      currentSectionName.textContent = activeSec.name;
    }

    nleClips.forEach(clip => {
      if (clip.dataset.section === activeSec.id) {
        clip.classList.add('active');
      } else {
        clip.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateTimeline, { passive: true });
  updateTimeline();

  // NLE Clip Click Jump
  nleClips.forEach(clip => {
    clip.addEventListener('click', (e) => {
      sfx.clickCut();
    });
  });


  // =========================================================================
  // 06. CINEMA SHOWREEL MONITOR & AUDIO WAVEFORM CANVAS
  // =========================================================================
  const cinemaScreen = document.getElementById('cinemaScreen');
  const btnCinemaPlay = document.getElementById('btnCinemaPlay');
  const cinemaPlayOverlay = document.getElementById('cinemaPlayOverlay');
  const ctrlPlayToggle = document.getElementById('ctrlPlayToggle');
  const ctrlPlayIcon = document.getElementById('ctrlPlayIcon');
  const showreelScrubber = document.getElementById('showreelScrubber');
  const showreelProgress = document.getElementById('showreelProgress');
  const showreelHead = document.getElementById('showreelHead');
  const ctrlTime = document.getElementById('ctrlTime');
  const btnToggleScope = document.getElementById('btnToggleScope');
  const scopeBarTop = document.getElementById('scopeBarTop');
  const scopeBarBottom = document.getElementById('scopeBarBottom');
  const btnToggleResolution = document.getElementById('btnToggleResolution');
  const btnFullscreenCinema = document.getElementById('btnFullscreenCinema');
  const waveformCanvas = document.getElementById('waveformCanvas');

  let isPlaying = false;
  let reelProgress = 20; // in percent
  let playInterval = null;

  function toggleCinemaPlay() {
    isPlaying = !isPlaying;
    sfx.clickCut();

    if (isPlaying) {
      cinemaPlayOverlay.style.opacity = '0';
      cinemaPlayOverlay.style.pointerEvents = 'none';
      ctrlPlayIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
      
      playInterval = setInterval(() => {
        reelProgress = (reelProgress + 0.5) % 100;
        updateReelUI();
      }, 100);
    } else {
      cinemaPlayOverlay.style.opacity = '1';
      cinemaPlayOverlay.style.pointerEvents = 'auto';
      ctrlPlayIcon.innerHTML = '<polygon points="6 4 20 12 6 20 6 4"></polygon>';
      clearInterval(playInterval);
    }
  }

  function updateReelUI() {
    if (showreelProgress) showreelProgress.style.width = `${reelProgress}%`;
    if (showreelHead) showreelHead.style.left = `${reelProgress}%`;
    
    const curSec = Math.floor((reelProgress / 100) * 90);
    const m = String(Math.floor(curSec / 60)).padStart(2, '0');
    const s = String(curSec % 60).padStart(2, '0');
    if (ctrlTime) ctrlTime.textContent = `00:${m}:${s} / 00:01:30`;
  }

  if (btnCinemaPlay) btnCinemaPlay.addEventListener('click', toggleCinemaPlay);
  if (ctrlPlayToggle) ctrlPlayToggle.addEventListener('click', toggleCinemaPlay);

  // Scrubber click on Showreel
  if (showreelScrubber) {
    showreelScrubber.addEventListener('click', (e) => {
      const rect = showreelScrubber.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      reelProgress = Math.min(100, Math.max(0, (clickX / rect.width) * 100));
      updateReelUI();
      sfx.clickCut();
    });
  }

  // Toggle 2.39:1 CinemaScope letterbox bars
  if (btnToggleScope) {
    btnToggleScope.addEventListener('click', () => {
      sfx.clickCut();
      const isCollapsed = scopeBarTop.classList.toggle('collapsed');
      scopeBarBottom.classList.toggle('collapsed');
      btnToggleScope.classList.toggle('active', !isCollapsed);
      btnToggleScope.textContent = isCollapsed ? '16:9 FULL' : '2.39:1 SCOPE';
    });
  }

  // Toggle Resolution Display
  if (btnToggleResolution) {
    btnToggleResolution.addEventListener('click', () => {
      sfx.clickCut();
      const current = btnToggleResolution.textContent;
      btnToggleResolution.textContent = current === '4K UHD' ? '1080P PRO' : '4K UHD';
    });
  }

  // Fullscreen Cinema mode
  if (btnFullscreenCinema) {
    btnFullscreenCinema.addEventListener('click', () => {
      sfx.clickCut();
      if (!document.fullscreenElement) {
        cinemaScreen.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // Render Realtime Dynamic Waveform on Canvas
  if (waveformCanvas) {
    const ctx = waveformCanvas.getContext('2d');
    let phase = 0;

    function drawWaveform() {
      ctx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
      const width = waveformCanvas.width;
      const height = waveformCanvas.height;
      const mid = height / 2;
      const bars = 120;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        // Multi-frequency wave formula
        const freq1 = Math.sin((i * 0.1) + phase) * 0.5 + 0.5;
        const freq2 = Math.cos((i * 0.05) - phase * 1.5) * 0.5 + 0.5;
        const amplitude = (freq1 * freq2) * (isPlaying ? 1.0 : 0.4);
        const barHeight = Math.max(3, amplitude * (height - 6));

        // Color gradient: cyan to orange peak
        ctx.fillStyle = amplitude > 0.75 ? '#FF6A00' : (amplitude > 0.5 ? '#FF8533' : '#00E5FF');
        ctx.fillRect(i * barWidth, mid - barHeight / 2, barWidth - 1.5, barHeight);
      }

      phase += isPlaying ? 0.08 : 0.015;
      requestAnimationFrame(drawWaveform);
    }
    drawWaveform();
  }


  // =========================================================================
  // 07. ANIMATED STATS COUNTERS (INTERSECTION OBSERVER)
  // =========================================================================
  const counters = document.querySelectorAll('.counter');
  let animated = false;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        counters.forEach(counter => {
          const target = parseFloat(counter.dataset.target);
          const duration = 1800;
          const startTime = performance.now();

          function updateCount(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeProgress * target);
            counter.textContent = current;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              counter.textContent = target;
            }
          }
          requestAnimationFrame(updateCount);
        });
      }
    });
  }, { threshold: 0.3 });

  const metricsSection = document.querySelector('.hero-metrics-grid');
  if (metricsSection) {
    countObserver.observe(metricsSection);
  }


  // =========================================================================
  // 08. HERO 4-TAB SWITCHER & 3D STAGE INTERACTION
  // =========================================================================
  const heroTabBtns = document.querySelectorAll('.hero-tab-btn');
  const heroCenterCard = document.getElementById('heroCenterCard');
  const heroCenterImg = document.getElementById('heroCenterImg');
  const heroCenterTitle = document.getElementById('heroCenterTitle');
  const heroCenterSub = document.getElementById('heroCenterSub');
  const btnHeroPlayMaster = document.getElementById('btnHeroPlayMaster');

  const heroTabData = {
    retention: {
      projectId: 3,
      img: 'assets/images/project-youtube.jpg',
      title: 'DANS LE CRATÈRE // YOUTUBE DOCU',
      sub: 'TC 00:06:42:08 — RÉTENTION 67%'
    },
    grading: {
      projectId: 8,
      img: 'assets/images/project-arctic.jpg',
      title: 'LE BRIS-DE-GLACE // ARCTIC DOCU',
      sub: 'TC 00:11:45:18 — ARRI RAW LOG TO 709'
    },
    sound: {
      projectId: 2,
      img: 'assets/images/project-commercial.jpg',
      title: 'APOLLO HYPERCAR // GLOBAL ADS',
      sub: 'TC 00:00:09:12 — DOLBY ATMOS 5.1 V12'
    },
    shorts: {
      projectId: 5,
      img: 'assets/images/project-gym.jpg',
      title: 'BEAST MODE BATTLE // REEL 9:16',
      sub: 'TC 00:00:14:02 — 12M VUES VIRAL'
    }
  };

  // =========================================================================
  // 08. SECTION 02: 3D STACKED CARD DECK CONTROLLER (EXACT SCREENSHOT)
  // =========================================================================
  // 08. SECTION 02: 3D STACKED CARD DECK CONTROLLER (EXACT SCREENSHOT)
  // =========================================================================
  const deckCards = document.querySelectorAll('.deck-card');
  const btnDeckPrev = document.getElementById('btnDeckPrev');
  const btnDeckNext = document.getElementById('btnDeckNext');
  const deckIndicator = document.getElementById('deckIndicator');
  const deckStage = document.getElementById('projectsDeckStage');

  let activeDeckIdx = 0;
  const totalDeckCards = deckCards.length;
  let isDeckAnimating = false;

  function updateDeck(newIdx, direction = 'next') {
    if (!totalDeckCards || isDeckAnimating) return;
    isDeckAnimating = true;

    const oldActiveCard = deckCards[activeDeckIdx];
    const isExiting = (direction === 'next') && oldActiveCard;

    if (isExiting) {
      oldActiveCard.classList.add('stack-exiting');
    }

    const delay = isExiting ? 180 : 0;

    setTimeout(() => {
      activeDeckIdx = (newIdx + totalDeckCards) % totalDeckCards;

      deckCards.forEach((card, i) => {
        card.classList.remove('stack-pos-0', 'stack-pos-1', 'stack-pos-2', 'stack-pos-3', 'stack-pos-4', 'stack-pos-hidden', 'stack-exiting');

        const relPos = (i - activeDeckIdx + totalDeckCards) % totalDeckCards;

        if (relPos === 0) {
          card.classList.add('stack-pos-0');
        } else if (relPos === 1) {
          card.classList.add('stack-pos-1');
        } else if (relPos === 2) {
          card.classList.add('stack-pos-2');
        } else if (relPos === 3) {
          card.classList.add('stack-pos-3');
        } else if (relPos === 4) {
          card.classList.add('stack-pos-4');
        } else {
          card.classList.add('stack-pos-hidden');
        }
      });

      if (deckIndicator) {
        const num = String(activeDeckIdx + 1).padStart(2, '0');
        const tot = String(totalDeckCards).padStart(2, '0');
        deckIndicator.textContent = `${num} / ${tot}`;
      }

      setTimeout(() => {
        isDeckAnimating = false;
      }, 300);
    }, delay);
  }

  function nextDeckCard() {
    sfx.whoosh();
    updateDeck(activeDeckIdx + 1, 'next');
  }

  function prevDeckCard() {
    sfx.clickCut();
    updateDeck(activeDeckIdx - 1, 'prev');
  }

  if (btnDeckNext) {
    btnDeckNext.addEventListener('click', (e) => {
      e.stopPropagation();
      nextDeckCard();
    });
  }

  if (btnDeckPrev) {
    btnDeckPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      prevDeckCard();
    });
  }

  deckCards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      // If click was on the open-modal button, handle modal
      if (e.target.closest('.btn-deck-open-modal')) {
        e.stopPropagation();
        const pId = card.dataset.id;
        if (pId) openProjectModal(pId);
        return;
      }

      // If clicked card is the front card, cycle to the next card
      if (card.classList.contains('stack-pos-0')) {
        nextDeckCard();
      } else {
        // If clicked card is in the background, bring it directly to the front!
        sfx.whoosh();
        updateDeck(i, 'select');
      }
    });

    const openBtn = card.querySelector('.btn-deck-open-modal');
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = card.dataset.id;
        if (pId) openProjectModal(pId);
      });
    }
  });

  // Touch Swipe Support (Mobile)
  if (deckStage) {
    let touchStartX = 0;
    let touchStartY = 0;

    deckStage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].screenX;
        touchStartY = e.touches[0].screenY;
      }
    }, { passive: true });

    deckStage.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const diffX = e.changedTouches[0].screenX - touchStartX;
        const diffY = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            nextDeckCard();
          } else {
            prevDeckCard();
          }
        }
      }
    }, { passive: true });
  }

  // Keyboard navigation when projects deck is visible
  document.addEventListener('keydown', (e) => {
    const pModal = document.getElementById('projectModal');
    if (pModal && !pModal.classList.contains('hidden')) return;
    if (!deckStage) return;
    const rect = deckStage.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextDeckCard();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevDeckCard();
      }
    }
  });

  if (totalDeckCards > 0) {
    updateDeck(0, 'init');
  }

    // Project Modal Data (Catalogue officiel des 11 Projets Réels d'Imran Tel)
  const projectsData = {
    1: {
      title: "BEST CONTENT FORMAT // YOUTUBE 4K",
      category: "YOUTUBE LONG FORMAT 4K",
      client: "Créateur YouTube Majeur",
      software: "DaVinci Resolve Studio 19",
      ratio: "16:9 4K UHD",
      metric: "Rétention Maximale // Hook 3s",
      img: "assets/projets/posters/poster-1.webp",
      video: "assets/projets/videos/project-1.mp4",
      desc: "Format YouTube 4K haute rétention : hook chirurgical dès les 3 premières secondes, suppression de tout temps mort, motion design et sound design multicouche."
    },
    2: {
      title: "CINEMATIC B-ROLLS MASTER // 4K",
      category: "B-ROLLS & SOUND DESIGN",
      client: "Production Indépendante",
      software: "DaVinci Resolve Studio 19",
      ratio: "16:9 4K Cinema",
      metric: "Étalonnage DaVinci Studio",
      img: "assets/projets/posters/poster-2.webp",
      video: "assets/projets/videos/project-2.mp4",
      desc: "Séquence cinématographique B-Rolls avec sound design immersif, transitions fluides et étalonnage couleur cinéma DaVinci Resolve Studio 19."
    },
    3: {
      title: "AWAKE // RETENTION HOOK",
      category: "SHORTS & REELS VIRAUX",
      client: "Créateur Réseaux Sociaux",
      software: "Premiere Pro + After Effects",
      ratio: "9:16 Vertical 4K",
      metric: "Taux de complétion 92%",
      img: "assets/projets/posters/poster-3.webp",
      video: "assets/projets/videos/project-3.mp4",
      desc: "Format court viral 'AWAKE' : cut dynamique, sous-titres animés sans aucune faute, sound effects percutants et synchronisation millimétrée."
    },
    4: {
      title: "PATCHOU // RYTHME & SOUND DESIGN",
      category: "STORYTELLING & REELS",
      client: "Créateur YouTube / TikTok",
      software: "DaVinci Resolve Studio",
      ratio: "9:16 Vertical",
      metric: "Engagement Élevé",
      img: "assets/projets/posters/poster-4.webp",
      video: "assets/projets/videos/project-4.mp4",
      desc: "Montage narratif punchy avec hook immédiat, dynamisme soutenu et sound design soigné pour captiver le viewer."
    },
    5: {
      title: "CUT CHIRURGICAL #02 // HIGH PACING",
      category: "SHORTS & TIKTOK",
      client: "Créateur YouTube Shorts",
      software: "DaVinci Resolve Studio 19",
      ratio: "9:16 Vertical",
      metric: "Suppression temps morts",
      img: "assets/projets/posters/poster-5.webp",
      video: "assets/projets/videos/project-5.mp4",
      desc: "Suppression chirurgicale des hésitations et respirations, zooms dynamiques et animation de sous-titres stylisés."
    },
    6: {
      title: "HIGH-ENERGY EDIT #06 // SUBTITLES FX",
      category: "SHORTS & REELS VIRAUX",
      client: "Top Créateur Réseaux",
      software: "After Effects + DaVinci",
      ratio: "9:16 Vertical",
      metric: "Vues Virales // Pacing Rapide",
      img: "assets/projets/posters/poster-6.webp",
      video: "assets/projets/videos/project-6.mp4",
      desc: "Pacing ultra-énergique, titrages animés, b-rolls percutants et mixage sonore dynamique."
    },
    7: {
      title: "RETENTION MASTERY #08 // SOUND DESIGN",
      category: "SHORTS & TIKTOK DYNAMIQUE",
      client: "Chaîne YouTube Croissance",
      software: "DaVinci Resolve Studio",
      ratio: "9:16 Vertical",
      metric: "Maintien de l'attention 100%",
      img: "assets/projets/posters/poster-7.webp",
      video: "assets/projets/videos/project-7.mp4",
      desc: "Optimisation de chaque seconde avec variation d'échelles de plan, sound effects percutants et colorimétrie dynamique."
    },
    8: {
      title: "DYNAMISME & MOTION #05",
      category: "SHORTS & REELS",
      client: "Créateur de Contenu",
      software: "Premiere Pro + After Effects",
      ratio: "9:16 Vertical",
      metric: "Cuts rythmés",
      img: "assets/projets/posters/poster-8.webp",
      video: "assets/projets/videos/project-8.mp4",
      desc: "Motion graphics cinétiques, transitions invisibles et harmonisation audio pour un rendu professionnel."
    },
    9: {
      title: "VIRAL PACING #10 // SFX IMMERSIF",
      category: "SHORTS & TIKTOK HIGH-PACING",
      client: "Créateur Shorts & Reels",
      software: "DaVinci Resolve Studio 19",
      ratio: "9:16 Vertical",
      metric: "Rétention Algorithmique",
      img: "assets/projets/posters/poster-9.webp",
      video: "assets/projets/videos/project-9.mp4",
      desc: "Rythme soutenu pour déclencher l'algorithme YouTube Shorts / TikTok, découpe précise et mix sonore immersif."
    },
    10: {
      title: "FAST-CUT DYNAMIC #09",
      category: "SHORTS & REELS VIRAUX",
      client: "Créateur Lifestyle & Business",
      software: "DaVinci Resolve Studio",
      ratio: "9:16 Vertical",
      metric: "Transitions Fluides",
      img: "assets/projets/posters/poster-10.webp",
      video: "assets/projets/videos/project-10.mp4",
      desc: "Enchaînement ultra-fluide des plans, colorimétrie contrastée et sous-titres animés parfaitement synchronisés."
    },
    11: {
      title: "SHORTS SPRINT EXPRESS #03",
      category: "SHORTS & TIKTOK SPRINT",
      client: "Créateur Actif",
      software: "DaVinci Resolve Studio 19",
      ratio: "9:16 Vertical",
      metric: "Livré en Sprint < 48h",
      img: "assets/projets/posters/poster-11.webp",
      video: "assets/projets/videos/project-11.mp4",
      desc: "Réalisé et livré dans le respect strict des délais, netteté vidéo, compression web optimale et audio parfaitement équilibré."
    },
    12: {
      title: "HOOK VIRAL & CTA #01",
      category: "REELS & SHORTS VIRAUX",
      client: "Créateur Réseaux & Marque",
      software: "DaVinci Resolve Studio 19",
      ratio: "9:16 Vertical 4K",
      metric: "Rétention +40% // Hook 3s",
      img: "assets/projets/posters/poster-12.webp",
      video: "assets/projets/videos/project-12.mp4",
      desc: "Accroche visuelle immédiate, incrustation dynamique et appel à l'action percutant calibré pour convertir l'audience."
    },
    13: {
      title: "RETENTION MASTERCLASS #02",
      category: "SHORTS & TIKTOK 4K",
      client: "Infopreneur & Formateur",
      software: "Premiere Pro + After Effects",
      ratio: "9:16 Vertical 4K",
      metric: "Watch Time 88%",
      img: "assets/projets/posters/poster-13.webp",
      video: "assets/projets/videos/project-13.mp4",
      desc: "Pacing soutenu sans temps mort, sound design multicouche et animation cinétique pour une rétention maximale."
    },
    14: {
      title: "VLOG BATUMI // TRAVEL 4K",
      category: "VLOG & CINÉMA 4K",
      client: "Créateur Voyage & Lifestyle",
      software: "DaVinci Resolve Studio 19",
      ratio: "16:9 4K Cinema",
      metric: "Color Grading DaVinci",
      img: "assets/projets/posters/poster-14.webp",
      video: "assets/projets/videos/project-14.mp4",
      desc: "Montage cinématique de voyage : sound design immersif, transitions fluides et colorimétrie soignée façon cinéma."
    },
    15: {
      title: "VSL AHMED // HIGH-TICKET",
      category: "VSL & VIDÉO DE VENTE",
      client: "Business B2B & Consulting",
      software: "DaVinci Resolve Studio 19",
      ratio: "16:9 4K UHD",
      metric: "Conversion & Autorité",
      img: "assets/projets/posters/poster-15.webp",
      video: "assets/projets/videos/project-15.mp4",
      desc: "Vidéo de vente à fort impact : titrages d'autorité, animations de preuves visuelles et rythme hypnotique captivant."
    },
    16: {
      title: "SHOWREEL RÉTENTION 2026",
      category: "BEST-OF RÉTENTION & MOTION",
      client: "Imran Tel // Showreel Officiel",
      software: "DaVinci Resolve Studio 19",
      ratio: "16:9 4K Master",
      metric: "Top Performances 2026",
      img: "assets/projets/posters/poster-16.webp",
      video: "assets/projets/videos/project-16.mp4",
      desc: "Concentré des meilleures réalisations : hooks ultra-rapides, cuts millimétrés et sound design percutant."
    }
  };

  const projectModal = document.getElementById('projectModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const btnModalClose = document.getElementById('btnModalClose');
  const modalImg = document.getElementById('modalImg');
  const modalVideo = document.getElementById('modalVideo');
  const modalCategory = document.getElementById('modalCategory');
  const modalProjectTitle = document.getElementById('modalProjectTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalClient = document.getElementById('modalClient');
  const modalSoftware = document.getElementById('modalSoftware');
  const modalRatio = document.getElementById('modalRatio');
  const modalMetric = document.getElementById('modalMetric');
  const btnModalPrev = document.getElementById('btnModalPrev');
  const btnModalNext = document.getElementById('btnModalNext');

  let currentModalId = 1;

  function openProjectModal(id) {
    const data = projectsData[id];
    if (!data) return;
    currentModalId = parseInt(id, 10);

    if (modalVideo && data.video) {
      modalVideo.src = data.video;
      modalVideo.classList.remove('hidden');
      if (modalImg) modalImg.classList.add('hidden');
      modalVideo.play().catch(() => {});
    } else {
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.src = '';
        modalVideo.classList.add('hidden');
      }
      if (modalImg) {
        modalImg.src = data.img;
        modalImg.classList.remove('hidden');
      }
    }

    if (modalCategory) modalCategory.textContent = data.category;
    if (modalProjectTitle) modalProjectTitle.textContent = data.title;
    if (modalDescription) modalDescription.textContent = data.desc;
    if (modalClient) modalClient.textContent = data.client;
    if (modalSoftware) modalSoftware.textContent = data.software;
    if (modalRatio) modalRatio.textContent = data.ratio;
    if (modalMetric) modalMetric.textContent = data.metric;

    if (projectModal) {
      projectModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    sfx.clickCut();
  }
  window.openProjectModal = openProjectModal;

  function closeProjectModal() {
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.currentTime = 0;
      modalVideo.src = '';
      modalVideo.classList.add('hidden');
    }
    if (modalImg) modalImg.classList.remove('hidden');
    if (projectModal) projectModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.btn-card-open').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.project-card, .project-card-premium');
      if (card) openProjectModal(card.dataset.id);
    });
  });

  const projectCards = document.querySelectorAll('.project-card');
  if (projectCards && projectCards.length > 0) {
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        openProjectModal(card.dataset.id);
      });
    });
  }

  document.querySelectorAll('.curved-item').forEach(item => {
    item.addEventListener('click', () => {
      const pId = item.dataset.id;
      if (pId) openProjectModal(pId);
    });
  });

  document.querySelectorAll('.gallery-project-card').forEach(card => {
    card.addEventListener('click', () => {
      const pId = card.dataset.id;
      if (pId) openProjectModal(pId);
    });
  });

  if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);
  if (btnModalClose) btnModalClose.addEventListener('click', closeProjectModal);

  if (btnModalPrev) {
    btnModalPrev.addEventListener('click', () => {
      let nextId = currentModalId - 1;
      if (nextId < 1) nextId = 16;
      openProjectModal(nextId);
    });
  }

  if (btnModalNext) {
    btnModalNext.addEventListener('click', () => {
      let nextId = currentModalId + 1;
      if (nextId > 16) nextId = 1;
      openProjectModal(nextId);
    });
  }


  // =========================================================================
  // =========================================================================
  // 09. FAQ ACCORDION (100% FONCTIONNEL & INDÉPENDANT)
  // =========================================================================
  const faqCleanItems = document.querySelectorAll('.faq-clean-item');
  faqCleanItems.forEach(item => {
    const btn = item.querySelector('.faq-clean-header');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        sfx.clickCut();
        item.classList.toggle('open');
        const isOpen = item.classList.contains('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  });

  // =========================================================================
  // 09.B MODAL LIGHTBOX AVIS CLIENTS (AVEC CROIX DE FERMETURE)
  // =========================================================================
  const reviewModal = document.getElementById('reviewModal');
  const reviewModalImg = document.getElementById('reviewModalImg');
  const btnReviewModalClose = document.getElementById('btnReviewModalClose');
  const reviewModalBackdrop = document.getElementById('reviewModalBackdrop');

  function openReviewModal(imgSrc) {
    if (!reviewModal || !reviewModalImg) return;
    reviewModalImg.src = imgSrc;
    reviewModal.classList.remove('hidden');
    sfx.clickCut();
  }

  function closeReviewModal() {
    if (!reviewModal) return;
    reviewModal.classList.add('hidden');
    if (reviewModalImg) reviewModalImg.src = '';
    sfx.clickCut();
  }

  document.querySelectorAll('.wa-review-clickable').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const src = item.dataset.reviewSrc || item.querySelector('img')?.src;
      if (src) openReviewModal(src);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const src = item.dataset.reviewSrc || item.querySelector('img')?.src;
        if (src) openReviewModal(src);
      }
    });
  });

  if (btnReviewModalClose) btnReviewModalClose.addEventListener('click', closeReviewModal);
  if (reviewModalBackdrop) reviewModalBackdrop.addEventListener('click', closeReviewModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reviewModal && !reviewModal.classList.contains('hidden')) {
      closeReviewModal();
    }
  });

  // =========================================================================
  // 09.C NAVIGATION RÉELLE & 100% FONCTIONNELLE
  // =========================================================================
  const siteHeaderCapsule = document.getElementById('siteHeader');
  const btnMobileNav = document.getElementById('btnMobileNav');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');

  // Capsule Header scroll detection
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeaderCapsule?.classList.add('scrolled');
    } else {
      siteHeaderCapsule?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile drawer toggle
  if (btnMobileNav && mobileNavDrawer) {
    btnMobileNav.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('hidden');
      const isExpanded = !mobileNavDrawer.classList.contains('hidden');
      btnMobileNav.setAttribute('aria-expanded', isExpanded);
      sfx.clickCut();
    });
  }

  // Smooth click scroll pour TOUS les liens d'ancrage du site
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      
      const targetEl = document.querySelector(targetId) || document.getElementById(targetId.substring(1));
      if (targetEl) {
        e.preventDefault();
        sfx.clickCut();
        
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Ferme le menu mobile si ouvert
        if (mobileNavDrawer && !mobileNavDrawer.classList.contains('hidden')) {
          mobileNavDrawer.classList.add('hidden');
          btnMobileNav?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // ScrollSpy dynamique : surbrillance du lien actif dans la barre de navigation
  const navSectionEls = document.querySelectorAll('section[id], section#projets');
  const navLinkEls = document.querySelectorAll('.capsule-nav-links .capsule-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 140;

    navSectionEls.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.id;
      }
    });

    if (currentId) {
      navLinkEls.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }, { passive: true });

  // Interactive 4-step 'Comment ça marche ?' Rail Progress on Hover & Scroll
  const howStepNodes = document.querySelectorAll('.how-step-node');
  const howRailProgress = document.getElementById('howRailProgress');
  howStepNodes.forEach((node, idx) => {
    node.addEventListener('mouseenter', () => {
      sfx.clickCut();
      if (howRailProgress) {
        const pct = ((idx + 1) / howStepNodes.length) * 100;
        howRailProgress.style.width = `${pct}%`;
      }
    });
  });

  // Explore 16 projects button smooth action
  const btnHeroCenterExplore = document.getElementById('btnHeroCenterExplore');
  if (btnHeroCenterExplore) {
    btnHeroCenterExplore.addEventListener('click', () => {
      sfx.clapSnap();
    });
  }

  // =========================================================================
  // 10. ORDER FORM & CLAPPERBOARD CONFIRMATION
  // =========================================================================
  const orderForm = document.getElementById('orderForm');
  const orderSuccessCard = document.getElementById('orderSuccessCard');
  const successClientName = document.getElementById('successClientName');
  const btnResetOrder = document.getElementById('btnResetOrder');

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('clientName')?.value.trim();
      
      // Sound effect
      sfx.clapSnap();

      // Show success
      orderForm.classList.add('hidden');
      if (orderSuccessCard) {
        orderSuccessCard.classList.remove('hidden');
      }
      if (successClientName) {
        successClientName.textContent = name || 'Créateur';
      }

      showToast("✓ Brief enregistré ! Clap de début de tournage.");
    });
  }

  if (btnResetOrder) {
    btnResetOrder.addEventListener('click', () => {
      orderSuccessCard?.classList.add('hidden');
      if (orderForm) {
        orderForm.classList.remove('hidden');
        orderForm.reset();
      }
    });
  }

  // Pre-fill order form when clicking pricing plan CTA
  document.querySelectorAll('.btn-plan').forEach(btn => {
    btn.addEventListener('click', () => {
      const service = btn.dataset.service;
      const radios = document.querySelectorAll('input[name="videoType"]');
      radios.forEach(r => {
        if (service === 'shorts' && r.value.includes('Shorts')) r.checked = true;
        if (service === 'youtube' && r.value.includes('YouTube')) r.checked = true;
        if (service === 'pub' && r.value.includes('Brand')) r.checked = true;
      });
    });
  });

  // Global Toast function
  window.showToast = function(msg) {
    const toast = document.getElementById('globalToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 3200);
  };

  // Launch AI from Card button
  const btnLaunchAiFromCard = document.getElementById('btnLaunchAiFromCard');
  if (btnLaunchAiFromCard) {
    btnLaunchAiFromCard.addEventListener('click', () => {
      const btnAiToggle = document.getElementById('btnAiToggle');
      if (btnAiToggle) btnAiToggle.click();
    });
  }

  // =========================================================================
  // 11. HERO 3D PERSPECTIVE ROTATING SHOWCASE (CIRCULAR 3-CARD PERSPECTIVE)
  // =========================================================================
  const showcaseStage = document.getElementById('showcaseStage3D');
  const showcaseCards = document.querySelectorAll('.showcase-card-3d');
  const showcaseDots = document.querySelectorAll('.showcase-dot');
  const btnShowcasePrev = document.getElementById('btnShowcasePrev');
  const btnShowcaseNext = document.getElementById('btnShowcaseNext');
  const heroShowcase3D = document.getElementById('heroShowcase3D');

  if (showcaseCards.length > 0) {
    let activeIndex = 0;
    const totalCards = showcaseCards.length;
    let autoRotateTimer = null;
    let isHovered = false;

    function updateShowcaseClasses() {
      showcaseCards.forEach((card, idx) => {
        card.classList.remove('slot-active', 'slot-prev', 'slot-next', 'slot-hidden');
        if (idx === activeIndex) {
          card.classList.add('slot-active');
        } else if (idx === (activeIndex - 1 + totalCards) % totalCards) {
          card.classList.add('slot-prev');
        } else if (idx === (activeIndex + 1) % totalCards) {
          card.classList.add('slot-next');
        } else {
          card.classList.add('slot-hidden');
        }
      });

      showcaseDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === activeIndex);
      });
    }

    function rotateNext() {
      activeIndex = (activeIndex + 1) % totalCards;
      updateShowcaseClasses();
    }

    function rotatePrev() {
      activeIndex = (activeIndex - 1 + totalCards) % totalCards;
      updateShowcaseClasses();
    }

    function startAutoRotate() {
      stopAutoRotate();
      autoRotateTimer = setInterval(() => {
        if (!isHovered) rotateNext();
      }, 3500);
    }

    function stopAutoRotate() {
      if (autoRotateTimer) clearInterval(autoRotateTimer);
    }

    if (btnShowcaseNext) {
      btnShowcaseNext.addEventListener('click', () => {
        sfx.clickCut();
        rotateNext();
        startAutoRotate();
      });
    }

    if (btnShowcasePrev) {
      btnShowcasePrev.addEventListener('click', () => {
        sfx.clickCut();
        rotatePrev();
        startAutoRotate();
      });
    }

    showcaseDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        sfx.clickCut();
        activeIndex = idx;
        updateShowcaseClasses();
        startAutoRotate();
      });
    });

    if (heroShowcase3D) {
      heroShowcase3D.addEventListener('mouseenter', () => { isHovered = true; });
      heroShowcase3D.addEventListener('mouseleave', () => { isHovered = false; });
    }

    // "Voir ce projet" on active card triggers lightbox
    document.querySelectorAll('.btn-showcase-view-project').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = btn.dataset.projectId || 1;
        if (typeof openProjectModal === 'function') {
          openProjectModal(pId);
        }
      });
    });

    updateShowcaseClasses();
    startAutoRotate();
  }

});
