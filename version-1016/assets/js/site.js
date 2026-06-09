
(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var input = root.querySelector('[data-filter-input]');
    var typeSelect = root.querySelector('[data-filter-type]');
    var yearSelect = root.querySelector('[data-filter-year]');
    var categorySelect = root.querySelector('[data-filter-category]');
    var emptyState = root.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (input && q) {
      input.value = q;
    }

    function passYear(cardYear, filterYear) {
      var year = Number(cardYear || 0);
      if (!filterYear) {
        return true;
      }
      if (filterYear === 'older') {
        return year > 0 && year < 2010;
      }
      var base = Number(filterYear);
      if (filterYear === '2020' || filterYear === '2010') {
        return year >= base;
      }
      return year === base;
    }

    function applyFilter() {
      var query = (input ? input.value : '').trim().toLowerCase();
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var categoryValue = categorySelect ? categorySelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var blob = (card.getAttribute('data-search') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var year = card.getAttribute('data-year') || '';
        var category = card.getAttribute('data-category') || '';
        var ok = true;

        if (query && blob.indexOf(query) === -1) {
          ok = false;
        }
        if (typeValue && type.indexOf(typeValue) === -1) {
          ok = false;
        }
        if (categoryValue && category.indexOf(categoryValue) === -1) {
          ok = false;
        }
        if (!passYear(year, yearValue)) {
          ok = false;
        }

        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [input, typeSelect, yearSelect, categorySelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();
