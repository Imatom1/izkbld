// ═══════════════════════════════════════════════════
//  SIDE AD CONFIG
//
//  HOW TO SET UP YOUR GOOGLE SHEET:
//  1. Create a sheet with these 3 column headers in row 1:
//       portrait  |  landscape  |  link
//  2. Add one ad per row:
//       portrait  = tall image URL  (3:10, for desktop side panel)
//       landscape = wide image URL  (10:3, for mobile bottom bar)
//       link      = website URL to open when ad is clicked
//  3. File → Share → Publish to web → Sheet1 → CSV → Publish
//  4. Paste the published CSV URL below as sheetUrl
//
//  To add/remove/change ads: just edit the sheet. No code changes needed.
// ═══════════════════════════════════════════════════
var SIDE_AD = {
  // Paste your Google Sheet "Publish to web" CSV URL here
  sheetUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQS0fVifDquNLroRBksn13_zYjApvPcRp6K4prnudKSEHLM7BKlt_J1qQKwH6v0883jInVaeuAL5XdP/pub?output=csv',

  // Fallback ad shown if the sheet is empty or unreachable
  fallback: {
    portrait:  '',
    landscape: '',
    link:      'https://ilias-enterprise.netlify.app/',
  },

  reopenAfter: 30,  // seconds before panel re-opens after being closed
  mobileBreak: 750, // must match the CSS breakpoint
};

// ═══════════════════════════════════════════════════
//  INTERNALS
// ═══════════════════════════════════════════════════
(function () {
  var ad, tab, cdEl, cdTimer, reopenTimer, currentAd, adList;
  var mq = window.matchMedia('(max-width:' + SIDE_AD.mobileBreak + 'px)');

  function isMobile() { return mq.matches; }

  // Parse a published Google Sheets CSV into an array of ad objects
  function parseCSV(text) {
    // Google Sheets uses \r\n line endings — handle both
    var lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    var headers = lines[0].split(',').map(function (h) {
      return h.trim().replace(/^"|"$/g, '').toLowerCase();
    });
    var ads = [];
    for (var i = 1; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue; // skip empty lines
      var vals = line.split(',').map(function (v) {
        return v.trim().replace(/^"|"$/g, '');
      });
      var obj = {};
      headers.forEach(function (h, j) { obj[h] = vals[j] || ''; });
      if (obj.portrait || obj.landscape) ads.push(obj);
    }
    return ads;
  }

  function pickAd(list) {
    if (list && list.length) {
      currentAd = list[Math.floor(Math.random() * list.length)];
    } else {
      currentAd = SIDE_AD.fallback;
    }
  }

  function showIliFallback() {
    var img = ad.querySelector('img');
    img.style.display = 'none';
    var existing = ad.querySelector('.ili-ad-fallback');
    if (existing) { existing.style.display = 'flex'; return; }
    var el = document.createElement('div');
    el.className = 'ili-ad-fallback';
    el.style.cssText = [
      'display:flex;flex-direction:column;align-items:center;justify-content:center',
      'width:100%;height:100%;padding:24px 16px;box-sizing:border-box;text-align:center',
      'background:linear-gradient(160deg,#0d0a14 0%,#110b20 60%,#0a0a0a 100%)',
      'gap:8px;cursor:pointer',
    ].join(';');
    el.innerHTML = [
      // Ilitech logo + label
      '<img src="images/ilitech-logo.png" alt="Ilitech" style="width:48px;height:48px;object-fit:contain;opacity:.9">',
      '<div style="font-size:9px;letter-spacing:3px;color:#a78bfa;text-transform:uppercase">Ilitech</div>',
      '<div style="font-size:9px;letter-spacing:2px;color:rgba(245,242,238,.35);text-transform:uppercase">Division 01 — Technology</div>',
      // divider
      '<div style="width:32px;height:1px;background:rgba(201,168,76,.3);margin:6px 0"></div>',
      // Ili Enterprises logo + name
      '<img src="images/ili-logo.png" alt="Ili Enterprises" style="width:36px;height:36px;object-fit:contain;opacity:.8">',
      '<div style="font-family:\'Bebas Neue\',sans-serif;font-size:clamp(16px,3.5vw,24px);letter-spacing:4px;color:#c9a84c;line-height:1.1">Ili Enterprises</div>',
      '<div style="font-size:9px;letter-spacing:2px;color:rgba(245,242,238,.35);text-transform:uppercase">Built Different. Priced Fair.</div>',
      // divider
      '<div style="width:32px;height:1px;background:rgba(201,168,76,.3);margin:6px 0"></div>',
      '<div style="font-size:10px;color:rgba(245,242,238,.5);line-height:1.6;max-width:160px">Custom websites, apps &amp; digital solutions for your brand.</div>',
      '<a href="https://ilias-enterprise.netlify.app/" target="_blank" onclick="event.stopPropagation()" style="margin-top:8px;padding:8px 20px;background:#a78bfa;color:#0d0a14;font-size:9px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;font-weight:700;border-radius:2px">Get Your Website</a>',
    ].join('');
    ad.insertBefore(el, ad.querySelector('.side-ad-close'));
  }

  function hideIliFallback() {
    var img = ad.querySelector('img');
    img.style.display = '';
    var el = ad.querySelector('.ili-ad-fallback');
    if (el) el.style.display = 'none';
  }

  function applyImage() {
    if (!currentAd) return;
    var src = isMobile()
      ? (currentAd.landscape || currentAd.portrait)
      : (currentAd.portrait  || currentAd.landscape);
    if (!src) { showIliFallback(); return; }
    hideIliFallback();
    var img = ad.querySelector('img');
    img.classList.remove('loaded');
    img.src = src;
    img.onload  = function () { img.classList.add('loaded'); };
    img.onerror = function () {
      // Try the other format before giving up
      var other = isMobile() ? currentAd.portrait : currentAd.landscape;
      if (other && img.src !== other) {
        img.src = other;
      } else {
        showIliFallback();
      }
    };
  }

  function show() {
    clearTimeout(reopenTimer);
    stopCountdown();
    pickAd(adList);
    applyImage();
    ad.classList.remove('hidden');
    tab.classList.remove('visible');
  }

  function hide() {
    ad.classList.add('hidden');
    tab.classList.add('visible');
    startCountdown(SIDE_AD.reopenAfter);
  }

  function startCountdown(secs) {
    var remaining = secs;
    cdEl.textContent = remaining + 's';
    cdTimer = setInterval(function () {
      remaining--;
      cdEl.textContent = remaining + 's';
      if (remaining <= 0) { stopCountdown(); show(); }
    }, 1000);
    reopenTimer = setTimeout(show, secs * 1000);
  }

  function stopCountdown() {
    clearInterval(cdTimer);
    clearTimeout(reopenTimer);
    cdEl.textContent = '';
  }

  function start(list) {
    adList = list;
    pickAd(list);
    applyImage();

    // Swap image when screen crosses the breakpoint
    var onChange = function () { applyImage(); };
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else {
      mq.addListener(onChange);
    }

    // Click → open ad link (always reads currentAd so it updates each cycle)
    ad.style.cursor = 'pointer';
    ad.addEventListener('click', function (e) {
      if (e.target !== ad.querySelector('.side-ad-close') && currentAd && currentAd.link) {
        window.open(currentAd.link, '_blank');
      }
    });
  }

  function init() {
    ad   = document.getElementById('sideAd');
    tab  = document.getElementById('sideAdTab');
    cdEl = document.getElementById('sideAdCountdown');
    if (!ad) return;

    // Close button
    ad.querySelector('.side-ad-close').addEventListener('click', function (e) {
      e.stopPropagation();
      hide();
    });

    // Tab reopens panel
    tab.addEventListener('click', function () { show(); });

    // Burger menu
    var burger = document.getElementById('burger');
    if (burger) burger.addEventListener('click', function () {
      document.getElementById('navMenu').classList.toggle('open');
    });

    // Load ads from Google Sheet, fall back gracefully
    if (SIDE_AD.sheetUrl) {
      fetch(SIDE_AD.sheetUrl)
        .then(function (r) { return r.text(); })
        .then(function (csv) {
          var list = parseCSV(csv);
          start(list.length ? list : null);
        })
        .catch(function () { start(null); });
    } else {
      start(null);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
