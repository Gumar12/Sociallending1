/**
 * shared.js — навигация между главами курса «Современный секуляризм»
 * Подключается в каждой HTML-странице через <script src="shared.js"></script>
 *
 * Что делает:
 *  1. Инжектирует унифицированную плавающую навигацию по главам
 *  2. Подсвечивает активную главу на основе текущего URL
 *  3. Обновляет все ссылки «Предыдущая / Следующая» на реальные href
 *  4. Обновляет breadcrumb-ссылки (Главная, Цикл)
 *  5. Обновляет карточки глав на index.html
 */

const PAGES = [
  { id: 'index',    file: 'index.html',    label: 'Обзор',    short: '↩',  num: null },
  { id: 'chapter1', file: 'chapter1.html', label: 'Глава 1',  short: '01', num: 1 },
  { id: 'chapter2', file: 'chapter2.html', label: 'Глава 2',  short: '02', num: 2 },
  { id: 'chapter3', file: 'chapter3.html', label: 'Глава 3',  short: '03', num: 3 },
  { id: 'chapter4', file: 'chapter4.html', label: 'Глава 4',  short: '04', num: 4 },
  { id: 'chapter5', file: 'chapter5.html', label: 'Глава 5',  short: '05', num: 5 },
];

const CHAPTERS = PAGES.filter(p => p.num !== null);

// ─── Определяем текущую страницу ───────────────────────────────────────────
function getCurrentPage() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  return PAGES.find(p => p.file === path) || PAGES[0];
}

// ─── Inject глобальная шапка-навигация ─────────────────────────────────────
function injectGlobalNav() {
  const current = getCurrentPage();

  const style = document.createElement('style');
  style.textContent = `
    #si-nav {
      position: fixed;
      bottom: 28px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(26, 42, 68, 0.92);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 9999px;
      padding: 8px 14px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.30);
      font-family: 'Inter', 'Public Sans', sans-serif;
    }
    #si-nav a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: rgba(255,255,255,0.55);
      text-decoration: none;
      transition: all 0.2s ease;
    }
    #si-nav a:hover {
      background: rgba(255,255,255,0.12);
      color: #fff;
    }
    #si-nav a.si-active {
      background: #C06C50;
      color: #fff;
      box-shadow: 0 0 12px rgba(192,108,80,0.5);
    }
    #si-nav .si-home {
      font-size: 16px;
    }
    #si-nav .si-divider {
      width: 1px;
      height: 20px;
      background: rgba(255,255,255,0.15);
      margin: 0 4px;
      flex-shrink: 0;
    }
    #si-nav .si-arrow {
      width: 32px;
      height: 32px;
      font-size: 18px;
    }
    #si-nav .si-arrow.si-disabled {
      opacity: 0.2;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);

  // Prev / Next
  const currentIdx = CHAPTERS.findIndex(p => p.id === current.id);
  const prev = currentIdx > 0 ? CHAPTERS[currentIdx - 1] : null;
  const next = currentIdx >= 0 && currentIdx < CHAPTERS.length - 1 ? CHAPTERS[currentIdx + 1] : null;

  const nav = document.createElement('nav');
  nav.id = 'si-nav';
  nav.setAttribute('aria-label', 'Chapter navigation');

  // ← prev arrow
  const prevEl = document.createElement('a');
  prevEl.href = prev ? prev.file : '#';
  prevEl.className = 'si-arrow' + (prev ? '' : ' si-disabled');
  prevEl.title = prev ? prev.label : '';
  prevEl.innerHTML = '←';
  nav.appendChild(prevEl);

  const div1 = document.createElement('span');
  div1.className = 'si-divider';
  nav.appendChild(div1);

  // Home
  const homeEl = document.createElement('a');
  homeEl.href = 'index.html';
  homeEl.className = 'si-home' + (current.id === 'index' ? ' si-active' : '');
  homeEl.title = 'Оглавление';
  homeEl.innerHTML = '⌂';
  nav.appendChild(homeEl);

  const div2 = document.createElement('span');
  div2.className = 'si-divider';
  nav.appendChild(div2);

  // Chapter pills
  CHAPTERS.forEach(ch => {
    const a = document.createElement('a');
    a.href = ch.file;
    a.className = current.id === ch.id ? 'si-active' : '';
    a.title = ch.label;
    a.textContent = ch.short;
    nav.appendChild(a);
  });

  const div3 = document.createElement('span');
  div3.className = 'si-divider';
  nav.appendChild(div3);

  // → next arrow
  const nextEl = document.createElement('a');
  nextEl.href = next ? next.file : '#';
  nextEl.className = 'si-arrow' + (next ? '' : ' si-disabled');
  nextEl.title = next ? next.label : '';
  nextEl.innerHTML = '→';
  nav.appendChild(nextEl);

  document.body.appendChild(nav);
}

// ─── Обновляем breadcrumbs ──────────────────────────────────────────────────
function patchBreadcrumbs() {
  document.querySelectorAll('a').forEach(a => {
    const text = a.textContent.trim();
    const href = a.getAttribute('href');
    if (href !== '#') return;

    if (text === 'Home' || text === 'Главная') {
      a.href = 'index.html';
    }
    if (text === 'Цикл: Современный секуляризм' || text.includes('секуляризм')) {
      a.href = 'index.html';
    }
  });
}

// ─── Обновляем Previous/Next блоки в футере глав ───────────────────────────
function patchChapterNavLinks() {
  const current = getCurrentPage();
  const currentIdx = CHAPTERS.findIndex(p => p.id === current.id);
  const prev = currentIdx > 0 ? CHAPTERS[currentIdx - 1] : null;
  const next = currentIdx < CHAPTERS.length - 1 ? CHAPTERS[currentIdx + 1] : null;

  document.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') !== '#') return;
    const text = a.innerText || a.textContent;

    // Previous pattern
    if (/previous|предыдущ|вернуться|назад|глава\s*[12]/i.test(text) && prev) {
      a.href = prev.file;
    }
    // Next pattern
    if (/next|следующ|глава\s*[2345]/i.test(text) && next) {
      a.href = next.file;
    }
  });

  // chapter1: footer nav cards (Previous = index, Next = chapter2)
  document.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') !== '#') return;
    const prevSpan = a.querySelector('span.text-primary, .text-primary');
    if (!prevSpan) return;
    const label = prevSpan.textContent.trim().toLowerCase();
    if ((label === 'previous' || label === 'предыдущая') && prev) {
      a.href = prev.file;
    }
    if ((label === 'next' || label === 'следующая') && next) {
      a.href = next.file;
    }
  });
}

// ─── Обновляем карточки на index.html ──────────────────────────────────────
function patchIndexCards() {
  if (getCurrentPage().id !== 'index') return;

  const cards = document.querySelectorAll('.hover-card');
  cards.forEach((card, i) => {
    if (CHAPTERS[i]) {
      card.addEventListener('click', () => {
        window.location.href = CHAPTERS[i].file;
      });
    }
  });

  // "Читать введение целиком" button → chapter1
  document.querySelectorAll('button').forEach(btn => {
    if (/читать|введение|read/i.test(btn.textContent)) {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => {
        window.location.href = 'chapter1.html';
      });
    }
  });
}

// ─── Обновляем chapter5 nav по главам ──────────────────────────────────────
function patchChapter5Nav() {
  if (getCurrentPage().id !== 'chapter5') return;
  document.querySelectorAll('nav a').forEach(a => {
    const text = a.textContent.trim();
    CHAPTERS.forEach(ch => {
      if (text === ch.label) a.href = ch.file;
    });
  });
}

// ─── Обновляем chapter2 breadcrumb + nav ──────────────────────────────────
function patchChapter2Nav() {
  if (getCurrentPage().id !== 'chapter2') return;
  document.querySelectorAll('nav a').forEach(a => {
    const text = a.textContent.trim();
    if (text === 'Курс') a.href = 'index.html';
  });
}

// ─── Ссылки «Перейти к главе» на chapter4 ─────────────────────────────────
function patchChapter4Links() {
  if (getCurrentPage().id !== 'chapter4') return;
  const navCards = document.querySelectorAll('section:last-of-type a[href="#"]');
  navCards.forEach((a, i) => {
    if (i === 0) a.href = 'chapter2.html';
    if (i === 1) a.href = 'chapter3.html';
  });
}

// ─── Запуск ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectGlobalNav();
  patchBreadcrumbs();
  patchChapterNavLinks();
  patchIndexCards();
  patchChapter5Nav();
  patchChapter2Nav();
  patchChapter4Links();
});
