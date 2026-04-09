// ═══════════════════════════════════════════════════
//  SIDE AD CONFIG
// ═══════════════════════════════════════════════════
var SIDE_AD = {
  // Direct image URL — overrides Cloudinary if set
  adImageUrl: '',  // e.g. 'https://your-site.com/my-ad.jpg'

  // URL the ad opens when clicked
  adLink: '',  // e.g. 'https://your-site.com'

  cloudinary: {
    cloudName: '',    // e.g. 'my-cloud'
    folder:    '',    // Cloudinary folder name — picks a random image from this folder
    tag:       '',    // or use a tag instead of a folder (folder takes priority)
  },

  // Fallback shown until Cloudinary / adImageUrl is configured
  fallback: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&q=80',

  // Seconds before panel auto-reopens after being closed
  reopenAfter: 30

  // Form factor is handled automatically by CSS:
  //   Desktop (side panel) → 3:10  portrait
  //   Mobile  (bottom bar) → 10:3  landscape  (breakpoint: 750px)
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
  }

  function loadCloudinary() {
    var cn = SIDE_AD.cloudinary;
    var key = cn.folder || cn.tag;
    if (!key) { setImage(SIDE_AD.fallback); return; }
    var url = 'https://res.cloudinary.com/' + cn.cloudName + '/image/list/' + key + '.json';
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

    // Ad panel acts as a link if adLink is set
    if (SIDE_AD.adLink) {
      ad.style.cursor = 'pointer';
      ad.addEventListener('click', function (e) {
        if (e.target !== ad.querySelector('.side-ad-close')) {
          window.open(SIDE_AD.adLink, '_blank');
        }
      });
    }

    // Burger menu
    var burger = document.getElementById('burger');
    if (burger) burger.addEventListener('click', function () {
      document.getElementById('navMenu').classList.toggle('open');
    });

    // Load image
    if (SIDE_AD.adImageUrl) {
      setImage(SIDE_AD.adImageUrl);
    } else if (SIDE_AD.cloudinary.cloudName && (SIDE_AD.cloudinary.folder || SIDE_AD.cloudinary.tag)) {
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
