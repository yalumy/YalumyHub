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
    ["home", `${root}index.html`, "M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-5v-6h-5v6h-5A1.5 1.5 0 0 1 3 19.5z", "Home"],
    ["memory", `${root}memory-map/index.html`, "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z", "Memory Map"],
    ["courses", `${root}courses/index.html`, "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z M4 5.5V21 M8 7h8 M8 11h8", "Courses"],
    ["podcast", `${root}podcast/index.html`, "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0 M12 19v3 M8 22h8", "Podcast"],
    ["focus", `${root}focus/index.html`, "M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", "Focus"],
    ["breathe", `${root}relax/index.html`, "M12 3c-5 0-8 4-8 9s3 9 8 9 8-4 8-9-3-9-8-9Zm0 4c-2 0-4 2-4 5s2 5 4 5 4-2 4-5-2-5-4-5Z", "Breathe"],
    ["story", `${root}the-owner/index.html`, "M12 3l2.3 5.7L20 11l-5.7 2.3L12 19l-2.3-5.7L4 11l5.7-2.3z M19 16l1.2 2.8L23 20l-2.8 1.2L19 24l-1.2-2.8L15 20l2.8-1.2z", "Story"]
  ];
  const shell = document.createElement("aside");
  shell.className = "dock universal-dock";
  shell.id = "floatingDock";
  shell.setAttribute("aria-label", "Yalumy Hub navigation");
  shell.innerHTML = `<button class="dock-grip" id="dockGrip" type="button" aria-label="Drag navigation bar" title="Drag this bar"><span></span><span></span><span></span><span></span><span></span><span></span></button><a class="dock-brand" href="${root}index.html" aria-label="Yalumy Hub home"><img src="${root}assets/images/favicon.png" alt=""><strong>Yalumy Hub</strong></a><nav class="dock-links" aria-label="Main navigation">${items.map(([key,href,path,label]) => `<a class="${key === active ? "active" : ""}" href="${href}"><span class="dock-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="${path}"/></svg></span><span>${label}</span></a>`).join("")}</nav><button class="dock-theme" id="unifiedThemeToggle" type="button" aria-label="Switch color theme"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/></svg></button>`;
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

/* Ensure the cherry identity stylesheet is present on every legacy page. */
if (!Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(link => link.href.includes("/assets/redesign.css"))) {
  const path = window.location.pathname.replace(/\\/g, "/");
  const baseIndex = path.indexOf("/YalumyHub/");
  const sitePath = baseIndex >= 0 ? path.slice(baseIndex + "/YalumyHub/".length) : path.replace(/^\\/+/, "");
  const dir = sitePath.endsWith("/") ? sitePath : sitePath.slice(0, Math.max(0, sitePath.lastIndexOf("/") + 1));
  const depth = dir.split("/").filter(Boolean).length;
  const prefix = depth === 0 ? "" : "../".repeat(depth);
  const themeLink = document.createElement("link");
  themeLink.rel = "stylesheet";
  themeLink.href = prefix + "assets/redesign.css?v=yalumy-cherry-20261021";
  document.head.appendChild(themeLink);
}

/* Keep updated design styles fresh on every page and style the language control. */
document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
  if (link.href.includes("/assets/redesign.css")) link.href = link.href.split("?")[0] + "?v=yalumy-assets-20261021-2";
});
const languageStyle = document.createElement("style");
languageStyle.textContent = `
.dock-icon{display:inline-grid;place-items:center;width:25px;height:25px}
.dock-icon svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}
.dock-icon svg path{vector-effect:non-scaling-stroke}
.yalumy-language-toggle{position:fixed;right:22px;bottom:22px;z-index:10001;border:1px solid rgba(183,25,63,.22);border-radius:999px;padding:10px 16px;background:rgba(255,253,252,.94);color:#9f1537;font:600 13px/1.2 'DM Sans',Arial,sans-serif;box-shadow:0 8px 28px rgba(100,20,43,.14);backdrop-filter:blur(14px);cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}
.yalumy-language-toggle:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(100,20,43,.18)}
.arabic-interface{font-family:'Alexandria',Tahoma,sans-serif}
.arabic-interface .yalumy-language-toggle{right:auto;left:22px}
.arabic-interface .dock-links,.arabic-interface .main-nav{direction:rtl}
@media(max-width:760px){.yalumy-language-toggle{right:12px;bottom:12px;padding:9px 13px}.arabic-interface .yalumy-language-toggle{left:12px;right:auto}}
`;
document.head.appendChild(languageStyle);


/* Use the brand mark consistently, and connect lesson-specific artwork where relevant. */
(function applyYalumyAssets(){
  const path = window.location.pathname.replace(/\\/g, "/");
  const marker = path.indexOf("/YalumyHub/");
  const sitePath = marker >= 0 ? path.slice(marker + "/YalumyHub/".length) : path.replace(/^\\/+/, "");
  const dir = sitePath.endsWith("/") ? sitePath : sitePath.slice(0, Math.max(0, sitePath.lastIndexOf("/") + 1));
  const depth = dir.split("/").filter(Boolean).length;
  const prefix = depth === 0 ? "" : "../".repeat(depth);
  document.querySelectorAll("img[src]").forEach(img => {
    img.setAttribute("src", img.getAttribute("src").replace(/assets\/images\/favicon\.png$/, "assets/images/brand/mark.svg"));
  });
  document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(link => {
    const href = link.getAttribute("href") || "";
    if (/assets\/images\/favicon\.png$/.test(href)) link.setAttribute("href", href.replace(/assets\/images\/favicon\.png$/, "assets/images/brand/mark.svg"));
  });
  const updateMarkTheme = () => {
    const markFile = document.body.classList.contains("dark") ? "mark-dark.svg" : "mark.svg";
    document.querySelectorAll('img[src*="assets/images/brand/mark"]').forEach(img => {
      const src = img.getAttribute("src") || "";
      if (/assets\\/images\\/brand\\/mark(?:-dark)?\\.svg$/.test(src)) img.setAttribute("src", src.replace(/mark(?:-dark)?\\.svg$/, markFile));
    });
  };
  updateMarkTheme();
  new MutationObserver(updateMarkTheme).observe(document.body, {attributes:true, attributeFilter:["class"]});
  let artwork = "";
  if (/^games\/(?:homme-quiz|homme-match)\.html$/.test(sitePath)) artwork = "assets/images/lessons/homme.svg";
  else if (/^games\/(?:femme-quiz|femme-match)\.html$/.test(sitePath)) artwork = "assets/images/lessons/femme.svg";
  else if (/^games\/(?:9bal-el-bac-quiz|9bal-el-bac-match)\.html$/.test(sitePath)) artwork = "assets/images/tools/educational-games.svg";
  else if (/^courses\/svt-bac-sciences-experimentales\.html$/.test(sitePath)) artwork = "assets/images/courses/biology-lab.svg";
  if (artwork && !document.querySelector(".page-artwork")) {
    const hero = document.querySelector("main .hero, main .page-hero, body > .container .hero");
    if (hero) {
      const img = document.createElement("img");
      img.className = "page-artwork";
      img.src = prefix + artwork;
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      const badge = hero.querySelector(".hero-badge,.eyebrow");
      if (badge) badge.insertAdjacentElement("afterend", img);
      else hero.prepend(img);
    }
  }
})();
