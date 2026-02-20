// js/page_our_projects.js
import { initGallery } from "./gallery/gallery.js";

export function initOurProjects() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll(".portfolio-item");

  const burger = document.querySelector(".mobile-menu-toggle");
  const filters = document.querySelector(".portfolio-filters");

  // Если страницы нет — выходим
  if (!filterBtns.length || !items.length || !filters) return;

  /* =========================
     ФИЛЬТРАЦИЯ ПРОЕКТОВ
  ========================= */
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;

      items.forEach((item) => {
        item.style.display =
          filter === "all" || item.dataset.category === filter
            ? "block"
            : "none";
      });

      // Закрываем меню фильтров на мобильных
      if (window.innerWidth <= 768 && burger) {
        burger.classList.remove("active");
        filters.classList.remove("active");
      }
    });
  });

  /* =========================
     БУРГЕР ДЛЯ ФИЛЬТРОВ
  ========================= */
  if (burger) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      filters.classList.toggle("active");
    });
  }

  /* =========================
     АДАПТИВНОЕ ПОВЕДЕНИЕ
  ========================= */
  function handleFiltersResize() {
    if (window.innerWidth <= 768) {
      filters.classList.remove("active");
      if (burger) burger.classList.remove("active");
    } else {
      filters.classList.add("active");
      if (burger) burger.classList.remove("active");
    }
  }

  handleFiltersResize();
  window.addEventListener("resize", handleFiltersResize);

  /* =========================
     ГАЛЕРЕЯ
  ========================= */
  initGallery({
    itemsSelector: ".portfolio-item",
    basePath: "img/objects",
    maxImages: 40,
    withVideo: true,
    videoNames: ["finish.mp4", "Process.mp4", "Exterior.mp4"],
  });
}

