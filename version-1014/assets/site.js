const rootPrefix = document.body.dataset.rootPrefix || "./";
const movies = window.SITE_MOVIES || [];

function toggleMobileMenu() {
  const button = document.querySelector(".mobile-menu-button");
  const menu = document.querySelector(".mobile-nav");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    menu.hidden = expanded;
  });
}

function initHero() {
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  if (slides.length < 2) {
    return;
  }
  let index = 0;
  const show = next => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, current) => slide.classList.toggle("is-active", current === index));
    dots.forEach((dot, current) => dot.classList.toggle("is-active", current === index));
  };
  dots.forEach((dot, current) => dot.addEventListener("click", () => show(current)));
  window.setInterval(() => show(index + 1), 5200);
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function initPageFilters() {
  const input = document.querySelector(".page-search");
  const year = document.querySelector(".year-filter");
  const cards = Array.from(document.querySelectorAll(".searchable-card"));
  if (!cards.length || (!input && !year)) {
    return;
  }
  const apply = () => {
    const query = normalize(input ? input.value : "");
    const selectedYear = year ? year.value : "";
    cards.forEach(card => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.type
      ].join(" "));
      const matchQuery = !query || haystack.includes(query);
      const matchYear = !selectedYear || card.dataset.year === selectedYear;
      card.classList.toggle("is-filter-hidden", !(matchQuery && matchYear));
    });
  };
  if (input) {
    input.addEventListener("input", apply);
  }
  if (year) {
    year.addEventListener("change", apply);
  }
  apply();
}

function movieCard(movie) {
  const image = `${rootPrefix}${movie.cover}.jpg`;
  const href = `${rootPrefix}detail/${movie.file}`;
  const tags = movie.tags.slice(0, 3).map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
  return `
    <article class="movie-card searchable-card">
      <a class="poster-link" href="${href}" aria-label="观看${escapeHtml(movie.title)}">
        <img src="${image}" alt="${escapeHtml(movie.title)}" loading="lazy">
      </a>
      <div class="movie-card-body">
        <div class="movie-meta">
          <span>${escapeHtml(movie.year)}</span>
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
        </div>
        <h3><a href="${href}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[char]);
}

function initSearchPage() {
  const input = document.getElementById("siteSearchInput");
  const results = document.getElementById("searchResults");
  if (!input || !results) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q") || "";
  input.value = initial;
  const render = () => {
    const query = normalize(input.value);
    const filtered = movies.filter(movie => {
      const haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.tags.join(" "),
        movie.oneLine
      ].join(" "));
      return !query || haystack.includes(query);
    }).slice(0, 120);
    results.innerHTML = filtered.map(movieCard).join("");
  };
  input.addEventListener("input", render);
  document.querySelectorAll(".search-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      input.value = chip.textContent.trim();
      render();
    });
  });
  render();
}

function initPlayer() {
  const video = document.getElementById("moviePlayer");
  const overlay = document.querySelector(".play-overlay");
  if (!video || !overlay) {
    return;
  }
  const stream = video.dataset.stream;
  const Hls = window.Hls;
  let prepared = false;
  let hlsInstance = null;
  const prepare = () => {
    if (prepared || !stream) {
      return;
    }
    prepared = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }
  };
  const play = () => {
    prepare();
    overlay.classList.add("is-hidden");
    video.play().catch(() => {
      overlay.classList.remove("is-hidden");
    });
  };
  overlay.addEventListener("click", play);
  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", () => overlay.classList.add("is-hidden"));
  video.addEventListener("pause", () => {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove("is-hidden");
    }
  });
  window.addEventListener("pagehide", () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

toggleMobileMenu();
initHero();
initPageFilters();
initSearchPage();
initPlayer();
