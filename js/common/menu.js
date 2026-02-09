// js/common/menu.js

let menuOpenedByUser = false;

export function initMenu() {
  initServicesMenu();
  initHeaderBurger();
}

/* ===============================
   Меню услуг (services menu)
   =============================== */
function initServicesMenu() {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const wrapper = document.querySelector(".menu-wrapper");
  const menu = document.querySelector(".services-menu");

  if (!toggle || !wrapper || !menu) return;

  function openMenu() {
    wrapper.classList.add("active");
    menu.classList.add("active");
    document.body.style.overflow = "hidden";
    toggle.innerHTML = '<i class="fas fa-times"></i> Закрыть меню';
  }

  function closeMenu() {
    wrapper.classList.remove("active");
    menu.classList.remove("active");
    document.body.style.overflow = "";
    toggle.innerHTML = '<i class="fas fa-bars"></i> Меню услуг';
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    menuOpenedByUser = !wrapper.classList.contains("active");
    wrapper.classList.contains("active") ? closeMenu() : openMenu();
  });

  // клик вне меню
  wrapper.addEventListener("click", (e) => {
    if (e.target === wrapper) {
      closeMenu();
    }
  });

  // клик по ссылке
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      closeMenu();
    }
  });
}

/* ===============================
   Бургер-меню в header
   =============================== */
function initHeaderBurger() {
  const nav = document.querySelector("header nav");
  if (!nav) return;

  const menu = nav.querySelector("ul");
  if (!menu || nav.querySelector(".nav-burger")) return;

  const btn = document.createElement("button");
  btn.className = "nav-burger";
  btn.setAttribute("aria-label", "Меню");
  btn.innerHTML = '<span class="bar"></span>';

  const logo = nav.querySelector(".logo");
  logo ? nav.insertBefore(btn, logo.nextSibling) : nav.appendChild(btn);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    btn.classList.toggle("open");
    menu.classList.toggle("active");
    document.body.style.overflow = menu.classList.contains("active")
      ? "hidden"
      : "";
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("active")) return;
    if (!nav.contains(e.target)) {
      menu.classList.remove("active");
      btn.classList.remove("open");
      document.body.style.overflow = "";
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
      btn.classList.remove("open");
      document.body.style.overflow = "";
    });
  });
}
// ===== все работает =====