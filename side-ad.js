// ═══════════════════════════════════════════════════
//  SIDE AD CONFIG
//  Set adImageUrl to your ad image (hosted anywhere).
//  Or use Cloudinary: set cloudName + tag and it will
//  pick a random image from that tag each page load.
//  Upload / delete in Cloudinary — no code changes needed.
// ═══════════════════════════════════════════════════
var SIDE_AD = {
  // Direct image URL — overrides Cloudinary if set
  adImageUrl: '',  // e.g. 'https://your-site.com/my-ad.jpg'

  cloudinary: {
    cloudName: '',   // e.g. 'my-cloud'
    tag:       'side-ad'
  },

  // Fallback shown until either of the above is configured
  fallback: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',

  // Seconds before panel auto-reopens after being closed
  reopenAfter: 30
};

// ═══════════════════════════════════════════════════
//  INTERNALS
// ═══════════════════════════════════════════════════
(function () {
  var ad, tab, cdEl, cdTimer, reopenTimer;

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
      if (remaining <= 0) {
        stopCountdown();
        show();
      }
    }, 1000);
    reopenTimer = setTimeout(show, secs * 1000);
  }

  function stopCountdown() {
    clearInterval(cdTimer);
    clearTimeout(reopenTimer);
    cdEl.textContent = '';
  }

  function setImage(src) {
    var img = ad.querySelector('img');
    img.src = src;
    img.onload = function () { img.classList.add('loaded'); };
    // Make the whole panel a link if adLink is set
    if (SIDE_AD.adLink) {
      ad.addEventListener('click', function (e) {
        if (e.target !== ad.querySelector('.side-ad-close')) {
          window.open(SIDE_AD.adLink, '_blank');
        }
      });
    }
  }

  function loadCloudinary() {
    var url = 'https://res.cloudinary.com/' + SIDE_AD.cloudinary.cloudName +
              '/image/list/' + SIDE_AD.cloudinary.tag + '.json';
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var res = data.resources;
        if (res && res.length) {
          setImage(res[Math.floor(Math.random() * res.length)].secure_url);
        } else {
          setImage(SIDE_AD.fallback);
        }
      })
      .catch(function () { setImage(SIDE_AD.fallback); });
  }

  function init() {
    ad  = document.getElementById('sideAd');
    tab = document.getElementById('sideAdTab');
    cdEl = document.getElementById('sideAdCountdown');
    if (!ad) return;

    // Close button
    ad.querySelector('.side-ad-close').addEventListener('click', function (e) {
      e.stopPropagation();
      hide();
    });

    // Tab reopens immediately
    tab.addEventListener('click', function () { show(); });

    // Burger menu
    var burger = document.getElementById('burger');
    if (burger) burger.addEventListener('click', function () {
      document.getElementById('navMenu').classList.toggle('open');
    });

    // Load image
    if (SIDE_AD.adImageUrl) {
      setImage(SIDE_AD.adImageUrl);
    } else if (SIDE_AD.cloudinary.cloudName) {
      loadCloudinary();
    } else {
      setImage(SIDE_AD.fallback);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
