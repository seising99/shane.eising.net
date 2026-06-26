import { IDLE_VISUALIZER_HEIGHTS, PLAYING_VISUALIZER_HEIGHTS } from "./data";
import type { Track } from "./types";

const PLAYER_SELECTOR = "[data-music-player]";
const GLOBAL_DOCK_SELECTOR = "[data-global-music-player]";
const DOCK_STORAGE_KEY = "eising-global-player-collapsed";

interface PlaylistDescriptor {
  id: string;
  label: string;
  tracks: Track[];
}

interface PlaybackSnapshot {
  playlistId: string | null;
  playlistLabel: string | null;
  tracks: Track[];
  activeIndex: number;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isReady: boolean;
}

interface CommonPlayerElements {
  title: HTMLElement;
  titleClone: HTMLElement;
  marquee: HTMLElement;
  clock: HTMLElement;
  progress: HTMLInputElement;
  currentTime: HTMLElement;
  duration: HTMLElement;
  toggle: HTMLButtonElement;
  prev: HTMLButtonElement;
  next: HTMLButtonElement;
  bars: HTMLElement[];
}

type PlaybackSubscriber = (snapshot: PlaybackSnapshot) => void;

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const modulo = (value: number, length: number) => {
  if (!length) return 0;
  return ((value % length) + length) % length;
};

const updateMarquee = (
  title: HTMLElement,
  titleClone: HTMLElement,
  marquee: HTMLElement,
) => {
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
    marquee.style.setProperty(
      "--title-scroll-distance",
      `${titleWidth + gapWidth + edgeBuffer}px`,
    );
    marquee.style.setProperty(
      "--title-scroll-duration",
      `${Math.max(8, titleWidth / 22)}s`,
    );
    marquee.style.width = `${titleWidth * 2 + gapWidth + edgeBuffer}px`;
  });
};

const applyVisualizerState = (
  root: HTMLElement,
  bars: HTMLElement[],
  playing: boolean,
) => {
  root.dataset.playerState = playing ? "playing" : "paused";
  bars.forEach((bar, index) => {
    const heights = playing
      ? PLAYING_VISUALIZER_HEIGHTS
      : IDLE_VISUALIZER_HEIGHTS;
    bar.style.height = `${heights[index] ?? 0}%`;
  });
};

const getCommonPlayerElements = (
  root: HTMLElement,
): CommonPlayerElements | null => {
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

  if (
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
    return null;
  }

  return {
    title,
    titleClone,
    marquee,
    clock,
    progress,
    currentTime,
    duration,
    toggle,
    prev,
    next,
    bars,
  };
};

const readTrackButtons = (buttons: HTMLButtonElement[]) =>
  buttons
    .map((button) => ({
      title: button.dataset.trackTitle ?? "Untitled track",
      src: button.dataset.trackSrc ?? "",
    }))
    .filter((track) => track.src);

const audio = new Audio();
audio.preload = "none";

let playbackState: PlaybackSnapshot = {
  playlistId: null,
  playlistLabel: null,
  tracks: [],
  activeIndex: 0,
  currentTrack: null,
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isReady: false,
};

const subscribers = new Set<PlaybackSubscriber>();

const emitPlayback = () => {
  const snapshot = { ...playbackState };
  for (const subscriber of subscribers) subscriber(snapshot);
};

const setPlaybackState = (next: Partial<PlaybackSnapshot>) => {
  playbackState = { ...playbackState, ...next };
  emitPlayback();
};

const loadPlaylist = async (
  playlist: PlaylistDescriptor,
  index: number,
  autoplay = false,
) => {
  const tracks = playlist.tracks.filter((track) => track.src);
  if (!tracks.length) return;

  const nextIndex = modulo(index, tracks.length);
  const nextTrack = tracks[nextIndex];
  const sameTrack =
    playbackState.playlistId === playlist.id &&
    playbackState.activeIndex === nextIndex &&
    playbackState.currentTrack?.src === nextTrack.src;

  if (!sameTrack) {
    audio.src = nextTrack.src;
    audio.load();
  }

  setPlaybackState({
    playlistId: playlist.id,
    playlistLabel: playlist.label,
    tracks,
    activeIndex: nextIndex,
    currentTrack: nextTrack,
    currentTime: sameTrack ? audio.currentTime : 0,
    duration: sameTrack ? audio.duration || 0 : 0,
    isReady: sameTrack ? playbackState.isReady : false,
  });

  if (autoplay) {
    await audio.play().catch(() => undefined);
  } else if (!sameTrack) {
    setPlaybackState({ isPlaying: false });
  }
};

const toggleCurrentPlayback = async () => {
  if (!playbackState.currentTrack) return;
  if (audio.paused) {
    await audio.play().catch(() => undefined);
  } else {
    audio.pause();
  }
};

const playRelativeTrack = async (step: number) => {
  if (!playbackState.playlistId || !playbackState.playlistLabel) return;
  await loadPlaylist(
    {
      id: playbackState.playlistId,
      label: playbackState.playlistLabel,
      tracks: playbackState.tracks,
    },
    playbackState.activeIndex + step,
    true,
  );
};

const subscribePlayback = (subscriber: PlaybackSubscriber) => {
  subscribers.add(subscriber);
  subscriber({ ...playbackState });
  return () => subscribers.delete(subscriber);
};

audio.addEventListener("loadedmetadata", () => {
  setPlaybackState({
    duration: audio.duration || 0,
    isReady: Number.isFinite(audio.duration),
  });
});

audio.addEventListener("timeupdate", () => {
  setPlaybackState({
    currentTime: audio.currentTime,
    duration: audio.duration || playbackState.duration,
  });
});

audio.addEventListener("play", () => {
  setPlaybackState({ isPlaying: true });
});

audio.addEventListener("pause", () => {
  setPlaybackState({ isPlaying: false });
});

audio.addEventListener("ended", () => {
  void playRelativeTrack(1);
});

audio.addEventListener("emptied", () => {
  setPlaybackState({
    currentTime: 0,
    duration: 0,
    isReady: false,
  });
});

const syncCommonPlayerUi = (
  root: HTMLElement,
  elements: CommonPlayerElements,
  options: {
    titleText: string;
    currentTime: number;
    duration: number;
    progressEnabled: boolean;
    controlsEnabled: boolean;
    playing: boolean;
  },
) => {
  const { title, titleClone, marquee, clock, progress, currentTime, duration, toggle, prev, next, bars } =
    elements;

  title.textContent = options.titleText;
  titleClone.textContent = options.titleText;
  currentTime.textContent = formatTime(options.currentTime);
  duration.textContent = options.duration > 0 ? formatTime(options.duration) : "--:--";
  clock.textContent = formatTime(options.currentTime);
  progress.max = String(options.duration || 0);
  progress.value = String(options.currentTime);
  progress.disabled = !options.progressEnabled;
  toggle.disabled = !options.controlsEnabled;
  prev.disabled = !options.controlsEnabled;
  next.disabled = !options.controlsEnabled;
  toggle.setAttribute("aria-label", options.playing ? "Pause" : "Play");
  toggle.dataset.state = options.playing ? "playing" : "paused";
  applyVisualizerState(root, bars, options.playing);
  updateMarquee(title, titleClone, marquee);
};

const bindFolderPlayer = (root: HTMLElement) => {
  if (root.dataset.playerBound === "true") return;

  const playlistId = root.dataset.playerId ?? "";
  const playlistLabel = root.dataset.playerLabel ?? "Playlist";
  const elements = getCommonPlayerElements(root);
  const trackButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-player-track]"),
  );
  const tracks = readTrackButtons(trackButtons);

  if (!playlistId || !elements) return;

  root.dataset.playerBound = "true";

  const playlist = { id: playlistId, label: playlistLabel, tracks };
  let selectedIndex = 0;

  const syncTrackButtons = (activeIndex: number) => {
    for (const [index, button] of trackButtons.entries()) {
      const active = index === activeIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    }
  };

  elements.toggle.addEventListener("click", () => {
    if (!tracks.length) return;
    if (playbackState.playlistId === playlistId) {
      void toggleCurrentPlayback();
      return;
    }
    void loadPlaylist(playlist, selectedIndex, true);
  });

  elements.prev.addEventListener("click", () => {
    if (!tracks.length) return;
    if (playbackState.playlistId === playlistId) {
      void playRelativeTrack(-1);
      return;
    }
    selectedIndex = modulo(selectedIndex - 1, tracks.length);
    void loadPlaylist(playlist, selectedIndex, true);
  });

  elements.next.addEventListener("click", () => {
    if (!tracks.length) return;
    if (playbackState.playlistId === playlistId) {
      void playRelativeTrack(1);
      return;
    }
    selectedIndex = modulo(selectedIndex + 1, tracks.length);
    void loadPlaylist(playlist, selectedIndex, true);
  });

  elements.progress.addEventListener("input", () => {
    if (playbackState.playlistId !== playlistId) return;
    audio.currentTime = Number(elements.progress.value);
    setPlaybackState({ currentTime: audio.currentTime });
  });

  for (const [index, button] of trackButtons.entries()) {
    button.addEventListener("click", () => {
      selectedIndex = index;
      void loadPlaylist(playlist, index, true);
    });
  }

  subscribePlayback((snapshot) => {
    const isActivePlaylist = snapshot.playlistId === playlistId;
    if (isActivePlaylist) {
      selectedIndex = snapshot.activeIndex;
    }

    const fallbackTrack = tracks[selectedIndex] ?? tracks[0] ?? null;
    const displayedTrack = isActivePlaylist
      ? snapshot.currentTrack
      : fallbackTrack;

    syncTrackButtons(isActivePlaylist ? snapshot.activeIndex : selectedIndex);

    syncCommonPlayerUi(root, elements, {
      titleText: displayedTrack?.title ?? "No tracks loaded",
      currentTime: isActivePlaylist ? snapshot.currentTime : 0,
      duration: isActivePlaylist ? snapshot.duration : 0,
      progressEnabled: isActivePlaylist && !!displayedTrack,
      controlsEnabled: tracks.length > 0,
      playing: isActivePlaylist && snapshot.isPlaying,
    });
  });
};

const bindGlobalDock = (root: HTMLElement) => {
  if (root.dataset.playerBound === "true") return;

  const elements = getCommonPlayerElements(root);
  const queue = root.querySelector("[data-dock-queue]");
  const toggleDock = root.querySelector("[data-dock-toggle]");
  const browserPath = root.querySelector("[data-browser-path]");
  const browserHome = root.querySelector("[data-browser-home]");
  const browserBack = root.querySelector("[data-browser-back]");
  const views = Array.from(
    root.querySelectorAll<HTMLElement>("[data-browser-view-id]"),
  );
  const categoryButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-browser-category]"),
  );
  const projectButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-browser-project]"),
  );
  const trackButtons = Array.from(
    root.querySelectorAll<HTMLButtonElement>("[data-browser-track]"),
  );

  if (
    !elements ||
    !(queue instanceof HTMLElement) ||
    !(toggleDock instanceof HTMLButtonElement) ||
    !(browserPath instanceof HTMLElement) ||
    !(browserHome instanceof HTMLButtonElement) ||
    !(browserBack instanceof HTMLButtonElement)
  ) {
    return;
  }

  root.dataset.playerBound = "true";

  let currentViewId = "root";
  let hasSeededActiveProject = false;

  const setCollapsed = (collapsed: boolean) => {
    root.dataset.collapsed = collapsed ? "true" : "false";
    toggleDock.textContent = collapsed ? "OPEN" : "HIDE";
    toggleDock.setAttribute("aria-expanded", String(!collapsed));
    toggleDock.setAttribute(
      "aria-label",
      collapsed ? "Open music player" : "Collapse music player",
    );

    try {
      window.localStorage.setItem(DOCK_STORAGE_KEY, collapsed ? "true" : "false");
    } catch {
      // Ignore storage failures in private browsing contexts.
    }
  };

  const setView = (viewId: string) => {
    currentViewId = viewId;

    for (const view of views) {
      const active = view.dataset.browserViewId === viewId;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
    }

    const activeView = views.find((view) => view.dataset.browserViewId === viewId);
    const categoryLabel = activeView?.dataset.browserCategoryLabel ?? "";
    const projectLabel = activeView?.dataset.browserProjectLabel ?? "";

    if (viewId === "root") {
      browserPath.textContent = "Library";
    } else if (projectLabel) {
      browserPath.textContent = `${categoryLabel} / ${projectLabel}`;
    } else {
      browserPath.textContent = categoryLabel || "Library";
    }

    browserHome.disabled = viewId === "root";
    browserBack.disabled = viewId === "root";
  };

  for (const button of categoryButtons) {
    button.addEventListener("click", () => {
      const categoryIndex = button.dataset.categoryIndex;
      if (!categoryIndex) return;
      setView(`category:${categoryIndex}`);
    });
  }

  for (const button of projectButtons) {
    button.addEventListener("click", () => {
      const projectId = button.dataset.projectId;
      if (!projectId) return;
      setView(`project:${projectId}`);
    });
  }

  for (const button of trackButtons) {
    button.addEventListener("click", () => {
      const projectView = button.closest<HTMLElement>("[data-project-view]");
      const projectId = projectView?.dataset.projectId ?? "";
      const projectLabel = projectView?.dataset.browserProjectLabel ?? "Playlist";
      const projectTracks = readTrackButtons(
        Array.from(
          projectView?.querySelectorAll<HTMLButtonElement>("[data-browser-track]") ??
            [],
        ),
      );
      const trackIndex = Number(button.dataset.trackIndex ?? "0");

      if (!projectId || !projectTracks.length) return;

      void loadPlaylist(
        { id: projectId, label: projectLabel, tracks: projectTracks },
        trackIndex,
        true,
      );
    });
  }

  elements.toggle.addEventListener("click", () => {
    void toggleCurrentPlayback();
  });

  elements.prev.addEventListener("click", () => {
    void playRelativeTrack(-1);
  });

  elements.next.addEventListener("click", () => {
    void playRelativeTrack(1);
  });

  elements.progress.addEventListener("input", () => {
    if (!playbackState.currentTrack) return;
    audio.currentTime = Number(elements.progress.value);
    setPlaybackState({ currentTime: audio.currentTime });
  });

  toggleDock.addEventListener("click", () => {
    setCollapsed(root.dataset.collapsed !== "true");
  });

  browserHome.addEventListener("click", () => {
    setView("root");
  });

  browserBack.addEventListener("click", () => {
    if (currentViewId === "root") return;

    if (currentViewId.startsWith("project:")) {
      const activeView = views.find(
        (view) => view.dataset.browserViewId === currentViewId,
      );
      const categoryIndex = activeView?.dataset.browserCategoryIndex;
      setView(categoryIndex ? `category:${categoryIndex}` : "root");
      return;
    }

    setView("root");
  });

  let collapsed = true;
  try {
    const stored = window.localStorage.getItem(DOCK_STORAGE_KEY);
    if (stored === "false") collapsed = false;
  } catch {
    collapsed = true;
  }

  setCollapsed(collapsed);
  setView("root");

  subscribePlayback((snapshot) => {
    if (snapshot.playlistId && !hasSeededActiveProject) {
      const matchingView = views.find(
        (view) => view.dataset.browserViewId === `project:${snapshot.playlistId}`,
      );
      if (matchingView) {
        setView(matchingView.dataset.browserViewId ?? "root");
        hasSeededActiveProject = true;
      }
    }

    queue.textContent = snapshot.playlistLabel ?? "Portfolio Library";

    for (const button of trackButtons) {
      const projectId = button.dataset.projectId;
      const trackIndex = Number(button.dataset.trackIndex ?? "-1");
      const active =
        snapshot.playlistId === projectId && snapshot.activeIndex === trackIndex;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    }

    syncCommonPlayerUi(root, elements, {
      titleText: snapshot.currentTrack?.title ?? "Select a song",
      currentTime: snapshot.currentTime,
      duration: snapshot.duration,
      progressEnabled: !!snapshot.currentTrack,
      controlsEnabled: !!snapshot.currentTrack,
      playing: snapshot.isPlaying,
    });
  });
};

export const setupSharedMusicUi = () => {
  for (const root of document.querySelectorAll<HTMLElement>(PLAYER_SELECTOR)) {
    bindFolderPlayer(root);
  }

  for (const root of document.querySelectorAll<HTMLElement>(GLOBAL_DOCK_SELECTOR)) {
    bindGlobalDock(root);
  }
};

export const setupMusicPlayers = setupSharedMusicUi;
