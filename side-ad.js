// ═══════════════════════════════════════════════════
//  SIDE AD — IMAGE SOURCE CONFIG
//  To use Cloudinary: set cloudName to your cloud name
//  and tag images in your Cloudinary dashboard with the
//  tag below. Upload or delete images there any time —
//  no code changes needed.
// ═══════════════════════════════════════════════════
var SIDE_AD = {
  cloudinary: {
    cloudName: '',      // e.g. 'my-barbershop' — leave blank to use fallback
    tag:       'barbershop'
  },
  // Fallback images shown until Cloudinary is configured
  fallback: [
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&q=80',
    'https://images.unsplash.com/photo-1593702288056-f5834cfcb249?w=600&q=80',
    'https://images.unsplash.com/photo-1585747860019-23c3519f6286?w=600&q=80',
    'https://images.unsplash.com/photo-1634302086887-13b95f40cd6c?w=600&q=80',
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80'
  ],
  // How long each image is shown (ms)
  interval: 5000
};

// ═══════════════════════════════════════════════════
//  INTERNALS — no need to edit below
// ═══════════════════════════════════════════════════
(function () {
  var images = [];
  var current = 0;
  var imgEl, counter;

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function showImage(src, idx) {
    if (!imgEl) return;
    imgEl.classList.add('switching');
    imgEl.classList.remove('loaded');
    setTimeout(function () {
      imgEl.src = src;
      imgEl.onload = function () {
        imgEl.classList.remove('switching');
        imgEl.classList.add('loaded');
      };
      if (counter) counter.textContent = (idx + 1) + ' / ' + images.length;
      imgEl.classList.remove('switching');
    }, 200);
  }

  function cycle() {
    if (!images.length) return;
    current = (current + 1) % images.length;
    showImage(images[current], current);
  }

  function start(imgs) {
    // Shuffle so every visit shows a different order
    images = imgs.slice().sort(function () { return Math.random() - .5; });
    current = 0;
    showImage(images[0], 0);
    setInterval(cycle, SIDE_AD.interval);
  }

  function loadCloudinary() {
    var url = 'https://res.cloudinary.com/' + SIDE_AD.cloudinary.cloudName +
              '/image/list/' + SIDE_AD.cloudinary.tag + '.json';
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var urls = data.resources.map(function (r) { return r.secure_url; });
        if (urls.length) { start(urls); } else { start(SIDE_AD.fallback); }
      })
      .catch(function () { start(SIDE_AD.fallback); });
  }

  function init() {
    imgEl   = document.getElementById('sideAdImg');
    counter = document.getElementById('sideAdCounter');
    var ad  = document.getElementById('sideAd');
    var tab = document.getElementById('sideAdTab');
    var cls = document.getElementById('sideAdClose');

    if (!ad) return;

    // Panel open/close
    cls.addEventListener('click', function () {
      ad.classList.add('hidden');
      tab.classList.add('visible');
    });
    tab.addEventListener('click', function () {
      ad.classList.remove('hidden');
      tab.classList.remove('visible');
    });

    // Burger menu (shared across pages)
    var burger = document.getElementById('burger');
    if (burger) burger.addEventListener('click', function () {
      document.getElementById('navMenu').classList.toggle('open');
    });

    // Load images
    if (SIDE_AD.cloudinary.cloudName) {
      loadCloudinary();
    } else {
      start(SIDE_AD.fallback);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
