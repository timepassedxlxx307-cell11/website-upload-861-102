document.addEventListener("DOMContentLoaded", function () {
  initializeMobileMenu();
  initializeHeroSlider();
  initializeFilters();
  initializePlayers();
});

function initializeMobileMenu() {
  var button = document.querySelector("[data-mobile-menu-button]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", function () {
    menu.classList.toggle("is-open");
  });
}

function initializeHeroSlider() {
  var hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var previous = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  function stopAutoPlay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  if (previous) {
    previous.addEventListener("click", function () {
      showSlide(current - 1);
      startAutoPlay();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      showSlide(current + 1);
      startAutoPlay();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      startAutoPlay();
    });
  });

  hero.addEventListener("mouseenter", stopAutoPlay);
  hero.addEventListener("mouseleave", startAutoPlay);

  showSlide(0);
  startAutoPlay();
}

function initializeFilters() {
  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));

  panels.forEach(function (panel) {
    var section = panel.closest("section") || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
    var input = panel.querySelector("[data-filter-input]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var resetButton = panel.querySelector("[data-filter-reset]");
    var countNode = panel.querySelector("[data-filter-count]");

    fillSelect(typeSelect, uniqueValues(cards, "type"), "全部类型");
    fillSelect(yearSelect, uniqueValues(cards, "year").sort().reverse(), "全部年份");
    fillSelect(regionSelect, uniqueValues(cards, "region"), "全部地区");

    function applyFilter() {
      var keyword = normalize(input ? input.value : "");
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var matchesKeyword = !keyword || normalize(card.dataset.search || "").indexOf(keyword) !== -1;
        var matchesType = !type || card.dataset.type === type;
        var matchesYear = !year || card.dataset.year === year;
        var matchesRegion = !region || card.dataset.region === region;
        var shouldShow = matchesKeyword && matchesType && matchesYear && matchesRegion;

        card.style.display = shouldShow ? "" : "none";

        if (shouldShow) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }
    }

    [input, typeSelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }

        [typeSelect, yearSelect, regionSelect].forEach(function (select) {
          if (select) {
            select.value = "";
          }
        });

        applyFilter();
      });
    }

    applyFilter();
  });
}

function uniqueValues(cards, key) {
  var values = new Set();

  cards.forEach(function (card) {
    if (card.dataset[key]) {
      values.add(card.dataset[key]);
    }
  });

  return Array.prototype.slice.call(values).sort(function (left, right) {
    return left.localeCompare(right, "zh-CN");
  });
}

function fillSelect(select, values, placeholder) {
  if (!select) {
    return;
  }

  select.innerHTML = "";

  var firstOption = document.createElement("option");
  firstOption.value = "";
  firstOption.textContent = placeholder;
  select.appendChild(firstOption);

  values.forEach(function (value) {
    var option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function initializePlayers() {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var startButton = player.querySelector("[data-player-start]");
    var status = player.querySelector("[data-player-status]");
    var source = player.dataset.src;
    var title = player.dataset.title || "当前影片";

    if (!video || !source || !startButton) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadSource() {
      if (video.dataset.ready === "true") {
        return;
      }

      setStatus("正在初始化 HLS 播放源...");

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪：" + title);
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放源加载异常，请刷新或稍后重试。");
            hls.destroy();
          }
        });

        player._hls = hls;
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("正在使用浏览器原生 HLS 播放能力。");
      } else {
        video.src = source;
        setStatus("已绑定 m3u8 地址，当前浏览器可能需要 HLS 支持。");
      }

      video.dataset.ready = "true";
    }

    function playVideo() {
      loadSource();
      startButton.classList.add("is-hidden");

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          startButton.classList.remove("is-hidden");
          setStatus("浏览器阻止了自动播放，请再次点击播放按钮。");
        });
      }
    }

    startButton.addEventListener("click", playVideo);
    video.addEventListener("play", function () {
      startButton.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        startButton.classList.remove("is-hidden");
      }
    });
  });
}
