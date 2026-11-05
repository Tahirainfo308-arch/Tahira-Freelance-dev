(function () {
  'use strict';

  var header = document.getElementById('siteHead');
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  /* Header shadow on scroll */
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile navigation */
  function closeNav() {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.querySelector('.nav-toggle-label').textContent = 'Menu';
  }

  navToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.querySelector('.nav-toggle-label').textContent = open ? 'Close' : 'Menu';
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeNav);
  });

  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* Highlight the current section in the navigation */
  var navLinks = {};
  nav.querySelectorAll('a[href^="#"]').forEach(function (a) {
    navLinks[a.getAttribute('href').slice(1)] = a;
  });

  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(navLinks).forEach(function (id) {
          navLinks[id].classList.remove('is-active');
        });
        if (navLinks[entry.target.id]) navLinks[entry.target.id].classList.add('is-active');
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

    Object.keys(navLinks).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* Scroll reveal */
  var revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
  }

  /* Project filtering */
  var chips = document.querySelectorAll('.chip');
  var projects = document.querySelectorAll('.project-card');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.getAttribute('data-filter');

      chips.forEach(function (c) {
        var isOn = c === chip;
        c.classList.toggle('is-on', isOn);
        c.setAttribute('aria-pressed', String(isOn));
      });

      projects.forEach(function (project) {
        project.hidden = !(filter === 'all' || project.getAttribute('data-cat') === filter);
      });
    });
  });

  /* Client feedback: infinite marquee + lightbox */
  var feedbackTrack = document.getElementById('feedbackTrack');
  var feedbackSet = feedbackTrack ? feedbackTrack.querySelector('.feedback-set') : null;
  var feedbackCards = feedbackSet
    ? Array.prototype.slice.call(feedbackSet.querySelectorAll('.feedback-card'))
    : [];
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxPrev = document.getElementById('lightboxPrev');
  var lightboxNext = document.getElementById('lightboxNext');
  var currentIndex = 0;
  var lastFocused = null;

  if (feedbackSet && feedbackTrack) {
    var feedbackClone = feedbackSet.cloneNode(true);
    feedbackClone.classList.add('feedback-set-clone');
    feedbackClone.setAttribute('aria-hidden', 'true');
    feedbackClone.querySelectorAll('button').forEach(function (button) {
      button.setAttribute('tabindex', '-1');
    });
    feedbackTrack.appendChild(feedbackClone);
    feedbackTrack.classList.add('is-running');
  }

  function openLightbox(index) {
    if (!feedbackCards.length) return;
    currentIndex = (index + feedbackCards.length) % feedbackCards.length;
    var card = feedbackCards[currentIndex];
    var image = card.querySelector('img');
    lightboxImg.src = card.getAttribute('data-full');
    lightboxImg.alt = image ? image.alt : 'Client feedback screenshot';
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    lightboxImg.removeAttribute('src');
    if (lastFocused) lastFocused.focus();
  }

  if (feedbackTrack && feedbackCards.length) {
    feedbackTrack.addEventListener('click', function (e) {
      var card = e.target.closest('.feedback-card');
      if (!card) return;
      var index = Array.prototype.indexOf.call(card.parentElement.children, card);
      if (index < 0 || index >= feedbackCards.length) return;
      lastFocused = card;
      openLightbox(index);
    });
  }

  if (lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', function () { openLightbox(currentIndex - 1); });
    lightboxNext.addEventListener('click', function () { openLightbox(currentIndex + 1); });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
    });
  }

  /* Contact form: sends through Formspree */
  var form = document.getElementById('contactForm');
  var msg = document.getElementById('formMsg');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitLabel = submitBtn.innerHTML;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('cName');
    var email = document.getElementById('cEmail');
    var text = document.getElementById('cMsg');
    var valid = true;

    [name, email, text].forEach(function (field) {
      field.removeAttribute('aria-invalid');
    });

    if (!name.value.trim()) { name.setAttribute('aria-invalid', 'true'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { email.setAttribute('aria-invalid', 'true'); valid = false; }
    if (!text.value.trim()) { text.setAttribute('aria-invalid', 'true'); valid = false; }

    if (!valid) {
      msg.className = 'form-msg err';
      msg.textContent = 'Please add your name, a valid email and a message.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    msg.className = 'form-msg';
    msg.textContent = 'Sending your message...';

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (response) {
        if (response.ok) return null;
        return response.json().catch(function () { return {}; }).then(function (data) {
          var detail = data && data.errors
            ? data.errors.map(function (item) { return item.message; }).join(', ')
            : 'Please try again.';
          throw new Error(detail);
        });
      })
      .then(function () {
        form.reset();
        msg.className = 'form-msg ok';
        msg.textContent = 'Thanks! Your message has been sent — I will reply soon.';
      })
      .catch(function (error) {
        msg.className = 'form-msg err';
        msg.textContent = (error && error.message ? 'Could not send: ' + error.message + ' ' : 'Something went wrong. ') +
          'You can also email tahirashafique135@gmail.com.';
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitLabel;
      });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
