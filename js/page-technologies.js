// js/page-technologies.js
export function initTechnologiesPage() {
  // ШАГ 1: Убираем нативный скролл браузера при загрузке с hash
  if (location.hash) {
    window.scrollTo(0, 0);
  }

  // Проверяем, что мы на странице технологий
  const servicesMenu = document.querySelector(".services-menu");
  if (!servicesMenu) return; // Если нет меню услуг - выходим

  // Аккордеон для категорий
  document.querySelectorAll(".category-title").forEach((title) => {
    title.addEventListener("click", (e) => {
      if (!e.target.closest("a")) {
        const category = title.parentElement;
        category.classList.toggle("active");
      }
    });
  });

  // Аккордеон для подкатегорий
  document.querySelectorAll(".subcategory-title").forEach((title) => {
    title.addEventListener("click", (e) => {
      if (!e.target.closest("a")) {
        const subcategory = title.parentElement;
        subcategory.classList.toggle("active");
      }
    });
  });

  // ШАГ 2.2 — ЕДИНАЯ НАВИГАЦИЯ ПО ХЕШАМ
  handleHashNavigation();

  window.addEventListener("hashchange", () => {
    handleHashNavigation();
  });

  function handleHashNavigation() {
    const hash = window.location.hash;
    if (!hash) return;

    const target = document.querySelector(hash);
    if (!target) return;

    // 1️⃣ раскрываем контент
    const content = target.closest(".tech-content");
    const section = target.closest(".tech-section");
    const toggle = section?.querySelector(".tech-toggle");

    if (content && toggle) {
      content.classList.add("active");
      toggle.classList.add("active");
    }

    // 2️⃣ раскрываем меню (категория / подкатегория)
    openMenuTreeForTarget(target);

    // 3️⃣ скроллим с учётом хедера
    scrollToTargetSafe(target);
  }

  // ШАГ 2.3 — раскрытие меню (АККУРАТНО)
  function openMenuTreeForTarget(target) {
    const menuLink = document.querySelector(
      `.services-menu a[href="#${target.id}"]`,
    );

    if (!menuLink) return;

    const subCategory = menuLink.closest(".menu-subcategory");
    const category = menuLink.closest(".menu-category");

    if (subCategory) subCategory.classList.add("active");
    if (category) category.classList.add("active");
  }

  // ШАГ 2.4 — правильный скролл (БЕЗ reflow)
  function scrollToTarget(target) {
    const header = document.querySelector(".main-header");
    const headerHeight = header ? header.offsetHeight : 0;

    const y =
      target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: y >= 0 ? y : 0, // Защита от отрицательных значений
      behavior: "smooth",
    });
  }

  // 🔧 ШАГ 2: Скроллим ТОЛЬКО ОДИН РАЗ (твой safe-вариант)
  function scrollToTargetSafe(target) {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      setTimeout(() => {
        scrollToTarget(target);
      }, 150);
    } else {
      scrollToTarget(target);
    }
  }

  // 🔧 ШАГ 3: Убеждаемся, что скролл вызывается ТОЛЬКО через JS
  window.addEventListener("load", () => {
    if (!location.hash) return;

    const target = document.querySelector(location.hash);
    if (!target) return;

    scrollToTargetSafe(target);
  });
}
// ===== все работает =====