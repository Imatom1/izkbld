// ═══════════════════════════════════════════════════
//  SIDE AD CONFIG
//  Add your ads to the array below.
//  Each ad needs:
//    portrait  — tall image for the desktop side panel (3:10 ratio)
//    landscape — wide image for the mobile bottom bar (10:3 ratio)
//    link      — URL that opens when the ad is clicked
//
//  A random ad is picked each page load.
//  When the screen crosses the breakpoint the image
//  automatically swaps to the correct format.
// ═══════════════════════════════════════════════════
var SIDE_AD = {
  ads: [
    // {
    //   portrait:  'https://example.com/ad-tall.jpg',
    //   landscape: 'https://example.com/ad-wide.jpg',
    //   link:      'https://example.com',
    // },
  ],

  // Shown when ads array is empty
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
  var ad, tab, cdEl, cdTimer, reopenTimer, currentAd;
  var mq = window.matchMedia('(max-width:' + SIDE_AD.mobileBreak + 'px)');

  function isMobile() { return mq.matches; }

  function pickAd() {
    var list = SIDE_AD.ads && SIDE_AD.ads.length ? SIDE_AD.ads : null;
    currentAd = list
      ? list[Math.floor(Math.random() * list.length)]
      : SIDE_AD.fallback;
  }

  function applyImage() {
    if (!currentAd) return;
    var mobile = isMobile();
    // Prefer the matching format; fall back to whichever exists
    var src = mobile
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

  function init() {
    ad   = document.getElementById('sideAd');
    tab  = document.getElementById('sideAdTab');
    cdEl = document.getElementById('sideAdCountdown');
    if (!ad) return;

    // Pick a random ad
    pickAd();

    // Load correct image for current screen size
    applyImage();

    // Swap image when screen crosses the breakpoint
    var onChange = function () { applyImage(); };
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange);
    } else {
      mq.addListener(onChange); // Safari < 14
    }

    // Click panel → open link
    if (currentAd && currentAd.link) {
      ad.style.cursor = 'pointer';
      ad.addEventListener('click', function (e) {
        if (e.target !== ad.querySelector('.side-ad-close')) {
          window.open(currentAd.link, '_blank');
        }
      });
    }

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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
