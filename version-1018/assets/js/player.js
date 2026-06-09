(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initPlayer(container) {
    var video = container.querySelector("video");
    var button = container.querySelector("[data-play-button]");
    var status = container.querySelector("[data-player-status]");
    var src = container.getAttribute("data-src");
    var hlsInstance = null;
    var isLoaded = false;

    if (!video || !src) {
      if (status) {
        status.textContent = "当前影片暂未绑定播放源。";
      }
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      if (isLoaded) {
        return;
      }

      isLoaded = true;
      setStatus("正在加载视频源…");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("视频已就绪，可以播放。");
          video.play().catch(function () {
            setStatus("视频已加载，请再次点击播放按钮。");
          });
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("播放器正在尝试恢复播放。\n");
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", function () {
          setStatus("视频已就绪，可以播放。");
          video.play().catch(function () {
            setStatus("视频已加载，请再次点击播放按钮。");
          });
        }, { once: true });
      } else {
        video.src = src;
        setStatus("浏览器将使用原生方式尝试播放。请保持网络连接稳定。");
        video.play().catch(function () {
          setStatus("视频源已绑定，请使用播放器控制栏播放。");
        });
      }
    }

    function play() {
      attachSource();
      if (button) {
        button.classList.add("is-hidden");
      }
      video.play().catch(function () {
        setStatus("视频已加载，请再次点击播放器控制栏播放。");
      });
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
      setStatus("正在播放。");
    });

    video.addEventListener("pause", function () {
      setStatus("已暂停，可继续播放。");
    });

    video.addEventListener("error", function () {
      setStatus("播放源加载失败，请刷新页面或稍后重试。");
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(initPlayer);
  });
})();
