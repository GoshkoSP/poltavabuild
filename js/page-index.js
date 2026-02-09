// js/page-index.js
export function initIndexPage() {
  console.log("Инициализация главной страницы");

  // Пример: инициализация слайдеров главной страницы (если есть)
  const mainSliders = document.querySelectorAll(".main-slider, .hero-slider");
  if (mainSliders.length) {
    console.log("Найдены слайдеры на главной:", mainSliders.length);
    // Здесь может быть код для инициализации слайдеров
  }

  // Пример: анимации на главной странице (если есть)
  const animatedElements = document.querySelectorAll(".animate-on-scroll");
  if (animatedElements.length && "IntersectionObserver" in window) {
    console.log("Найдены анимированные элементы:", animatedElements.length);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

  // Пример: аккордеоны/раскрывающиеся блоки на главной (если есть)
  const accordions = document.querySelectorAll(".accordion-header");
  if (accordions.length) {
    console.log("Найдены аккордеоны:", accordions.length);

    accordions.forEach((header) => {
      header.addEventListener("click", () => {
        const accordion = header.closest(".accordion");
        const content = header.nextElementSibling;

        accordion.classList.toggle("active");

        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    });
  }

  // Пример: кнопки "Показать больше" на главной (если есть)
  const showMoreButtons = document.querySelectorAll(".show-more-btn");
  if (showMoreButtons.length) {
    console.log("Найдены кнопки 'Показать больше':", showMoreButtons.length);

    showMoreButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const hiddenContent =
          this.closest(".container").querySelector(".hidden-content");
        if (hiddenContent) {
          hiddenContent.classList.toggle("visible");
          this.textContent = hiddenContent.classList.contains("visible")
            ? "Скрыть"
            : "Показать еще";
        }
      });
    });
  }

  // Пример: счётчики/статистика на главной (если есть)
  const counters = document.querySelectorAll(".counter");
  if (counters.length) {
    console.log("Найдены счётчики:", counters.length);

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const target = +counter.getAttribute("data-target");
            const duration = 2000; // 2 секунды
            const step = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
              current += step;
              if (current < target) {
                counter.textContent = Math.ceil(current);
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = target;
              }
            };

            updateCounter();
            counterObserver.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  // Пример: вкладки на главной (если есть)
  const tabButtons = document.querySelectorAll(".tab-button");
  if (tabButtons.length) {
    console.log("Найдены вкладки:", tabButtons.length);

    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab");

        // Удаляем активный класс у всех кнопок и вкладок
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach((tab) => {
          tab.classList.remove("active");
        });

        // Активируем текущую кнопку и вкладку
        this.classList.add("active");
        const activeTab = document.getElementById(tabId);
        if (activeTab) {
          activeTab.classList.add("active");
        }
      });
    });
  }

  // Пример: параллакс эффекты (если есть)
  const parallaxElements = document.querySelectorAll(".parallax");
  if (parallaxElements.length) {
    console.log("Найдены параллакс элементы:", parallaxElements.length);

    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;

      parallaxElements.forEach((element) => {
        const speed = element.getAttribute("data-speed") || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    });
  }

  // ==== ВАЖНО: НИКАКОЙ ЛОГИКИ ФОРМЫ! ====
  // Вся обработка формы теперь только в js/common/form.js

  console.log("Инициализация главной страницы завершена");
}
