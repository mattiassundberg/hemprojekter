(function () {
  if (window.__hpCartInit) return;
  window.__hpCartInit = true;

  var SECTION_ID = 'hemprojekter-cart-drawer';
  var drawer, panel, lastFocus, busy = false;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function open() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.setAttribute('data-open', '');
    drawer.removeAttribute('aria-hidden');
    drawer.removeAttribute('inert');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('hp-cart-open');
    requestAnimationFrame(function () { panel && panel.focus(); });
  }

  function close() {
    if (!drawer) return;
    drawer.removeAttribute('data-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', '');
    document.body.style.overflow = '';
    document.body.classList.remove('hp-cart-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function setBusy(state) {
    busy = state;
    if (!drawer) return;
    drawer.classList.toggle('is-busy', state);
  }

  function fetchSection() {
    return fetch('/?sections=' + SECTION_ID, { credentials: 'same-origin' })
      .then(function (r) { return r.json(); })
      .then(function (data) { return data[SECTION_ID]; });
  }

  function replaceDrawer(html) {
    if (!html || !drawer) return;
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var fresh = tmp.querySelector('[data-hp-cart]');
    if (!fresh) return;
    var wasOpen = drawer.hasAttribute('data-open');
    drawer.innerHTML = fresh.innerHTML;
    cacheRefs();
    bindWithin(drawer);
    if (wasOpen) {
      drawer.setAttribute('data-open', '');
      drawer.removeAttribute('aria-hidden');
      drawer.removeAttribute('inert');
    }
  }

  function cacheRefs() {
    drawer = $('[data-hp-cart]');
    panel = drawer && drawer.querySelector('.hp-cart__panel');
  }

  function updateBadge(count) {
    var btn = $('[data-cart-toggle]');
    if (!btn) return;
    var badge = btn.querySelector('.hp-iconbtn__count');
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'hp-iconbtn__count';
        btn.appendChild(badge);
      }
      badge.textContent = count;
    } else if (badge) {
      badge.remove();
    }
    btn.setAttribute('aria-label', 'Varukorg (' + count + ')');
  }

  function refresh() {
    setBusy(true);
    return fetchSection()
      .then(replaceDrawer)
      .then(function () { return fetch('/cart.js', { credentials: 'same-origin' }); })
      .then(function (r) { return r.json(); })
      .then(function (cart) { updateBadge(cart.item_count); })
      .catch(function (e) { console.error('[hp-cart]', e); })
      .then(function () { setBusy(false); });
  }

  function changeLine(line, quantity) {
    setBusy(true);
    return fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ line: line, quantity: quantity, sections: SECTION_ID })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.sections && data.sections[SECTION_ID]) {
          replaceDrawer(data.sections[SECTION_ID]);
        }
        var count = (data && typeof data.item_count === 'number') ? data.item_count : 0;
        updateBadge(count);
      })
      .catch(function (e) { console.error('[hp-cart]', e); })
      .then(function () { setBusy(false); });
  }

  function addLine(formData) {
    setBusy(true);
    formData.append('sections', SECTION_ID);
    return fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: formData
    })
      .then(function (r) {
        if (!r.ok) return r.json().then(function (err) { throw err; });
        return r.json();
      })
      .then(function (data) {
        if (data && data.sections && data.sections[SECTION_ID]) {
          replaceDrawer(data.sections[SECTION_ID]);
        } else {
          return refresh();
        }
      })
      .then(function () { return fetch('/cart.js', { credentials: 'same-origin' }); })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        updateBadge(cart.item_count);
        open();
      })
      .catch(function (e) {
        console.error('[hp-cart] add error', e);
        var msg = (e && e.description) || (e && e.message) || 'Något gick fel.';
        alert(msg);
      })
      .then(function () { setBusy(false); });
  }

  function lineIndex(el) {
    var li = el.closest('[data-cart-line]');
    if (!li) return null;
    return parseInt(li.getAttribute('data-line-index'), 10);
  }
  function lineQty(el) {
    var li = el.closest('[data-cart-line]');
    if (!li) return 0;
    var v = li.querySelector('.hp-cart__qval');
    return v ? parseInt(v.textContent, 10) || 0 : 0;
  }

  function bindWithin(root) {
    if (!root) return;
    $all('[data-cart-close]', root).forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); close(); });
    });
    $all('[data-cart-qty]', root).forEach(function (el) {
      el.addEventListener('click', function () {
        if (busy) return;
        var delta = parseInt(el.getAttribute('data-cart-qty'), 10) || 0;
        var idx = lineIndex(el);
        var current = lineQty(el);
        var next = Math.max(0, current + delta);
        if (idx == null) return;
        changeLine(idx, next);
      });
    });
    $all('[data-cart-remove]', root).forEach(function (el) {
      el.addEventListener('click', function () {
        if (busy) return;
        var idx = lineIndex(el);
        if (idx == null) return;
        changeLine(idx, 0);
      });
    });
  }

  function bindGlobal() {
    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('[data-cart-toggle]');
      if (toggle) {
        e.preventDefault();
        if (drawer && drawer.hasAttribute('data-open')) close();
        else open();
        return;
      }
      var add = e.target.closest('[data-cart-add]');
      if (add) {
        var id = add.getAttribute('data-variant-id');
        if (!id) return;
        e.preventDefault();
        if (busy) return;
        var qty = add.getAttribute('data-quantity') || '1';
        var fd = new FormData();
        fd.append('id', id);
        fd.append('quantity', qty);
        addLine(fd);
        return;
      }
      var form = e.target.closest('form[data-cart-add-form]');
      if (form && form.tagName === 'FORM') {
        // handled via submit listener instead
        return;
      }
    });

    document.addEventListener('submit', function (e) {
      var form = e.target.closest('form[data-cart-add-form]');
      if (!form) return;
      e.preventDefault();
      if (busy) return;
      addLine(new FormData(form));
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer && drawer.hasAttribute('data-open')) close();
    });
  }

  function init() {
    cacheRefs();
    if (!drawer) return;
    bindWithin(drawer);
    bindGlobal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
