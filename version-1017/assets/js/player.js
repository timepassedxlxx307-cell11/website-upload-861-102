(function () {
  function attachPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var videoUrl = player.getAttribute('data-video');
    var ready = false;

    if (!video || !button || !videoUrl) {
      return;
    }

    function loadVideo() {
      if (ready) {
        return;
      }

      ready = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        player.hlsInstance = hls;
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      }
    }

    function playVideo() {
      loadVideo();
      button.classList.add('is-hidden');
      video.controls = true;
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
