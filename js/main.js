/* Behaviour shared by every page: mobile menu, reveal-on-scroll, footer year,
   home-page greeting and the project filter. Plain browser JavaScript, no libraries. */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');

  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.nav-toggle-label').textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Choosing a link closes the menu, so the next page starts closed.
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    // If the window grows past the mobile breakpoint, reset the menu state.
    const wide = window.matchMedia('(min-width: 640px)');
    wide.addEventListener('change', (event) => {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------- Light / dark theme toggle ---------- */

  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeButton) {
      const next = theme === 'dark' ? 'light' : 'dark';
      themeButton.setAttribute('aria-label', `Switch to ${next} mode`);
      themeButton.setAttribute('title', `Switch to ${next} mode`);
    }
  }

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const theme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(theme);
      try { localStorage.setItem('theme', theme); } catch (e) { /* storage blocked: theme lasts for this page only */ }
    });
  }

  // Follow the system setting live, until the visitor picks a theme themselves.
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  systemDark.addEventListener('change', (event) => {
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) { /* ignore */ }
    if (saved !== 'light' && saved !== 'dark') applyTheme(event.matches ? 'dark' : 'light');
  });

  /* ---------- Reveal sections as they scroll into view ---------- */

  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Footer year ---------- */

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Home-page greeting based on the time of day ---------- */

  const greeting = document.querySelector('[data-greeting]');
  if (greeting) {
    const hour = new Date().getHours();
    const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    greeting.textContent = `${part}, and welcome`;
  }

  /* ---------- Project filter (projects page only) ---------- */

  const filterGroup = document.querySelector('[data-project-filters]');

  if (filterGroup) {
    const buttons = Array.from(filterGroup.querySelectorAll('[data-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-category]'));
    const status = document.querySelector('[data-filter-status]');

    filterGroup.addEventListener('click', (event) => {
      const button = event.target.closest('[data-filter]');
      if (!button) return;

      const choice = button.dataset.filter;
      buttons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn === button)));

      let shown = 0;
      cards.forEach((card) => {
        const match = choice === 'all' || card.dataset.category === choice;
        card.hidden = !match;
        if (match) shown += 1;
      });

      if (status) {
        status.textContent = `Showing ${shown} of ${cards.length} projects.`;
      }
    });
  }
})();
