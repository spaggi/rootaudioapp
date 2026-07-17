const FILES = {
  overworld: "ROOT OST - Overworld Theme.mp3",
  winter: "Root OST - Winter Theme.mp3",
  lake: "Root OST - Lake Theme.mp3",
  mountain: "Root OST - Mountain Theme.mp3",
  battle: "Root OST - Battle Theme (No loop).mp3",
  victory: "Root OST - Victory Theme.mp3",
};

const LABELS = {
  overworld: "Overworld Theme",
  winter: "Winter Theme",
  lake: "Lake Theme",
  mountain: "Mountain Theme",
  victory: "Victory Theme",
};

const BATTLE_LABELS = {
  idle: "Battle",
  looping: "Roll Dice",
  ending: "End Battle",
};

const THEME_KEYS = ["overworld", "winter", "lake", "mountain"];
const FADE_MS = 900;
const BATTLE_END_TIME = 66;
const BATTLE_VOLUME = 0.6;

const player = document.getElementById("player");
const playPauseBtn = document.getElementById("playPauseBtn");
const playIcon = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");
const nowPlayingEl = document.getElementById("nowPlaying");
const themeSelect = document.getElementById("themeSelect");
const playThemeBtn = document.getElementById("playThemeBtn");
const battleBtn = document.getElementById("battleBtn");
const swordIcon = document.getElementById("swordIcon");
const diceIcon = document.getElementById("diceIcon");
const checkIcon = document.getElementById("checkIcon");
const victoryBtn = document.getElementById("victoryBtn");
const battleLabel = document.getElementById("battleLabel");

let currentKey = null;
let battleState = "idle";
let fadeTimeout = null;

let audioCtx = null;
let gainNode = null;

function ensureAudioGraph() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const sourceNode = audioCtx.createMediaElementSource(player);
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 1;
    sourceNode.connect(gainNode).connect(audioCtx.destination);
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function setGainImmediate(value) {
  const now = audioCtx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(value, now);
}

function fadeGain(target, duration, onDone) {
  if (fadeTimeout) {
    clearTimeout(fadeTimeout);
    fadeTimeout = null;
  }
  const now = audioCtx.currentTime;
  gainNode.gain.cancelScheduledValues(now);
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);
  gainNode.gain.linearRampToValueAtTime(target, now + duration / 1000);
  if (onDone) fadeTimeout = setTimeout(onDone, duration);
}

function setBattleState(state) {
  battleState = state;
  swordIcon.classList.toggle("icon-hidden", state !== "idle");
  diceIcon.classList.toggle("icon-hidden", state !== "looping");
  checkIcon.classList.toggle("icon-hidden", state !== "ending");
  battleLabel.textContent = BATTLE_LABELS[state];
}

function updateNowPlaying() {
  if (currentKey === "battle") {
    nowPlayingEl.textContent = battleState === "looping"
      ? "Battle Theme: Initiate Battle"
      : "Battle Theme: Dice Rolled";
  } else {
    nowPlayingEl.textContent = currentKey ? LABELS[currentKey] : "Kein Titel ausgewählt";
  }
}

function refreshActiveUI() {
  const playing = !player.paused && !player.ended;
  playThemeBtn.classList.toggle("is-active", playing && THEME_KEYS.includes(currentKey));
  battleBtn.classList.toggle("is-active", playing && currentKey === "battle");
  victoryBtn.classList.toggle("is-active", playing && currentKey === "victory");
}

function syncPlayPauseIcon() {
  const playing = !player.paused && !player.ended;
  playIcon.classList.toggle("icon-hidden", playing);
  pauseIcon.classList.toggle("icon-hidden", !playing);
}

function switchTrack(key, { loop, time = 0 }) {
  ensureAudioGraph();
  requestWakeLock();
  if (key !== "battle" && battleState !== "idle") setBattleState("idle");

  const targetGain = key === "battle" ? BATTLE_VOLUME : 1;

  const doSwitch = () => {
    if (currentKey !== key) {
      player.src = encodeURI(FILES[key]);
      currentKey = key;
    }
    player.loop = loop;
    player.currentTime = time;
    setGainImmediate(0);
    player.play();
    fadeGain(targetGain, FADE_MS);
    updateNowPlaying();
  };

  if (!player.paused && gainNode.gain.value > 0) {
    fadeGain(0, FADE_MS, doSwitch);
  } else {
    doSwitch();
  }
}

playPauseBtn.addEventListener("click", () => {
  if (!currentKey) {
    switchTrack(themeSelect.value, { loop: true, time: 0 });
    return;
  }
  if (player.paused) player.play();
  else player.pause();
});

playThemeBtn.addEventListener("click", () => {
  switchTrack(themeSelect.value, { loop: true, time: 0 });
});

battleBtn.addEventListener("click", () => {
  if (battleState === "idle") {
    setBattleState("looping");
    switchTrack("battle", { loop: true, time: 0 });
  } else if (battleState === "looping") {
    setBattleState("ending");
    switchTrack("battle", { loop: false, time: BATTLE_END_TIME });
  } else {
    switchTrack(themeSelect.value, { loop: true, time: 0 });
  }
});

victoryBtn.addEventListener("click", () => {
  switchTrack("victory", { loop: false, time: 0 });
});

let wakeLock = null;

async function requestWakeLock() {
  if (!("wakeLock" in navigator)) return;
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      wakeLock = null;
    });
  } catch (err) {
    wakeLock = null;
  }
}

function releaseWakeLock() {
  if (wakeLock) wakeLock.release();
  wakeLock = null;
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && !player.paused) {
    requestWakeLock();
  }
});

player.addEventListener("play", () => {
  refreshActiveUI();
  syncPlayPauseIcon();
  requestWakeLock();
});
player.addEventListener("pause", () => {
  refreshActiveUI();
  syncPlayPauseIcon();
  releaseWakeLock();
});
player.addEventListener("ended", () => {
  refreshActiveUI();
  syncPlayPauseIcon();
  releaseWakeLock();
});

updateNowPlaying();
syncPlayPauseIcon();

document.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
