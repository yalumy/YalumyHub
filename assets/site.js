const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("yalumy-theme");

if (savedTheme === "dark") document.body.classList.add("dark");

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("yalumy-theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}

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
