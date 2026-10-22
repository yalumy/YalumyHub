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
  const normalizedPath = pagePath.replace(/\\/g, "/");
  const baseIndex = normalizedPath.indexOf("/YalumyHub/");
  const sitePath = baseIndex >= 0 ? normalizedPath.slice(baseIndex + "/YalumyHub/".length) : normalizedPath.replace(/^\\/+/, "");
  const directoryPath = sitePath.endsWith("/") ? sitePath : sitePath.slice(0, Math.max(0, sitePath.lastIndexOf("/") + 1));
  const depth = directoryPath.split("/").filter(Boolean).length;
  const root = depth === 0 ? "" : "../".repeat(depth);
  const active = pagePath.includes("memory-map") ? "memory" : pagePath.includes("podcast") ? "podcast" : pagePath.includes("/shop") ? "shop" : pagePath.includes("courses") || pagePath.includes("lessons") || pagePath.includes("games") || pagePath.includes("flashcards") ? "courses" : pagePath.includes("focus") ? "focus" : pagePath.includes("relax") ? "breathe" : pagePath.includes("the-owner") ? "story" : "home";
  const items = [
    ["home", `${root}index.html`, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>', "Home"],
    ["memory", `${root}memory-map/index.html`, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4a3 3 0 0 0-5 2 3 3 0 0 0-1 5 3 3 0 0 0 2 5 3 3 0 0 0 4 4l3-2V5zM15 4a3 3 0 0 1 5 2 3 3 0 0 1 1 5 3 3 0 0 1-2 5 3 3 0 0 1-4 4l-3-2V5z"/></svg>', "Memory Map"],
    ["courses", `${root}courses/index.html`, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 1 4 17.5zM4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 6h8M8 9h8"/></svg>', "Courses"],
    ["shop", `${root}shop/index.html`, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16l-1 13H5L4 8zM9 8a3 3 0 0 1 6 0"/></svg>', "Shop"],
    ["podcast", `${root}podcast/index.html`, '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/></svg>', "Podcast"],
    ["focus", `${root}focus/index.html`, '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/></svg>', "Focus"],
    ["breathe", `${root}relax/index.html`, '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C7 18 4 14 5 9c1-4 5-5 7-1 2-4 6-3 7 1 1 5-2 9-7 12zM12 8v9"/></svg>', "Breathe"],
    ["story", `${root}the-owner/index.html`, '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0m0-4a5 5 0 0 1 6 4"/></svg>', "Story"]
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
  en: {home:"Home",memory:"Memory Map",courses:"Courses",podcast:"Podcast",focus:"Focus",breathe:"Breathe",story:"Our Story",shop:"Shop",switch:"العربية"},
  ar: {home:"الرئيسية",memory:"خريطة الذاكرة",courses:"الدروس",podcast:"البودكاست",focus:"التركيز",breathe:"الاسترخاء",story:"قصتنا",shop:"المتجر",switch:"English"}
};
function applyYalumyLanguage(language) {
  currentLanguage = language;
  localStorage.setItem(languageKey, language);
  document.documentElement.lang = language === "ar" ? "ar" : "en";
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  const labels = languageLabels[language];
  const dockItems = document.querySelectorAll("#floatingDock .dock-links a");
  const keys = ["home","memory","courses","shop","podcast","focus","breathe","story"];
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

/* Keep updated design styles fresh on every page and style the language control. */
document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
  if (link.href.includes("/assets/redesign.css")) link.href = link.href.split("?")[0] + "?v=cherry-20261021";
});
const languageStyle = document.createElement("style");
languageStyle.textContent = `
.yalumy-language-toggle{position:fixed;right:22px;bottom:22px;z-index:10001;border:1px solid rgba(183,25,63,.22);border-radius:999px;padding:10px 16px;background:rgba(255,253,252,.94);color:#9f1537;font:600 13px/1.2 'DM Sans',Arial,sans-serif;box-shadow:0 8px 28px rgba(100,20,43,.14);backdrop-filter:blur(14px);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}
.yalumy-language-toggle:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(100,20,43,.18)}
.arabic-interface{font-family:'Alexandria',Tahoma,sans-serif}
.arabic-interface .yalumy-language-toggle{right:auto;left:22px}
.arabic-interface .dock-links,.arabic-interface .main-nav{direction:rtl}
@media(max-width:760px){.yalumy-language-toggle{right:12px;bottom:12px;padding:9px 13px}.arabic-interface .yalumy-language-toggle{left:12px;right:auto}}
`;
document.head.appendChild(languageStyle);


/* Consistent line icons in the shared navigation */
document.querySelectorAll(".dock-icon svg").forEach(icon => { icon.style.width = "19px"; icon.style.height = "19px"; });
