const presets = {
  stress: { name: 'Release tension · <span class="arabic-text">تخفيف التوتر</span>', inhale: 4, hold: 2, exhale: 6, minutes: 5 },
  fear: { name: 'Find steadiness · <span class="arabic-text">استعادة الأمان</span>', inhale: 3, hold: 1, exhale: 5, minutes: 3 },
  anxiety: { name: 'Slow the rush · <span class="arabic-text">تهدئة الاضطراب</span>', inhale: 4, hold: 0, exhale: 6, minutes: 5 },
  personal: { name: 'Restore energy · <span class="arabic-text">استرجاع الطاقة</span>', inhale: 4, hold: 2, exhale: 4, minutes: 5 }
};

const circle = document.getElementById("breathCircle");
const phaseText = document.getElementById("phaseText");
const phaseArabic = document.getElementById("phaseArabic");
const phaseCount = document.getElementById("phaseCount");
const sessionTime = document.getElementById("sessionTime");
const sessionButton = document.getElementById("sessionButton");
const durationSelect = document.getElementById("durationSelect");
let preset = presets.stress;
let running = false;
let remaining = 300;
let timer;
let audio;
const soundFiles = {
  rain: "../assets/audio/calming-rain.mp3",
  lofi: "../assets/audio/lofi-study-session.mp3"
};

function formatTime(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
function updatePreset(key) {
  preset = presets[key];
  document.getElementById("presetLabel").innerHTML = preset.name;
  document.getElementById("patternLabel").textContent = `Inhale ${preset.inhale} · ${preset.hold ? `Hold ${preset.hold} · ` : ""}Exhale ${preset.exhale}`;
  durationSelect.value = String(preset.minutes);
  resetSession();
}
function resetSession() {
  clearTimeout(timer); running = false; remaining = Number(durationSelect.value) * 60;
  sessionTime.textContent = formatTime(remaining); sessionButton.innerHTML = 'Begin · <span class="arabic-text">ابدأ</span>';
  circle.className = "breath-circle"; phaseText.textContent = "Ready"; phaseArabic.textContent = "جاهز"; phaseCount.textContent = "—";
}
function phase(label, arabic, seconds, className, next) {
  if (!running || remaining <= 0) return finish();
  circle.style.transitionDuration = `${seconds}s`; circle.className = `breath-circle ${className}`; phaseText.textContent = label; phaseArabic.textContent = arabic;
  let count = seconds; phaseCount.textContent = count;
  const tick = () => {
    if (!running) return;
    remaining -= 1; count -= 1; sessionTime.textContent = formatTime(Math.max(0, remaining)); phaseCount.textContent = Math.max(0, count);
    if (remaining <= 0) return finish();
    timer = setTimeout(count <= 0 ? next : tick, 1000);
  };
  timer = setTimeout(tick, 1000);
}
function cycle() {
  phase("Inhale", "شهيق", preset.inhale, "inhale", () => preset.hold ? phase("Hold", "احبس بلطف", preset.hold, "hold", exhale) : exhale());
}
function exhale() { phase("Exhale", "زفير", preset.exhale, "exhale", cycle); }
function finish() { clearTimeout(timer); running = false; circle.className = "breath-circle complete"; phaseText.textContent = "Well done"; phaseArabic.textContent = "أحسنت"; phaseCount.textContent = "✓"; sessionButton.innerHTML = 'Again · <span class="arabic-text">مرة أخرى</span>'; }

document.querySelectorAll(".feeling-card").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".feeling-card").forEach(item => { item.classList.toggle("active", item === button); item.setAttribute("aria-pressed", item === button); });
  updatePreset(button.dataset.preset);
}));
durationSelect.addEventListener("change", resetSession);
sessionButton.addEventListener("click", () => { if (running) { resetSession(); return; } remaining = Number(durationSelect.value) * 60; running = true; sessionButton.innerHTML = 'Pause · <span class="arabic-text">إيقاف</span>'; cycle(); });

document.querySelectorAll("[data-scene]").forEach(button => button.addEventListener("click", () => {
  document.body.className = `relax-body scene-${button.dataset.scene}`;
  document.querySelectorAll("[data-scene]").forEach(item => item.classList.toggle("active", item === button));
}));

function stopSound() {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
  audio = null;
}
function startSound(kind) {
  stopSound(); if (kind === "off") return;
  audio = new Audio(soundFiles[kind]);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = kind === "rain" ? .34 : .27;
  audio.play().catch(() => {
    stopSound();
    document.querySelectorAll("[data-sound]").forEach(item => item.classList.toggle("active", item.dataset.sound === "off"));
  });
}
document.querySelectorAll("[data-sound]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-sound]").forEach(item => item.classList.toggle("active", item === button)); startSound(button.dataset.sound);
}));
