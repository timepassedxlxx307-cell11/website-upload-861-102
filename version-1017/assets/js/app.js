(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showHero(nextIndex) {
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

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showHero(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showHero(index + 1);
      }, 5200);
    }
  }

  var pageSearch = document.querySelector('[data-page-search]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-btn]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var empty = document.querySelector('[data-empty-result]');
  var activeFilter = '全部';

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(pageSearch ? pageSearch.value : '');
    var filter = normalize(activeFilter === '全部' ? '' : activeFilter);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var source = normalize(card.getAttribute('data-filter') || card.textContent);
      var keywordMatch = !keyword || source.indexOf(keyword) !== -1;
      var filterMatch = !filter || source.indexOf(filter) !== -1;
      var show = keywordMatch && filterMatch;
      card.style.display = show ? '' : 'none';
      if (show) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('show', visibleCount === 0);
    }
  }

  if (pageSearch) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      pageSearch.value = query;
    }
    pageSearch.addEventListener('input', filterCards);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-btn') || '全部';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      filterCards();
    });
  });

  filterCards();
})();
