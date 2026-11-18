(function () {
  const links = Array.from(document.querySelectorAll('.deep-rail-inner a[data-article]'));
  const dots = Array.from(document.querySelectorAll('.deep-rail-dot[data-article]'));
  const cards = Array.from(document.querySelectorAll('.related-inline[data-article]'));
  if (!links.length || !cards.length) return;

  let current = null;

  function setActive(id) {
    if (current === id) return;
    current = id;
    links.forEach(function (a) {
      const on = a.dataset.article === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    dots.forEach(function (d) {
      d.classList.toggle('is-active', d.dataset.article === id);
    });
  }

  function update() {
    const rail = document.querySelector('.deep-rail-inner');
    if (!rail) {
      setActive(null);
      return;
    }
    const railBox = rail.getBoundingClientRect();
    if (railBox.bottom <= 0 || railBox.top >= window.innerHeight) {
      setActive(null);
      return;
    }
    const triggerY = railBox.top;
    let id = null;
    for (let i = 0; i < cards.length; i++) {
      const box = cards[i].getBoundingClientRect();
      if (box.top <= triggerY + 1 && box.bottom > triggerY) {
        id = cards[i].dataset.article;
      }
    }
    setActive(id);
  }

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      update();
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', update);
  window.addEventListener('load', update);
  update();
})();

(function () {
  var gifs = Array.from(document.querySelectorAll('img.related-gif'));
  if (!gifs.length) return;
  var nonce = 0;

  var PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  function fileSrc(img) {
    return img.getAttribute('data-gif-src') || (img.getAttribute('src') || '').split('#')[0];
  }

  function stampBlob(blob) {
    nonce += 1;
    var mark = String(Date.now()) + '-' + nonce;
    return blob.arrayBuffer().then(function (buf) {
      var src = new Uint8Array(buf);
      var payload = [];
      var i;
      for (i = 0; i < mark.length; i++) payload.push(mark.charCodeAt(i) & 255);
      var comment = new Uint8Array(4 + payload.length);
      comment[0] = 0x21;
      comment[1] = 0xFE;
      comment[2] = payload.length;
      comment.set(payload, 3);
      comment[3 + payload.length] = 0;
      var out = new Uint8Array(src.length + comment.length);
      if (src.length && src[src.length - 1] === 0x3B) {
        out.set(src.subarray(0, src.length - 1), 0);
        out.set(comment, src.length - 1);
        out[out.length - 1] = 0x3B;
      } else {
        out.set(src, 0);
        out.set(comment, src.length);
      }
      return new Blob([out], { type: 'image/gif' });
    });
  }

  function prepareReady(img) {
    if (!img._gifBlob || img._gifReadyUrl || img._gifPreparing) return img._gifPreparing;
    img._gifPreparing = stampBlob(img._gifBlob).then(function (unique) {
      img._gifReadyUrl = URL.createObjectURL(unique);
      img._gifPreparing = null;
    });
    return img._gifPreparing;
  }

  function prefetch(img) {
    if (img._gifBlob) {
      prepareReady(img);
      return img._gifFetch;
    }
    if (img._gifFetch) return img._gifFetch;
    var src = fileSrc(img);
    img.setAttribute('data-gif-src', src);
    img._gifFetch = fetch(src, { cache: 'force-cache', priority: src.indexOf('Animation-02') !== -1 ? 'high' : 'low' })
      .then(function (res) { return res.blob(); })
      .then(function (blob) {
        img._gifBlob = blob;
        return prepareReady(img);
      })
      .catch(function () {
        img._gifFetch = null;
      });
    return img._gifFetch;
  }

  function play(img) {
    function assign() {
      if (!img._gifReadyUrl) return;
      if (img._gifObjectUrl) URL.revokeObjectURL(img._gifObjectUrl);
      img._gifObjectUrl = img._gifReadyUrl;
      img._gifReadyUrl = null;
      img.src = img._gifObjectUrl;
      prepareReady(img);
    }
    if (img._gifReadyUrl) {
      assign();
      return;
    }
    prefetch(img).then(function () {
      if (img._gifReadyUrl) assign();
      else if (img._gifPreparing) img._gifPreparing.then(assign);
    });
  }

  function lookingAt(entry) {
    var box = entry.boundingClientRect;
    var vh = window.innerHeight;
    if (!entry.isIntersecting || box.height <= 0) return false;
    var mid = box.top + box.height * 0.4;
    return entry.intersectionRatio >= 0.4 || (mid < vh * 0.72 && box.bottom > vh * 0.22);
  }

  function enter(img) {
    if (img._gifInView) return;
    img._gifInView = true;
    play(img);
  }

  function leave(img) {
    img._gifInView = false;
  }

  gifs.forEach(function (img) {
    img.setAttribute('data-gif-src', fileSrc(img));
    if ((img.getAttribute('src') || '').indexOf('data:') !== 0) img.src = PLACEHOLDER;
  });

  if ('IntersectionObserver' in window) {
    var primed = false;
    function prime() {
      if (primed) return;
      primed = true;
      var order = gifs.slice();
      if (order[1]) order.unshift(order.splice(1, 1)[0]);
      order.forEach(prefetch);
      if (prepIo) prepIo.disconnect();
    }
    var prepIo = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) prime();
    }, { rootMargin: '2500px 0px 2500px 0px', threshold: 0 });
    prepIo.observe(gifs[0]);
    if (window.requestIdleCallback) requestIdleCallback(prime, { timeout: 1800 });
    else setTimeout(prime, 1200);

    var playIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (lookingAt(entry)) enter(entry.target);
        else leave(entry.target);
      });
    }, { threshold: [0, 0.2, 0.4, 0.6, 1], rootMargin: '0px' });
    gifs.forEach(function (img) { playIo.observe(img); });
  } else {
    gifs.forEach(prefetch);
    gifs.forEach(enter);
  }

  window.addEventListener('pageshow', function () {
    gifs.forEach(function (img) {
      img._gifInView = false;
      var box = img.getBoundingClientRect();
      if (box.width > 0 && box.top < window.innerHeight * 0.72 && box.bottom > window.innerHeight * 0.22) enter(img);
    });
  });
})();

$(function () {
  $('#ch-button-toggle').click(function (e) {
    e.preventDefault();
    $(this).toggleClass('active');
    $('#ch-nav-wrap').toggleClass('opening');
  });

  $('#ch-nav-wrap').click(function () {
    $(this).toggleClass('opening');
    $('#ch-button-toggle').toggleClass('active');
  });

  $('#ch-nav-wrap a[href^="#"]').on('click', function (e) {
    const target = $(this.getAttribute('href'));
    if (target.length) {
      e.preventDefault();
      const headerH = $('#ch-header').outerHeight() || 64;
      $('html, body').stop().animate({
        scrollTop: target.offset().top - headerH
      }, 1000);
    }
  });

  var $list = $('#section-related .related-list');
  if (!$list.length || typeof $.fn.slick !== 'function') return;
  $list.slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: false,
    dots: true,
    arrows: true,
    swipe: true,
    draggable: true,
    touchMove: true,
    swipeToSlide: true,
    speed: 350,
    cssEase: 'ease-out',
    appendArrows: $list.closest('.related-scroller'),
    appendDots: $list.closest('.related-scroller'),
    prevArrow: '<button type="button" class="related-arrow related-arrow-prev" aria-label="上一則"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 4 8 12l7 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
    nextArrow: '<button type="button" class="related-arrow related-arrow-next" aria-label="下一則"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4l7 8-7 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
    responsive: [
      {
        breakpoint: 769,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
});
