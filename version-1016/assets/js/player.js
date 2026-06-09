
(function () {
  function attachHls(video, src) {
    if (!src) {
      return null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== src) {
        video.src = src;
      }
      return null;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return hls;
    }

    if (video.src !== src) {
      video.src = src;
    }
    return null;
  }

  function setupPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-button]');
    var hlsInstance = null;
    var prepared = false;

    if (!video) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      hlsInstance = attachHls(video, video.getAttribute('data-src'));
    }

    function playVideo() {
      prepare();
      if (overlay) {
        overlay.hidden = true;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.hidden = false;
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.hidden = false;
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(setupPlayer);
})();
