var SITE = {
  squareUrl: '',
};

(function () {
  if (!SITE.squareUrl) return;

  function updateBookingLinks() {
    document.querySelectorAll('a[href="contact.html"]').forEach(function (a) {
      a.href = SITE.squareUrl;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateBookingLinks);
  } else {
    updateBookingLinks();
  }
})();
