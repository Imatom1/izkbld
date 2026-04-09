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
  sheetUrl: '',  // e.g. 'https://docs.google.com/spreadsheets/d/SHEET_ID/pub?output=csv'

  // Fallback ad shown if the sheet is empty or unreachable
  fallback: {
    portrait:  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',
    landscape: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=360&q=80&fit=crop',
    link:      '',
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
    var lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    var headers = lines[0].split(',').map(function (h) {
      return h.trim().replace(/^"|"$/g, '').toLowerCase();
    });
    var ads = [];
    for (var i = 1; i < lines.length; i++) {
      var vals = lines[i].split(',').map(function (v) {
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

  function applyImage() {
    if (!currentAd) return;
    var src = isMobile()
      ? (currentAd.landscape || currentAd.portrait)
      : (currentAd.portrait  || currentAd.landscape);
    var img = ad.querySelector('img');
    img.classList.remove('loaded');
    img.src = src;
    img.onload = function () { img.classList.add('loaded'); };
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
