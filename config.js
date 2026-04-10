// ═══════════════════════════════════════════════════
//  SITE CONFIG
//
//  SQUARE APPOINTMENTS
//  1. Go to squareup.com/appointments → sign up free
//  2. Add service: Haircut — $25 — 45 min
//  3. Set hours: Mon–Fri 9am–7pm, Sat 8am–5pm
//  4. Go to Online Booking → copy your booking page URL
//  5. Paste it below as squareUrl
//
//  BEHOLD INSTAGRAM FEED
//  1. Go to behold.so → sign up free
//  2. Connect @izak_blendss → create a Grid feed
//  3. Click Get Embed Code → copy the <div> and <script>
//  4. In index.html find the comment "PASTE BEHOLD CODE HERE"
//     and replace it with your embed code
// ═══════════════════════════════════════════════════
var SITE = {
  squareUrl: '',  // e.g. 'https://square.site/book/izak-blendss'
};

(function () {
  if (!SITE.squareUrl) return;

  function updateBookingLinks() {
    // Redirect all "Book Now" links to Square
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
