(function () {
  if (window.__hpStickyInit) return;
  window.__hpStickyInit = true;

  function init() {
    var bar = document.querySelector('[data-hp-sticky]');
    var cta = document.querySelector('[data-hero-cta]');
    var footer = document.querySelector('.hp-footer') || document.querySelector('footer');
    if (!bar) return;

    var pastHero = !cta;
    var atFooter = false;

    function apply() {
      var visible = pastHero && !atFooter;
      bar.classList.toggle('is-visible', visible);
      if (visible) {
        bar.removeAttribute('aria-hidden');
        bar.removeAttribute('inert');
      } else {
        bar.setAttribute('aria-hidden', 'true');
        bar.setAttribute('inert', '');
      }
    }

    if (cta) {
      var heroIO = new IntersectionObserver(function (entries) {
        pastHero = !entries[0].isIntersecting;
        apply();
      }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
      heroIO.observe(cta);
    }

    var hideZones = [];
    if (footer) hideZones.push(footer);
    var finalCta = document.querySelector('.hp-cta-final');
    if (finalCta) hideZones.push(finalCta);

    if (hideZones.length) {
      var hideStates = new WeakMap();
      var hideIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { hideStates.set(e.target, e.isIntersecting); });
        atFooter = hideZones.some(function (el) { return hideStates.get(el); });
        apply();
      }, { threshold: 0 });
      hideZones.forEach(function (el) { hideIO.observe(el); });
    }

    apply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
