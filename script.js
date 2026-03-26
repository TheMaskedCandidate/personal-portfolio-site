/**
 * Portfolio script — typewriter, smooth scroll, project filters, reveal animations.
 * Respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Typewriter + rotating roles (home page only) -----
  var rolesEl = document.getElementById('typewriter-text');
  var cursorEl = document.getElementById('typewriter-cursor');
  var roles = ['Data Engineer', 'GIS Analyst', 'Sustainability Advocate'];
  var typewriterSpeed = 80;
  var deleteSpeed = 50;
  var pauseAfterType = 1500;
  var pauseAfterDelete = 600;
  var pauseBetweenRoles = 1200;

  function typeWriter(indexRole, indexChar, isDeleting) {
    if (prefersReducedMotion && rolesEl) {
      rolesEl.textContent = roles[0];
      if (cursorEl) cursorEl.style.display = 'none';
      return;
    }
    if (!rolesEl || !roles[indexRole]) return;

    var current = roles[indexRole];
    if (isDeleting) {
      rolesEl.textContent = current.slice(0, indexChar);
      if (indexChar === 0) {
        var nextRole = (indexRole + 1) % roles.length;
        setTimeout(function () {
          typeWriter(nextRole, 0, false);
        }, pauseBetweenRoles);
        return;
      }
      setTimeout(function () {
        typeWriter(indexRole, indexChar - 1, true);
      }, deleteSpeed);
      return;
    }

    if (indexChar <= current.length) {
      rolesEl.textContent = current.slice(0, indexChar);
      if (indexChar === current.length) {
        setTimeout(function () {
          typeWriter(indexRole, indexChar, true);
        }, pauseAfterType);
        return;
      }
      setTimeout(function () {
        typeWriter(indexRole, indexChar + 1, false);
      }, typewriterSpeed);
    }
  }

  if (rolesEl) {
    if (prefersReducedMotion) {
      rolesEl.textContent = roles[0];
      if (cursorEl) cursorEl.style.display = 'none';
    } else {
      typeWriter(0, 0, false);
    }
  }

  // ----- Smooth scroll for #contact (when already on index) -----
  document.querySelectorAll('a[href="#contact"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.getElementById('contact');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  // ----- Projects page: filter pills -----
  var filterButtons = document.querySelectorAll('.filter-pill');
  var projectCards = document.querySelectorAll('.projects-grid .project-card');

  function filterProjects(category) {
    projectCards.forEach(function (card) {
      var cardCategory = card.getAttribute('data-category');
      var show = category === 'all' || cardCategory === category;
      card.setAttribute('data-hidden', show ? 'false' : 'true');
    });
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.getAttribute('data-filter');
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      filterProjects(filter);
    });
  });

  // ----- Reveal on scroll (IntersectionObserver) -----
  if (!prefersReducedMotion) {
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            }
          });
        },
        { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
      );
      revealEls.forEach(function (el) {
        observer.observe(el);
      });
    }
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  // ----- Contact form: allow mailto submit -----
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    // If the form uses mailto, let the browser open the email client.
    // If you later switch back to a real backend endpoint, add validation/submit handling here.
    var action = (contactForm.getAttribute('action') || '').toLowerCase();
    if (action === '#' || action === '') {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
      });
    }
  }

  // ----- Beyond page: reusable carousels -----
  // Markup expected:
  // .carousel[data-carousel]
  //  - .carousel-viewport > .carousel-track > .carousel-slide (each contains an <img>)
  //  - .carousel-btn--prev, .carousel-btn--next
  //  - .carousel-dots (empty; populated by JS)
  var carousels = document.querySelectorAll('[data-carousel]');

  function initCarousel(root) {
    var track = root.querySelector('.carousel-track');
    var slides = root.querySelectorAll('.carousel-slide');
    var prevBtn = root.querySelector('.carousel-btn--prev');
    var nextBtn = root.querySelector('.carousel-btn--next');
    var dotsWrap = root.querySelector('.carousel-dots');

    if (!track || !slides.length) return;

    var index = 0;
    var timer = null;
    var intervalMs = 4200;
    var pauseOnHover = true;

    function setTrackPosition(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';

      if (dotsWrap) {
        var dots = dotsWrap.querySelectorAll('.carousel-dot');
        dots.forEach(function (dot, dotIndex) {
          dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
        });
      }
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach(function (_slide, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', 'Go to image ' + (i + 1));
        dot.setAttribute('aria-current', i === index ? 'true' : 'false');
        dot.addEventListener('click', function () {
          stopAuto();
          setTrackPosition(i);
          startAuto();
        });
        dotsWrap.appendChild(dot);
      });
    }

    function next() { setTrackPosition(index + 1); }
    function prev() { setTrackPosition(index - 1); }

    function startAuto() {
      if (prefersReducedMotion) return;
      stopAuto();
      timer = window.setInterval(function () {
        next();
      }, intervalMs);
    }

    function stopAuto() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        stopAuto();
        prev();
        startAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        stopAuto();
        next();
        startAuto();
      });
    }

    if (!prefersReducedMotion && pauseOnHover) {
      root.addEventListener('mouseenter', stopAuto);
      root.addEventListener('mouseleave', startAuto);
      // also pause if user tabs into controls
      root.addEventListener('focusin', stopAuto);
      root.addEventListener('focusout', startAuto);
    }

    buildDots();
    setTrackPosition(0);
    startAuto();
  }

  carousels.forEach(initCarousel);

  // ----- Certificate lightbox (index cert section) -----
  var certTriggers = document.querySelectorAll('.cert-image-trigger');
  var certModal = document.getElementById('certificate-modal');
  var certModalImage = document.getElementById('cert-modal-image');
  var certModalClose = document.getElementById('cert-modal-close');
  var certModalBackdrop = certModal ? certModal.querySelector('.cert-modal-backdrop') : null;
  var certCloseTimer = null;
  var certAnimationDuration = prefersReducedMotion ? 0 : 250;

  function openCertModal(src, alt) {
    if (!certModal || !certModalImage) return;
    certModalImage.src = src;
    certModalImage.alt = alt || '';
    certModal.classList.remove('is-closing');
    certModal.classList.add('is-open');
    certModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (certModalClose) certModalClose.focus();
  }

  function closeCertModal() {
    if (!certModal || certModal.getAttribute('aria-hidden') === 'true') return;
    certModal.classList.remove('is-open');
    certModal.classList.add('is-closing');
    certModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.clearTimeout(certCloseTimer);
    certCloseTimer = window.setTimeout(function () {
      certModal.classList.remove('is-closing');
      if (certModalImage) {
        certModalImage.src = '';
        certModalImage.alt = '';
      }
    }, certAnimationDuration);
  }

  certTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openCertModal(trigger.getAttribute('src'), trigger.getAttribute('alt'));
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCertModal(trigger.getAttribute('src'), trigger.getAttribute('alt'));
      }
    });
  });

  if (certModalClose) {
    certModalClose.addEventListener('click', closeCertModal);
  }

  if (certModalBackdrop) {
    certModalBackdrop.addEventListener('click', closeCertModal);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeCertModal();
    }
  });

  // ----- Footer year -----
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
