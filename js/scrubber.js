/**
 * AXEL V. // NLE PROJECT SCRUBBER
 * Interactive mouse-scrubbing engine for project video thumbnails with dynamic frame simulation & timecodes
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const mediaWraps = document.querySelectorAll('.card-media-wrap');

  mediaWraps.forEach((wrap, index) => {
    const progressBar = wrap.querySelector('.card-scrub-progress');
    const tcBadge = wrap.querySelector('.card-scrub-tc');
    const img = wrap.querySelector('.card-img');

    // Base duration in frames (ex: 20s at 60fps = 1200 frames)
    const baseSeconds = [22, 14, 45, 8][index % 4] || 20;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const scrubPercent = Math.min(100, Math.max(0, (x / rect.width) * 100));

      // Update scrub bar width
      if (progressBar) {
        progressBar.style.width = `${scrubPercent}%`;
      }

      // Calculate simulated frame & timecode
      const currentSeconds = (scrubPercent / 100) * baseSeconds;
      const s = Math.floor(currentSeconds);
      const frames = Math.floor((currentSeconds - s) * 60);
      const pad = (n) => String(n).padStart(2, '0');

      if (tcBadge) {
        tcBadge.textContent = `00:00:${pad(s)}:${pad(frames)}`;
      }

      // Micro frame-stepping visual effect (light brightness flash / subtle zoom)
      if (img) {
        const step = Math.floor(scrubPercent / 8) % 2;
        img.style.filter = step === 0 ? 'brightness(1.05) contrast(1.08)' : 'brightness(0.98) contrast(1.02)';
        img.style.transform = `scale(${1.03 + (scrubPercent / 100) * 0.04})`;
      }
    });

    wrap.addEventListener('mouseleave', () => {
      if (progressBar) progressBar.style.width = '0%';
      if (img) {
        img.style.filter = '';
        img.style.transform = '';
      }
    });
  });
});
