(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var opened = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero-stage");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (slides.length <= 1) {
            return;
        }
        var active = 0;
        var timer;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }
        function move(step) {
            show(active + step);
        }
        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                move(-1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                move(1);
                restart();
            });
        }
        restart();
    }

    function setupSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        inputs.forEach(function (input) {
            var scopeSelector = input.getAttribute("data-search-scope") || "body";
            var scope = document.querySelector(scopeSelector) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var content = card.getAttribute("data-search") || card.textContent.toLowerCase();
                    card.classList.toggle("is-filtered-out", keyword.length > 0 && content.indexOf(keyword) === -1);
                });
            });
        });
    }

    function attachHls(video, stream) {
        if (!stream) {
            return;
        }
        if (stream.indexOf(".m3u8") > -1) {
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }
        }
        video.src = stream;
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".video-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var cover = shell.querySelector(".player-cover");
            var button = shell.querySelector(".play-button");
            if (!video) {
                return;
            }
            attachHls(video, video.getAttribute("data-stream"));
            function play() {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (cover) {
                            cover.classList.remove("is-hidden");
                        }
                    });
                }
            }
            if (cover) {
                cover.addEventListener("click", play);
            }
            if (button) {
                button.addEventListener("click", function (event) {
                    event.stopPropagation();
                    play();
                });
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupSearch();
        setupPlayers();
    });
}());
