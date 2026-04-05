import { IDLE_VISUALIZER_HEIGHTS, PLAYING_VISUALIZER_HEIGHTS } from "./data";

const PLAYER_SELECTOR = "[data-music-player]";
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const resetVisualizer = (root: HTMLElement, bars: HTMLElement[]) => {
  root.dataset.playerState = "paused";
  bars.forEach((bar, index) => {
    bar.style.height = `${IDLE_VISUALIZER_HEIGHTS[index] ?? 0}%`;
  });
};

const updateMarquee = (title: HTMLElement, titleClone: HTMLElement, marquee: HTMLElement) => {
  titleClone.textContent = title.textContent;
  marquee.classList.remove("is-scrolling", "is-overflowing");
  marquee.style.removeProperty("--title-scroll-distance");
  marquee.style.removeProperty("--title-scroll-duration");
  marquee.style.removeProperty("width");

  requestAnimationFrame(() => {
    const viewportWidth = marquee.parentElement?.clientWidth ?? 0;
    const titleWidth = title.scrollWidth;
    const gapWidth = 40;
    const edgeBuffer = 6;

    if (titleWidth <= viewportWidth + 2) return;

    marquee.classList.add("is-overflowing", "is-scrolling");
    marquee.style.setProperty("--title-scroll-distance", `${titleWidth + gapWidth + edgeBuffer}px`);
    marquee.style.setProperty("--title-scroll-duration", `${Math.max(8, titleWidth / 22)}s`);
    marquee.style.width = `${titleWidth * 2 + gapWidth + edgeBuffer}px`;
  });
};

export const setupMusicPlayers = () => {
  for (const root of document.querySelectorAll<HTMLElement>(PLAYER_SELECTOR)) {
    if (root.dataset.playerBound === "true") continue;
    root.dataset.playerBound = "true";

    const audio = root.querySelector("[data-player-audio]");
    const title = root.querySelector("[data-player-title]");
    const titleClone = root.querySelector("[data-player-title-clone]");
    const marquee = root.querySelector("[data-player-marquee]");
    const clock = root.querySelector("[data-player-clock]");
    const progress = root.querySelector("[data-player-progress]");
    const currentTime = root.querySelector("[data-player-current]");
    const duration = root.querySelector("[data-player-duration]");
    const toggle = root.querySelector("[data-player-toggle]");
    const prev = root.querySelector("[data-player-prev]");
    const next = root.querySelector("[data-player-next]");
    const bars = Array.from(root.querySelectorAll<HTMLElement>("[data-player-bar]"));
    const trackButtons = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-player-track]"));

    if (
      !(audio instanceof HTMLAudioElement) ||
      !(title instanceof HTMLElement) ||
      !(titleClone instanceof HTMLElement) ||
      !(marquee instanceof HTMLElement) ||
      !(clock instanceof HTMLElement) ||
      !(progress instanceof HTMLInputElement) ||
      !(currentTime instanceof HTMLElement) ||
      !(duration instanceof HTMLElement) ||
      !(toggle instanceof HTMLButtonElement) ||
      !(prev instanceof HTMLButtonElement) ||
      !(next instanceof HTMLButtonElement)
    ) {
      continue;
    }

    const tracks = trackButtons.map((button) => ({
      title: button.dataset.trackTitle ?? "Untitled track",
      src: button.dataset.trackSrc ?? "",
    }));

    if (!tracks.length) continue;

    let activeIndex = 0;
    let loadedIndex = -1;

    const syncButtons = () => {
      for (const [index, button] of trackButtons.entries()) {
        const active = index === activeIndex;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      }
    };

    const syncToggle = () => {
      toggle.setAttribute("aria-label", audio.paused ? "Play" : "Pause");
      toggle.dataset.state = audio.paused ? "paused" : "playing";
    };

    const syncClock = (seconds: number) => {
      clock.textContent = formatTime(seconds);
    };

    const loadTrack = (index: number, autoplay = false) => {
      activeIndex = (index + tracks.length) % tracks.length;
      const track = tracks[activeIndex];

      if (loadedIndex !== activeIndex) {
        audio.src = track.src;
        audio.load();
        loadedIndex = activeIndex;
      }

      title.textContent = track.title;
      progress.value = "0";
      currentTime.textContent = "0:00";
      duration.textContent = "--:--";
      syncClock(0);
      syncButtons();
      syncToggle();
      updateMarquee(title, titleClone, marquee);

      if (autoplay) {
        audio.play().catch(() => {
          syncToggle();
        });
      }
    };

    toggle.addEventListener("click", async () => {
      if (loadedIndex === -1) loadTrack(activeIndex);

      if (audio.paused) {
        await audio.play().catch(() => undefined);
      } else {
        audio.pause();
      }

      syncToggle();
    });

    prev.addEventListener("click", () => {
      loadTrack(activeIndex - 1, !audio.paused);
    });

    next.addEventListener("click", () => {
      loadTrack(activeIndex + 1, !audio.paused);
    });

    for (const [index, button] of trackButtons.entries()) {
      button.addEventListener("click", () => {
        const shouldAutoplay = !audio.paused || audio.currentTime > 0;
        loadTrack(index, shouldAutoplay);
      });
    }

    audio.addEventListener("loadedmetadata", () => {
      progress.max = String(audio.duration || 0);
      duration.textContent = formatTime(audio.duration);
      syncToggle();
    });

    audio.addEventListener("timeupdate", () => {
      progress.value = String(audio.currentTime);
      currentTime.textContent = formatTime(audio.currentTime);
      syncClock(audio.currentTime);
    });

    audio.addEventListener("play", () => {
      syncToggle();
      root.dataset.playerState = "playing";
      bars.forEach((bar, index) => {
        bar.style.height = `${PLAYING_VISUALIZER_HEIGHTS[index] ?? 20}%`;
      });
    });

    audio.addEventListener("pause", () => {
      syncToggle();
      resetVisualizer(root, bars);
    });

    audio.addEventListener("ended", () => {
      resetVisualizer(root, bars);
      loadTrack(activeIndex + 1, true);
    });

    progress.addEventListener("input", () => {
      audio.currentTime = Number(progress.value);
      syncClock(audio.currentTime);
    });

    updateMarquee(title, titleClone, marquee);
    resetVisualizer(root, bars);
  }
};
