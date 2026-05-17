(function () {
  if (window.__hpStickyInit) return;
  window.__hpStickyInit = true;

  function init() {
    var bar = document.querySelector('[data-hp-sticky]');
    var cta = document.querySelector('[data-hero-cta]');
    if (!bar) return;
    if (!cta) {
      // No hero CTA on this page — show the bar after a short delay so users on
      // PDP / cart / etc. can still use it.
      bar.classList.add('is-visible');
      bar.removeAttribute('aria-hidden');
      bar.removeAttribute('inert');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var visible = !entries[0].isIntersecting;
      bar.classList.toggle('is-visible', visible);
      if (visible) {
        bar.removeAttribute('aria-hidden');
        bar.removeAttribute('inert');
      } else {
        bar.setAttribute('aria-hidden', 'true');
        bar.setAttribute('inert', '');
      }
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    io.observe(cta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
