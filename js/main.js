(function () {
  'use strict';

  /* ── Scroll progress bar ── */
  var prog = document.getElementById('scroll-progress');
  if (prog) {
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (total > 0 ? (scrolled / total * 100) : 0) + '%';
    }, { passive: true });
  }

  /* ── Custom cursor (pointer devices only) ── */
  if (window.matchMedia('(pointer: fine)').matches) {
    var dot  = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    if (dot && ring) {
      var mx = -100, my = -100, rx = -100, ry = -100;
      var rafId;

      document.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top  = my + 'px';
      });

      function tickRing() {
        rx += (mx - rx) * 0.30;
        ry += (my - ry) * 0.30;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        rafId = requestAnimationFrame(tickRing);
      }
      tickRing();

      document.addEventListener('mouseleave', function () {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
      });
      document.addEventListener('mouseenter', function () {
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
      });

      var hoverEls = document.querySelectorAll('a, button, label, [role="button"]');
      hoverEls.forEach(function (el) {
        el.addEventListener('mouseenter', function () { document.body.classList.add('cursor-hover'); });
        el.addEventListener('mouseleave', function () { document.body.classList.remove('cursor-hover'); });
      });
    }
  }

  /* ── Nav open: toggle body class for CSS (transparent header, white X) ── */
  var navToggleEl = document.getElementById('nav-toggle');
  if (navToggleEl) {
    navToggleEl.addEventListener('change', function () {
      document.body.classList.toggle('nav-is-open', this.checked);
    });
    // close nav when clicking outside (pressing Escape)
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggleEl.checked) {
        navToggleEl.checked = false;
        document.body.classList.remove('nav-is-open');
      }
    });
  }

  /* ── Parallax on editorial photo sections (desktop only) ── */
  var parallaxEls = document.querySelectorAll('.editorial-item__photo');
  if (parallaxEls.length > 0 && window.innerWidth > 768) {
    function updateParallax() {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        var progress = 1 - (rect.top + rect.height / 2) / (vh / 2 + rect.height / 2);
        var offset = progress * 20;
        el.style.backgroundPositionY = 'calc(center + ' + offset + 'px)';
      });
    }
    window.addEventListener('scroll', updateParallax, { passive: true });
    updateParallax();
  }

  /* ── Scroll-reveal (IntersectionObserver) ── */
  var fadeEls = document.querySelectorAll('.anim-fade-up');
  if (fadeEls.length > 0) {
    if (!('IntersectionObserver' in window)) {
      fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.10 });
      fadeEls.forEach(function (el) { io.observe(el); });
    }
  }


  /* ── Gallery lightbox ── */
  var lbOverlay = document.createElement('div');
  lbOverlay.className = 'lightbox-overlay';
  lbOverlay.setAttribute('role', 'dialog');
  lbOverlay.setAttribute('aria-modal', 'true');
  lbOverlay.innerHTML =
    '<button class="lightbox-overlay__close" aria-label="閉じる">&#215;</button>' +
    '<button class="lightbox-overlay__prev" aria-label="前の写真">&#8592;</button>' +
    '<img class="lightbox-overlay__img" src="" alt="">' +
    '<button class="lightbox-overlay__next" aria-label="次の写真">&#8594;</button>' +
    '<span class="lightbox-overlay__counter"></span>';
  document.body.appendChild(lbOverlay);

  var lbImg     = lbOverlay.querySelector('.lightbox-overlay__img');
  var lbClose   = lbOverlay.querySelector('.lightbox-overlay__close');
  var lbPrev    = lbOverlay.querySelector('.lightbox-overlay__prev');
  var lbNext    = lbOverlay.querySelector('.lightbox-overlay__next');
  var lbCounter = lbOverlay.querySelector('.lightbox-overlay__counter');
  var lbItems = [];
  var lbIndex = 0;

  function lbShow(index) {
    lbIndex = index;
    var img = lbItems[index].querySelector('img');
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lbCounter.textContent = (index + 1) + ' / ' + lbItems.length;
    lbPrev.classList.toggle('is-hidden', index === 0);
    lbNext.classList.toggle('is-hidden', index === lbItems.length - 1);
  }

  function lbOpen(items, index) {
    lbItems = items;
    lbOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lbShow(index);
  }

  function lbShut() {
    lbOverlay.classList.remove('is-open');
    document.body.style.overflow = '';
    lbImg.src = '';
    lbItems = [];
  }

  lbClose.addEventListener('click', lbShut);
  lbOverlay.addEventListener('click', function (e) { if (e.target === lbOverlay) lbShut(); });
  lbPrev.addEventListener('click', function (e) { e.stopPropagation(); if (lbIndex > 0) lbShow(lbIndex - 1); });
  lbNext.addEventListener('click', function (e) { e.stopPropagation(); if (lbIndex < lbItems.length - 1) lbShow(lbIndex + 1); });
  document.addEventListener('keydown', function (e) {
    if (!lbOverlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') lbShut();
    if (e.key === 'ArrowLeft'  && lbIndex > 0) lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight' && lbIndex < lbItems.length - 1) lbShow(lbIndex + 1);
  });

  document.querySelectorAll('.work-gallery__grid').forEach(function (grid) {
    var items = Array.from(grid.querySelectorAll('.work-gallery__item'));
    items.forEach(function (item, i) {
      item.style.cursor = 'zoom-in';
      item.addEventListener('click', function () { lbOpen(items, i); });
    });
  });

})();
