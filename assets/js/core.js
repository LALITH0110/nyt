/* ==========================================================================
   The Reb Times: shared runtime
   Storage, modals, toasts, on-screen keyboard, stats, confetti.
   ========================================================================== */
(function (global) {
  "use strict";

  var P = global.PUZZLES || {};
  var NS = "rebtimes:";

  /* ---------------------------------------------------------- selectors */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ------------------------------------------------------------ storage */
  /* Wrapped in try/catch, private windows and blocked site data throw. */
  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(NS + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(NS + key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    },
    remove: function (key) {
      try { localStorage.removeItem(NS + key); } catch (e) {}
    },
    clearAll: function () {
      try {
        Object.keys(localStorage)
          .filter(function (k) { return k.indexOf(NS) === 0; })
          .forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) {}
    }
  };

  /* ------------------------------------------------------------- toasts */
  var toastLayer = null;
  function toast(msg, ms) {
    if (!toastLayer) {
      toastLayer = el("div", "toast-layer");
      document.body.appendChild(toastLayer);
    }
    var t = el("div", "toast", msg);
    toastLayer.appendChild(t);
    var life = ms == null ? 1600 : ms;
    if (life === Infinity) return t;
    setTimeout(function () {
      t.classList.add("fade");
      setTimeout(function () { t.remove(); }, 300);
    }, life);
    return t;
  }

  /* ------------------------------------------------------------- modals */
  function modal(name) {
    var back = document.getElementById("modal-" + name);
    if (!back) return null;
    var api = {
      el: back,
      open: function () {
        back.classList.add("open");
        back.setAttribute("aria-hidden", "false");
        var f = back.querySelector("button, [href], input");
        if (f) setTimeout(function () { f.focus(); }, 60);
      },
      close: function () {
        back.classList.remove("open");
        back.setAttribute("aria-hidden", "true");
      },
      isOpen: function () { return back.classList.contains("open"); }
    };
    back.addEventListener("click", function (e) {
      if (e.target === back) api.close();
    });
    $$("[data-close]", back).forEach(function (b) {
      b.addEventListener("click", api.close);
    });
    return api;
  }

  function wireModals() {
    var opened = {};
    $$("[data-modal]").forEach(function (btn) {
      var name = btn.getAttribute("data-modal");
      btn.addEventListener("click", function () {
        var m = opened[name] || (opened[name] = modal(name));
        if (m) m.open();
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      $$(".modal-backdrop.open").forEach(function (b) {
        b.classList.remove("open");
        b.setAttribute("aria-hidden", "true");
      });
    });
  }

  /* -------------------------------------------------------------- dates */
  function formatDate(d) {
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months = ["January","February","March","April","May","June","July",
                  "August","September","October","November","December"];
    return days[d.getDay()] + ", " + months[d.getMonth()] + " " +
           d.getDate() + ", " + d.getFullYear();
  }
  function mastheadDate() {
    var meta = P.meta || {};
    return meta.date || formatDate(new Date());
  }

  /* -------------------------------------------------------- game states */
  /* Per-game saved state. `status` is one of: "new", "progress", "won", "lost". */
  function gameState(id) {
    return store.get("state:" + id, { status: "new" });
  }
  function saveState(id, patch) {
    var cur = gameState(id);
    Object.keys(patch).forEach(function (k) { cur[k] = patch[k]; });
    store.set("state:" + id, cur);
    return cur;
  }
  function resetState(id) { store.remove("state:" + id); }

  /* Cumulative stats, for the little stats panels. */
  function bumpStats(id, won) {
    var s = store.get("stats:" + id, { played: 0, won: 0, streak: 0, best: 0 });
    s.played += 1;
    if (won) {
      s.won += 1;
      s.streak += 1;
      if (s.streak > s.best) s.best = s.streak;
    } else {
      s.streak = 0;
    }
    store.set("stats:" + id, s);
    return s;
  }
  function getStats(id) {
    return store.get("stats:" + id, { played: 0, won: 0, streak: 0, best: 0 });
  }

  /* -------------------------------------------------- on-screen keyboard */
  var KB_ROWS = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER"].concat("ZXCVBNM".split("")).concat(["BACK"])
  ];
  var BACKSPACE_SVG =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/></svg>';

  function keyboard(mount, opts) {
    opts = opts || {};
    var host = typeof mount === "string" ? $(mount) : mount;
    host.classList.add("keyboard");
    host.innerHTML = "";
    var keys = {};

    KB_ROWS.forEach(function (row, i) {
      var r = el("div", "kb-row");
      if (i === 1) r.appendChild(el("div", "key spacer"));
      row.forEach(function (k) {
        var b = el("button", "key");
        b.type = "button";
        b.setAttribute("data-key", k);
        if (k === "ENTER") { b.classList.add("wide"); b.textContent = "Enter"; }
        else if (k === "BACK") {
          b.classList.add("wide");
          b.innerHTML = BACKSPACE_SVG;
          b.setAttribute("aria-label", "Backspace");
        } else {
          b.textContent = k;
        }
        b.addEventListener("click", function () {
          b.blur();
          if (opts.onKey) opts.onKey(k);
        });
        keys[k] = b;
        r.appendChild(b);
      });
      if (i === 1) r.appendChild(el("div", "key spacer"));
      host.appendChild(r);
    });

    /* Physical keyboard */
    if (opts.bindPhysical !== false) {
      document.addEventListener("keydown", function (e) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if ($(".modal-backdrop.open")) return;
        var k = e.key;
        if (k === "Enter") { e.preventDefault(); opts.onKey && opts.onKey("ENTER"); }
        else if (k === "Backspace") { e.preventDefault(); opts.onKey && opts.onKey("BACK"); }
        else if (/^[a-zA-Z]$/.test(k)) { opts.onKey && opts.onKey(k.toUpperCase()); }
      });
    }

    var RANK = { absent: 1, present: 2, correct: 3 };
    return {
      setState: function (letter, state) {
        var b = keys[letter];
        if (!b) return;
        var cur = b.getAttribute("data-state");
        if (cur && RANK[cur] >= RANK[state]) return;  // never downgrade a key
        b.setAttribute("data-state", state);
      },
      reset: function () {
        Object.keys(keys).forEach(function (k) { keys[k].removeAttribute("data-state"); });
      },
      keys: keys
    };
  }

  /* ----------------------------------------------------------- confetti */
  function celebrate(opts) {
    opts = opts || {};
    var colors = opts.colors ||
      ["#e8635a", "#f2b134", "#6aaa64", "#4a6fa5", "#b07cc6", "#e8a0b8"];
    var canvas = el("canvas");
    canvas.style.cssText =
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:120";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(global.devicePixelRatio || 1, 2);

    function size() {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    addEventListener("resize", size);

    var bits = [];
    var count = opts.count || 130;
    for (var i = 0; i < count; i++) {
      bits.push({
        x: innerWidth * (0.2 + Math.random() * 0.6),
        y: -20 - Math.random() * innerHeight * 0.4,
        vx: (Math.random() - 0.5) * 3.2,
        vy: 2 + Math.random() * 3.4,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.24,
        color: colors[(Math.random() * colors.length) | 0]
      });
    }

    var start = Date.now();
    var DURATION = opts.duration || 3400;
    (function frame() {
      var t = Date.now() - start;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      var alive = false;
      bits.forEach(function (b) {
        b.vy += 0.045;
        b.x += b.vx;
        b.y += b.vy;
        b.rot += b.vr;
        if (b.y < innerHeight + 40) alive = true;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.globalAlpha = t > DURATION - 700 ? Math.max(0, (DURATION - t) / 700) : 1;
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      });
      if (alive && t < DURATION) requestAnimationFrame(frame);
      else { removeEventListener("resize", size); canvas.remove(); }
    })();
  }

  /* --------------------------------------------------------------- misc */
  function shuffle(arr, rng) {
    var a = arr.slice(), r = rng || Math.random;
    for (var i = a.length - 1; i > 0; i--) {
      var j = (r() * (i + 1)) | 0;
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text)
        .then(function () { return true; })
        .catch(function () { return false; });
    }
    try {
      var ta = el("textarea");
      ta.value = text;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand("copy");
      ta.remove();
      return Promise.resolve(ok);
    } catch (e) { return Promise.resolve(false); }
  }

  /* Fill any [data-meta="key"] element from PUZZLES.meta, plus the date. */
  function applyMeta() {
    var meta = P.meta || {};
    $$("[data-meta]").forEach(function (n) {
      var k = n.getAttribute("data-meta");
      if (k === "date") n.textContent = mastheadDate();
      else if (meta[k] != null) n.textContent = meta[k];
    });
    if (meta.brand) {
      var t = document.title;
      document.title = t.indexOf("|") > -1 ? t : t + " | " + meta.brand;
    }
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else { fn(); }
  }

  global.RT = {
    $: $, $$: $$, el: el,
    store: store,
    toast: toast,
    modal: modal,
    wireModals: wireModals,
    formatDate: formatDate,
    mastheadDate: mastheadDate,
    gameState: gameState,
    saveState: saveState,
    resetState: resetState,
    bumpStats: bumpStats,
    getStats: getStats,
    keyboard: keyboard,
    celebrate: celebrate,
    shuffle: shuffle,
    copyText: copyText,
    applyMeta: applyMeta,
    ready: ready,
    puzzles: P
  };

  ready(function () { applyMeta(); wireModals(); });

})(window);
