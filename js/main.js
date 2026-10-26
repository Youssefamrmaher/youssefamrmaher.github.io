// Portfolio content
// Selected work — optional per project: summary, cover (image path), href (case study page).
const projects = [
  {
    name: 'Nama',
    tag: 'UX case study · Mobile app',
    summary: 'A micro-investing & saving app concept that helps young professionals in Egypt build consistent saving habits — and ease into investing.',
    cover: 'assets/projects/nama/1.png',
    href: 'nama.html'
  },
  {
    name: 'My Road',
    tag: 'UX/UI case study · Mobile app',
    summary: 'An automotive social ecosystem: one place to share the drive, discover cars, join real-world events and keep every conversation moving.',
    cover: 'assets/projects/my-road/1.png',
    href: 'my-road.html'
  },
  {
    name: 'A Simple Design System',
    tag: 'Design system · Figma',
    summary: 'One small set of color, type and shape rules, built so every screen made from it looks like it belongs to the same product.',
    cover: 'assets/projects/design-system/1.webp',
    href: 'design-system.html'
  }
];

// Playground — no case study page; clicking opens the images in the full-screen viewer.
const experiments = [
  {
    name: 'LeafLux',
    tag: 'Plant shop concept · Mobile app',
    summary: 'A plant shop design concept — “Elevate your space with nature’s elegance.” Browse by space, view plant details and check out in a few taps.',
    cover: 'assets/projects/leaflux/1.png',
    slides: [
      { src: 'assets/projects/leaflux/1.png', caption: 'Cover', alt: 'LeafLux — a plant shop design concept: “Elevate your space with nature’s elegance.”' },
      { src: 'assets/projects/leaflux/2.png', caption: 'Key screens', alt: 'Three LeafLux screens: home with a summer special and categories, plant details, and cart with payment method.' },
      { src: 'assets/projects/leaflux/5.png', caption: 'Home & browse', alt: 'LeafLux home screen: search, a summer special banner, category chips (indoor, outdoor, balcony, roof, garden) and plant cards with add to cart.' },
      { src: 'assets/projects/leaflux/3.png', caption: 'Plant details', alt: 'LeafLux plant detail screen with description, photo gallery, price and add to cart.' },
      { src: 'assets/projects/leaflux/4.png', caption: 'Cart & checkout', alt: 'LeafLux cart screen with quantity controls, payment method (cash or card), fees, total and check out.' }
    ]
  }
];

// Scroll reveal: elements slide in from the left with a fade the first time they enter the viewport.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealObserver = !reduceMotion && 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
  : null;

function reveal(el, delay = 0) {
  if (!revealObserver) return;
  el.classList.add('reveal');
  el.style.setProperty('--reveal-delay', `${delay}ms`);
  // Drop the stagger delay once revealed so hover transitions stay instant
  el.addEventListener('transitionend', () => el.style.setProperty('--reveal-delay', '0ms'), { once: true });
  revealObserver.observe(el);
}

// Siblings in a grid get a small stagger
const revealGroup = (els) => [...els].forEach((el, i) => reveal(el, Math.min(i, 5) * 80));

// Full-screen image viewer, shared by case study pages and the Playground.
// openViewer(items, index, returnFocus) — items: [{ src, alt, caption }];
// returnFocus(index) gives the element to focus when the viewer closes.
const openViewer = (() => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return null;

  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbCaption = lightbox.querySelector('.lb-caption');
  const lbCounter = lightbox.querySelector('.lb-counter');
  const prevBtn = lightbox.querySelector('.lb-prev');
  const nextBtn = lightbox.querySelector('.lb-next');
  let items = [];
  let index = 0;
  let returnFocus = null;

  function show(i) {
    if (i < 0 || i >= items.length) return;
    index = i;
    lbImg.src = items[i].src;
    lbImg.alt = items[i].alt || '';
    lbCaption.textContent = items[i].caption || '';
    lbCounter.textContent = `${i + 1} / ${items.length}`;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === items.length - 1;
    // A focused button that becomes disabled drops focus out of the viewer — hand it to the other arrow
    if (document.activeElement?.disabled) (prevBtn.disabled ? nextBtn : prevBtn).focus();
    if (!reduceMotion) lbImg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: 'ease-in-out' });
    // Preload neighbours so arrowing feels instant
    [i - 1, i + 1].forEach((j) => { if (items[j]) new Image().src = items[j].src; });
  }

  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));
  lightbox.querySelector('.lb-close').addEventListener('click', () => lightbox.close());

  document.addEventListener('keydown', (e) => {
    if (!lightbox.open) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  // Clicking the dark area around the image closes the viewer
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-stage')) lightbox.close();
  });

  // Swipe left/right on touch screens
  let touchX = null;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  // Return focus to where the viewer was opened from (Esc also lands here)
  lightbox.addEventListener('close', () => {
    document.documentElement.classList.remove('is-locked');
    returnFocus?.(index)?.focus();
  });

  return (newItems, i = 0, focusFn = null) => {
    items = newItems;
    returnFocus = focusFn;
    show(i);
    lightbox.showModal();
    document.documentElement.classList.add('is-locked');
  };
})();

// Featured tile + grid of the rest.
// Default: clicking a grid card swaps it into the featured spot.
// openInViewer: clicking the featured card or any grid card opens that project's slides full screen.
function setupGallery(panel, items, { square, mediaLabel, openInViewer = false }) {
  let current = 0;
  const media = panel.querySelector('[data-feature-media]');
  const tag = panel.querySelector('[data-feature-tag]');
  const name = panel.querySelector('[data-feature-name]');
  const summary = panel.querySelector('[data-feature-summary]');
  const link = panel.querySelector('[data-feature-link]');
  const grid = panel.querySelector('[data-thumbs]');

  if (openInViewer && openViewer) {
    panel.querySelectorAll('[data-feature-open]').forEach((el) => {
      el.addEventListener('click', () => openViewer(items[current].slides, 0, () => el));
    });
  }

  function render() {
    const feat = items[current];
    if (feat.cover) {
      const img = document.createElement('img');
      img.src = feat.cover;
      img.alt = `${feat.name} — cover`;
      media.replaceChildren(img);
    } else {
      media.textContent = mediaLabel(feat);
    }
    media.classList.toggle('has-image', Boolean(feat.cover));
    tag.textContent = feat.tag;
    name.textContent = feat.name;
    if (openInViewer) name.setAttribute('aria-label', `View ${feat.name} images full screen`);
    if (summary) summary.textContent = feat.summary || '';
    if (link) link.href = feat.href || '#work';

    grid.replaceChildren(...items.map((item, i) => {
      if (i === current) return null;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb glass' + (square ? ' thumb--square' : '');
      btn.setAttribute('aria-label', openInViewer ? `View ${item.name} full screen` : `Show ${item.name}`);
      if (!square || item.cover) {
        const m = document.createElement('span');
        m.className = 'thumb-media';
        if (item.cover) {
          m.classList.add('has-image');
          m.style.backgroundImage = `url("${item.cover}")`;
        }
        btn.append(m);
      }
      const t = document.createElement('span');
      t.className = 'thumb-tag glass';
      // Real projects show their name; placeholder experiments show their tag
      t.textContent = item.cover ? item.name : item.tag;
      btn.append(t);
      btn.addEventListener('click', () => {
        if (openInViewer && openViewer && item.slides) {
          openViewer(item.slides, 0, () => btn);
          return;
        }
        current = i;
        render();
        panel.querySelector('.feature').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      return btn;
    }).filter(Boolean));
    revealGroup(grid.children);
  }

  render();
}

// The galleries only exist on the home page (main.js is shared with case study pages)
if (document.getElementById('panel-work')) {
  setupGallery(document.getElementById('panel-work'), projects, {
    square: false,
    mediaLabel: (p) => `${p.name} — cover`
  });
  setupGallery(document.getElementById('panel-play'), experiments, {
    square: true,
    mediaLabel: (e) => `${e.name} — live demo`,
    openInViewer: true
  });
}

// Case study pages: wrap each slide image in a real button that opens the viewer at that slide
const slides = [...document.querySelectorAll('.slide')];
if (slides.length && openViewer) {
  const slideItems = slides.map((fig) => {
    const img = fig.querySelector('img');
    return { src: img.src, alt: img.alt, caption: fig.querySelector('figcaption')?.textContent || '' };
  });
  const openers = slides.map((fig, i) => {
    const img = fig.querySelector('img');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'slide-open';
    btn.setAttribute('aria-label', `View “${slideItems[i].caption}” full screen`);
    img.replaceWith(btn);
    btn.append(img);
    // On close, focus the slide that was last viewed
    btn.addEventListener('click', () => openViewer(slideItems, i, (last) => openers[last]));
    return btn;
  });
}

['.nav-bar', '.hero', '.section-head', '.feature', '.slide', '.footer-inner']
  .forEach((sel) => document.querySelectorAll(sel).forEach((el) => reveal(el)));
document.querySelectorAll('.bento').forEach((grid) => revealGroup(grid.children));

// Accessible tabs (click + arrow keys)
const tabs = [...document.querySelectorAll('[role="tab"]')];

function selectTab(tab) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
  });
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// Show the floating back-to-top button once the user scrolls past the hero
const toTop = document.querySelector('.to-top');
const onScroll = () => toTop.classList.toggle('is-visible', window.scrollY > 400);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

document.getElementById('year').textContent = new Date().getFullYear();
