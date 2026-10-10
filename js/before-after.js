/**
 * AXEL V. // COLOR GRADING LABORATORY
 * Interactive Split-Screen Slider: Raw LOG vs Master Grade with LUT Preset Switcher & Real-time Scopes
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const splitSliderBox = document.getElementById('splitSliderBox');
  const layerBefore = document.getElementById('layerBefore');
  const sliderHandle = document.getElementById('sliderHandle');
  const imgGraded = document.getElementById('imgGraded');
  const lutBtns = document.querySelectorAll('.lut-btn');

  const scopeRed = document.querySelector('.scope-ch.red');
  const scopeGreen = document.querySelector('.scope-ch.green');
  const scopeBlue = document.querySelector('.scope-ch.blue');

  if (!splitSliderBox || !layerBefore || !sliderHandle) return;

  let isDragging = false;
  let sliderPos = 50; // percentage

  function setSliderPosition(percent) {
    sliderPos = Math.min(100, Math.max(0, percent));
    layerBefore.style.width = `${sliderPos}%`;
    sliderHandle.style.left = `${sliderPos}%`;

    // Dynamic RGB parade reaction according to position (Log has compressed range, Graded has expanded range)
    if (scopeRed && scopeGreen && scopeBlue) {
      const dynamicMultiplier = 0.5 + (sliderPos / 100) * 0.5;
      const rH = Math.min(16, Math.max(6, Math.sin(Date.now() * 0.005) * 4 + 10 * dynamicMultiplier));
      const gH = Math.min(16, Math.max(4, Math.cos(Date.now() * 0.004) * 3 + 8 * dynamicMultiplier));
      const bH = Math.min(16, Math.max(5, Math.sin(Date.now() * 0.003) * 5 + 12 * dynamicMultiplier));
      scopeRed.style.height = `${rH}px`;
      scopeGreen.style.height = `${gH}px`;
      scopeBlue.style.height = `${bH}px`;
    }
  }

  function handleMove(clientX) {
    const rect = splitSliderBox.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percent = (offsetX / rect.width) * 100;
    setSliderPosition(percent);
  }

  // Mouse Events
  splitSliderBox.addEventListener('mousedown', (e) => {
    isDragging = true;
    handleMove(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Events (Mobile Support)
  splitSliderBox.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    handleMove(e.touches[0].clientX);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // LUT Preset Switcher
  lutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      lutBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const lut = btn.dataset.lut;
      if (!imgGraded) return;

      // Remove previous LUT classes
      imgGraded.classList.remove('lut-teal-orange', 'lut-cyber-noir', 'lut-moody-film');

      if (lut === 'teal-orange') {
        imgGraded.classList.add('lut-teal-orange');
      } else if (lut === 'cyber-noir') {
        imgGraded.classList.add('lut-cyber-noir');
      } else if (lut === 'moody-film') {
        imgGraded.classList.add('lut-moody-film');
      }

      if (window.showToast) {
        window.showToast(`LUT activée : ${btn.textContent}`);
      }
    });
  });

  // Initialize position at 50%
  setSliderPosition(50);
});
