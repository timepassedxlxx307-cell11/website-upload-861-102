(() => {
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.getAttribute('data-slide') || 0);
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(() => showSlide(activeSlide + 1), 5200);
  }

  const searchIndex = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];

  document.querySelectorAll('.site-search').forEach((form) => {
    const input = form.querySelector('input[type="search"]');
    const panel = form.querySelector('.search-panel');

    if (!input || !panel) {
      return;
    }

    const render = () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        panel.classList.remove('open');
        panel.innerHTML = '';
        return;
      }

      const results = searchIndex.filter((item) => {
        return [item.title, item.region, item.type, item.genre, item.year]
          .join(' ')
          .toLowerCase()
          .includes(query);
      }).slice(0, 9);

      if (!results.length) {
        panel.innerHTML = '<div class="search-result"><strong>没有找到相关影片</strong><span>换个关键词再试试</span></div>';
        panel.classList.add('open');
        return;
      }

      panel.innerHTML = results.map((item) => {
        return `<a class="search-result" href="${item.url}"><strong>${item.title}</strong><span>${item.year} · ${item.region} · ${item.type}</span></a>`;
      }).join('');
      panel.classList.add('open');
    };

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    form.addEventListener('submit', (event) => {
      const query = input.value.trim().toLowerCase();
      const first = searchIndex.find((item) => item.title.toLowerCase().includes(query));
      if (first) {
        event.preventDefault();
        window.location.href = first.url;
      }
    });
  });

  document.addEventListener('click', (event) => {
    document.querySelectorAll('.site-search').forEach((form) => {
      if (!form.contains(event.target)) {
        const panel = form.querySelector('.search-panel');
        if (panel) {
          panel.classList.remove('open');
        }
      }
    });
  });

  document.querySelectorAll('.page-filter').forEach((input) => {
    const grid = input.closest('section').querySelector('.filterable-grid');
    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.year
        ].join(' ').toLowerCase();
        card.classList.toggle('is-filter-hidden', query && !text.includes(query));
      });
    });
  });

  document.querySelectorAll('.movie-player').forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('.player-overlay');

    if (!video) {
      return;
    }

    let hls = null;
    let ready = false;
    const stream = video.getAttribute('data-stream');

    const load = () => {
      if (ready || !stream) {
        return;
      }
      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    };

    const play = () => {
      load();
      const start = () => {
        const request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(() => {});
        }
      };

      if (hls && window.Hls) {
        hls.once(window.Hls.Events.MANIFEST_PARSED, start);
        start();
      } else {
        start();
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', () => {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });

    video.addEventListener('loadedmetadata', () => {
      if (!video.paused && overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  });
})();
