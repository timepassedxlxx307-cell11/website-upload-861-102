(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMobileNavigation() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initListFilter() {
    var form = document.querySelector("[data-filter-form]");

    if (!form) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filterable-card]"));
    var note = document.querySelector("[data-filter-note]");

    function matches(card, values) {
      var search = normalize(card.getAttribute("data-search"));
      var type = normalize(card.getAttribute("data-type"));
      var region = normalize(card.getAttribute("data-region"));
      var genre = normalize(card.getAttribute("data-genre"));
      var year = normalize(card.getAttribute("data-year"));

      if (values.keyword && search.indexOf(values.keyword) === -1) {
        return false;
      }

      if (values.type && type.indexOf(values.type) === -1) {
        return false;
      }

      if (values.region && region.indexOf(values.region) === -1) {
        return false;
      }

      if (values.genre && genre.indexOf(values.genre) === -1) {
        return false;
      }

      if (values.year && year !== values.year) {
        return false;
      }

      return true;
    }

    function applyFilter() {
      var values = {
        keyword: normalize(form.elements.keyword && form.elements.keyword.value),
        type: normalize(form.elements.type && form.elements.type.value),
        region: normalize(form.elements.region && form.elements.region.value),
        genre: normalize(form.elements.genre && form.elements.genre.value),
        year: normalize(form.elements.year && form.elements.year.value)
      };

      var visible = 0;

      cards.forEach(function (card) {
        var keep = matches(card, values);
        card.hidden = !keep;
        if (keep) {
          visible += 1;
        }
      });

      if (note) {
        note.textContent = visible ? "已根据当前条件更新影片列表。" : "当前条件下没有匹配影片，可以减少筛选条件。";
      }
    }

    form.addEventListener("input", applyFilter);
    form.addEventListener("change", applyFilter);
    form.addEventListener("reset", function () {
      window.setTimeout(applyFilter, 0);
    });
  }

  function uniqueValues(items, key, nested) {
    var values = [];

    items.forEach(function (item) {
      var source = nested ? item[key] || [] : [item[key]];
      source.forEach(function (value) {
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
    });

    return values.sort(function (a, b) {
      return String(a).localeCompare(String(b), "zh-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    var genre = (movie.genres || []).slice(0, 3).join(" / ") || movie.genre || "";

    return [
      "<article class=\"movie-card\">",
      "  <a class=\"poster-link\" href=\"movies/" + escapeHtml(movie.id) + ".html\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "    <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + " 海报\" loading=\"lazy\">",
      "    <span class=\"poster-badge\">" + escapeHtml(movie.year) + "</span>",
      "  </a>",
      "  <div class=\"movie-card-body\">",
      "    <p class=\"movie-meta\">" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>",
      "    <h3><a href=\"movies/" + escapeHtml(movie.id) + ".html\">" + escapeHtml(movie.title) + "</a></h3>",
      "    <p class=\"movie-desc\">" + escapeHtml(movie.oneLine) + "</p>",
      "    <div class=\"movie-tags\"><span>" + escapeHtml(genre) + "</span>" + tags + "</div>",
      "  </div>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var page = document.querySelector("[data-search-page]");

    if (!page || !window.MOVIES) {
      return;
    }

    var form = page.querySelector("[data-search-controls]");
    var results = page.querySelector("[data-search-results]");
    var note = page.querySelector("[data-search-note]");
    var params = new URLSearchParams(window.location.search);

    fillSelect(form.elements.type, uniqueValues(window.MOVIES, "type"));
    fillSelect(form.elements.region, uniqueValues(window.MOVIES, "region"));
    fillSelect(form.elements.genre, uniqueValues(window.MOVIES, "genres", true));

    form.elements.q.value = params.get("q") || "";

    function getValues() {
      return {
        q: normalize(form.elements.q.value),
        type: normalize(form.elements.type.value),
        region: normalize(form.elements.region.value),
        genre: normalize(form.elements.genre.value)
      };
    }

    function matches(movie, values) {
      var search = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(" "),
        movie.oneLine
      ].join(" "));

      if (values.q && search.indexOf(values.q) === -1) {
        return false;
      }

      if (values.type && normalize(movie.type).indexOf(values.type) === -1) {
        return false;
      }

      if (values.region && normalize(movie.region).indexOf(values.region) === -1) {
        return false;
      }

      if (values.genre && normalize(movie.genre).indexOf(values.genre) === -1) {
        return false;
      }

      return true;
    }

    function render() {
      var values = getValues();
      var matched = window.MOVIES.filter(function (movie) {
        return matches(movie, values);
      });

      results.innerHTML = matched.map(movieCardHtml).join("");

      if (note) {
        note.textContent = matched.length ? "已根据当前条件更新搜索结果。" : "没有找到匹配内容，可以尝试更宽泛的关键词。";
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });

    form.addEventListener("input", render);
    form.addEventListener("change", render);
    render();
  }

  ready(function () {
    initMobileNavigation();
    initHeroSlider();
    initListFilter();
    initSearchPage();
  });
})();
