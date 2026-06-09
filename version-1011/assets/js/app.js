(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      mainNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function startSlider() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      if (slideTimer) {
        window.clearInterval(slideTimer);
      }
      showSlide(index);
      startSlider();
    });
  });

  showSlide(0);
  startSlider();

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var noResults = document.querySelector('[data-no-results]');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applySearch() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var words = normalize(card.getAttribute('data-keywords'));
      var matchesQuery = !query || words.indexOf(query) !== -1;
      var matchesFilter = activeFilter === 'all' || words.indexOf(normalize(activeFilter)) !== -1;
      var show = matchesQuery && matchesFilter;

      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var queryParam = params.get('q');

    if (queryParam) {
      searchInput.value = queryParam;
    }

    searchInput.addEventListener('input', applySearch);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applySearch();
    });
  });

  applySearch();

  var playerCard = document.querySelector('[data-player]');

  if (playerCard) {
    var video = playerCard.querySelector('video');
    var playButton = playerCard.querySelector('[data-play-button]');
    var status = playerCard.querySelector('[data-player-status]');
    var config = window.PLAYER_CONFIG || {};
    var hlsInstance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function attachVideo() {
      if (!video || !config.url) {
        setStatus('播放暂时不可用');
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = config.url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(config.url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('网络波动，正在重连');
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('播放恢复中');
            hlsInstance.recoverMediaError();
          } else {
            setStatus('播放失败，请稍后再试');
            hlsInstance.destroy();
          }
        });
        return;
      }

      setStatus('播放暂时不可用');
    }

    function togglePlay() {
      if (!video) {
        return;
      }

      if (video.paused) {
        video.play().catch(function () {
          setStatus('点击视频区域继续播放');
        });
      } else {
        video.pause();
      }
    }

    attachVideo();

    if (playButton) {
      playButton.addEventListener('click', togglePlay);
    }

    if (video) {
      video.addEventListener('play', function () {
        playerCard.classList.add('is-playing');
        setStatus('');
      });

      video.addEventListener('pause', function () {
        playerCard.classList.remove('is-playing');
      });

      video.addEventListener('click', togglePlay);
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
}());
