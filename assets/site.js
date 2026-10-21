const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("yalumy-theme");

if (savedTheme === "dark") document.body.classList.add("dark");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("yalumy-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}

// Give every Yalumy Hub page the same navigation and visual shell.
document.body.classList.add("unified-page");
if (!document.getElementById("floatingDock")) {
  const pagePath = window.location.pathname;
  const root = pagePath.endsWith("/YalumyHub/") || pagePath === "/" ? "" : "../";
  const active = pagePath.includes("memory-map") ? "memory" : pagePath.includes("podcast") ? "podcast" : pagePath.includes("courses") || pagePath.includes("lessons") || pagePath.includes("games") || pagePath.includes("flashcards") ? "courses" : pagePath.includes("focus") ? "focus" : pagePath.includes("relax") ? "breathe" : pagePath.includes("the-owner") ? "story" : "home";
  const items = [
    ["home", `${root}index.html`, "⌂", "Home"],
    ["memory", `${root}memory-map/index.html`, "◎", "Memory Map"],
    ["courses", `${root}courses/index.html`, "▱", "Courses"],
    ["podcast", `${root}podcast/index.html`, "♫", "Podcast"],
    ["focus", `${root}focus/index.html`, "◷", "Focus"],
    ["breathe", `${root}relax/index.html`, "◌", "Breathe"],
    ["story", `${root}the-owner/index.html`, "✦", "Story"]
  ];
  const shell = document.createElement("aside");
  shell.className = "dock universal-dock";
  shell.id = "floatingDock";
  shell.setAttribute("aria-label", "Yalumy Hub navigation");
  shell.innerHTML = `<button class="dock-grip" id="dockGrip" type="button" aria-label="Drag navigation bar" title="Drag this bar"><span></span><span></span><span></span><span></span><span></span><span></span></button><a class="dock-brand" href="${root}index.html" aria-label="Yalumy Hub home"><img src="${root}assets/images/favicon.png" alt=""><strong>Yalumy Hub</strong></a><nav class="dock-links" aria-label="Main navigation">${items.map(([key,href,icon,label]) => `<a class="${key === active ? "active" : ""}" href="${href}"><span class="dock-icon" aria-hidden="true">${icon}</span><span>${label}</span></a>`).join("")}</nav><button class="dock-theme" id="unifiedThemeToggle" type="button" aria-label="Switch color theme"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/></svg></button>`;
  document.body.prepend(shell);
  document.getElementById("unifiedThemeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("yalumy-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}


// English / Arabic interface switch. SVT Bac learning content stays French.
const languageKey = "yalumy-language";
let currentLanguage = localStorage.getItem(languageKey) || "en";
const languageLabels = {
  en: {home:"Home",memory:"Memory Map",courses:"Courses",podcast:"Podcast",focus:"Focus",breathe:"Breathe",story:"Our Story",switch:"العربية"},
  ar: {home:"الرئيسية",memory:"خريطة الذاكرة",courses:"الدروس",podcast:"البودكاست",focus:"التركيز",breathe:"الاسترخاء",story:"قصتنا",switch:"English"}
};
function applyYalumyLanguage(language) {
  currentLanguage = language;
  localStorage.setItem(languageKey, language);
  document.documentElement.lang = language === "ar" ? "ar" : "en";
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  const labels = languageLabels[language];
  const dockItems = document.querySelectorAll("#floatingDock .dock-links a");
  const keys = ["home","memory","courses","podcast","focus","breathe","story"];
  dockItems.forEach((link,index) => {
    const span = link.querySelector("span:last-child");
    if (span && keys[index]) span.textContent = labels[keys[index]];
  });
  const switcher = document.getElementById("yalumyLanguageToggle");
  if (switcher) switcher.textContent = labels.switch;
  document.body.classList.toggle("arabic-interface", language === "ar");
}
const languageButton = document.createElement("button");
languageButton.type = "button";
languageButton.id = "yalumyLanguageToggle";
languageButton.className = "yalumy-language-toggle";
languageButton.setAttribute("aria-label","Switch interface language");
languageButton.addEventListener("click", () => applyYalumyLanguage(currentLanguage === "en" ? "ar" : "en"));
document.body.appendChild(languageButton);

const dock = document.getElementById("floatingDock");
const dockGrip = document.getElementById("dockGrip");
if (dock && dockGrip) {
  const savedDockPosition = JSON.parse(localStorage.getItem("yalumy-dock-position") || "null");
  if (savedDockPosition && window.innerWidth > 760) {
    dock.style.left = `${Math.min(savedDockPosition.x, window.innerWidth - dock.offsetWidth - 12)}px`;
    dock.style.top = `${Math.min(savedDockPosition.y, window.innerHeight - dock.offsetHeight - 12)}px`;
    dock.style.transform = "none";
  }
  let dragging = false, offsetX = 0, offsetY = 0;
  dockGrip.addEventListener("pointerdown", (event) => {
    if (window.innerWidth <= 760) return;
    dragging = true;
    const rect = dock.getBoundingClientRect();
    offsetX = event.clientX - rect.left; offsetY = event.clientY - rect.top;
    dock.classList.add("dragging"); dockGrip.setPointerCapture(event.pointerId);
  });
  dockGrip.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const x = Math.max(12, Math.min(event.clientX - offsetX, window.innerWidth - dock.offsetWidth - 12));
    const y = Math.max(12, Math.min(event.clientY - offsetY, window.innerHeight - dock.offsetHeight - 12));
    dock.style.left = `${x}px`; dock.style.top = `${y}px`; dock.style.transform = "none";
  });
  const stopDragging = () => {
    if (!dragging) return;
    dragging = false; dock.classList.remove("dragging");
    const rect = dock.getBoundingClientRect();
    localStorage.setItem("yalumy-dock-position", JSON.stringify({x: Math.round(rect.left), y: Math.round(rect.top)}));
  };
  dockGrip.addEventListener("pointerup", stopDragging); dockGrip.addEventListener("pointercancel", stopDragging);
}

applyYalumyLanguage(currentLanguage);
