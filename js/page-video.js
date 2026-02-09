import { openModal, closeModal } from "./common/modal.js";

export function initVideoPage() {
  console.log("Инициализация страницы видео в новом стиле");

  const videoCards = document.querySelectorAll(".video-card");
  if (!videoCards.length) return;

  // ==== БУРГЕР ДЛЯ ФИЛЬТРОВ (НОВОЕ) =====
  const burger = document.querySelector(".mobile-menu-toggle");
  const filters = document.querySelector(".video-filters");

  if (burger && filters) {
    // Инициализация бургера
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      burger.classList.toggle("active");
      filters.classList.toggle("active");
    });

    // Закрытие фильтров при клике на кнопку фильтра
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          burger.classList.remove("active");
          filters.classList.remove("active");
        }
      });
    });

    // Адаптивное поведение фильтров
    function handleFiltersResize() {
      if (window.innerWidth <= 768) {
        filters.classList.remove("active");
        burger.classList.remove("active");
      } else {
        filters.classList.add("active");
        burger.classList.remove("active");
      }
    }

    handleFiltersResize();
    window.addEventListener("resize", handleFiltersResize);

    // Закрытие фильтров при клике вне
    document.addEventListener("click", (e) => {
      if (!filters.classList.contains("active")) return;
      if (!filters.contains(e.target) && !burger.contains(e.target)) {
        filters.classList.remove("active");
        burger.classList.remove("active");
      }
    });
  }

  // ==== ФИЛЬТРЫ ВИДЕО =====
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      // Обновляем активную кнопку
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Фильтруем карточки с анимацией
      videoCards.forEach((card) => {
        const category = card.dataset.category;

        if (filter === "all" || category === filter) {
          card.style.display = "flex";
          card.style.opacity = "0";
          card.style.transform = "translateY(20px)";

          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, 50);
        } else {
          card.style.display = "none";
        }
      });

      // Закрываем фильтры на мобильных
      if (window.innerWidth <= 768 && burger) {
        burger.classList.remove("active");
        filters.classList.remove("active");
      }
    });
  });

  // ==== МОДАЛЬНОЕ ОКНО ДЛЯ ВИДЕО =====
  const modal = document.getElementById("videoModal");
  const modalBody = document.getElementById("modalBody");
  const closeBtn = modal?.querySelector(".close-btn");

  if (!modal || !modalBody || !closeBtn) {
    console.warn("Элементы модального окна видео не найдены");
    return;
  }

  // Локальные обработчики
  let modalKeyHandler = null;
  let modalClickHandler = null;
  let modalBodyClickHandler = null;
  let closeBtnHandler = null;

  // ===== НАСТРОЙКА МОДАЛКИ =====
  function setupVideoModal() {
    // Обработчик ESC
    modalKeyHandler = (e) => {
      if (e.key === "Escape" && modal.classList.contains("open")) {
        closeVideoModal();
      }
    };

    // Обработчик клика по фону
    modalClickHandler = (e) => {
      if (e.target === modal) {
        closeVideoModal();
      }
    };

    // Защита контента
    modalBodyClickHandler = (e) => {
      e.stopPropagation();
    };

    // Кнопка закрытия
    closeBtnHandler = (e) => {
      e.stopPropagation();
      closeVideoModal();
    };

    // Вешаем обработчики
    document.addEventListener("keydown", modalKeyHandler);
    modal.addEventListener("click", modalClickHandler);
    modalBody.addEventListener("click", modalBodyClickHandler);
    closeBtn.addEventListener("click", closeBtnHandler);
  }

  // ===== ОЧИСТКА ОБРАБОТЧИКОВ =====
  function cleanupVideoModal() {
    if (modalKeyHandler) {
      document.removeEventListener("keydown", modalKeyHandler);
      modalKeyHandler = null;
    }

    if (modalClickHandler) {
      modal.removeEventListener("click", modalClickHandler);
      modalClickHandler = null;
    }

    if (modalBodyClickHandler) {
      modalBody.removeEventListener("click", modalBodyClickHandler);
      modalBodyClickHandler = null;
    }

    if (closeBtnHandler) {
      closeBtn.removeEventListener("click", closeBtnHandler);
      closeBtnHandler = null;
    }
  }

  // ===== ОТКРЫТИЕ МОДАЛКИ С ИНДИКАТОРОМ ЗАГРУЗКИ =====
  videoCards.forEach((card) => {
    card.addEventListener("click", () => {
      const source = card.dataset.source;
      const videoId = card.dataset.videoId;

      modalBody.innerHTML = "";

      // Создаем индикатор загрузки
      const loadingIndicator = document.createElement("div");
      loadingIndicator.className = "video-loading";
      loadingIndicator.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <p>Загрузка видео...</p>
            `;
      modalBody.appendChild(loadingIndicator);

      // Показываем индикатор сразу
      loadingIndicator.classList.add("active");

      const videoContainer = document.createElement("div");
      videoContainer.className = "video-container";

      if (source === "youtube") {
        // YouTube видео
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`;
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.title = "YouTube видео";
        iframe.loading = "lazy";

        iframe.onload = () => {
          loadingIndicator.remove();
        };

        iframe.onerror = () => {
          loadingIndicator.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Ошибка загрузки YouTube видео</p>
                    `;
          setTimeout(() => loadingIndicator.remove(), 2000);
        };

        videoContainer.appendChild(iframe);
      } else {
        // Локальное видео
        const videoEl = document.createElement("video");
        videoEl.src = videoId;
        videoEl.controls = true;
        videoEl.autoplay = true;
        videoEl.preload = "auto";
        videoEl.playsInline = true;
        videoEl.className = "local-video";

        const sourceEl = document.createElement("source");
        sourceEl.src = videoId;
        sourceEl.type = "video/mp4";
        videoEl.appendChild(sourceEl);

        videoEl.innerHTML += "Ваш браузер не поддерживает видео тег.";

        // События загрузки для локального видео
        videoEl.addEventListener("loadeddata", () => {
          loadingIndicator.remove();
        });

        videoEl.addEventListener("canplay", () => {
          loadingIndicator.remove();
        });

        videoEl.addEventListener("error", () => {
          loadingIndicator.innerHTML = `
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Ошибка загрузки видео файла</p>
                    `;
          setTimeout(() => loadingIndicator.remove(), 2000);
        });

        videoContainer.appendChild(videoEl);

        // Добавляем управление клавиатурой для локальных видео
        videoEl.addEventListener("keydown", (e) => {
          if (e.code === "Space") {
            e.preventDefault();
            if (videoEl.paused) {
              videoEl.play();
            } else {
              videoEl.pause();
            }
          }

          if (e.code === "KeyF" && e.ctrlKey) {
            e.preventDefault();
            if (videoEl.requestFullscreen) {
              videoEl.requestFullscreen();
            }
          }
        });
      }

      modalBody.appendChild(videoContainer);
      setupVideoModal();
      openModal(modal);

      // Фокусируемся на видео для управления клавиатурой
      setTimeout(() => {
        const videoElement = modalBody.querySelector("video, iframe");
        if (videoElement) {
          videoElement.focus();
        }
      }, 100);
    });
  });

  // ===== ЗАКРЫТИЕ МОДАЛКИ =====
  function closeVideoModal() {
    // Останавливаем все видео
    modalBody.querySelectorAll("video, iframe").forEach((el) => {
      if (el.tagName === "VIDEO") {
        el.pause();
        el.currentTime = 0;
      } else {
        el.src = "";
      }
    });

    modalBody.innerHTML = "";
    cleanupVideoModal();
    closeModal(modal);
  }

  // ==== ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ UX ====

  // Предзагрузка локальных видео при наведении
  if (window.matchMedia("(hover: hover)").matches) {
    videoCards.forEach((card) => {
      if (card.dataset.source === "local") {
        card.addEventListener("mouseenter", () => {
          const videoPath = card.dataset.videoId;
          const preloadVideo = document.createElement("video");
          preloadVideo.src = videoPath;
          preloadVideo.preload = "metadata";
          preloadVideo.style.display = "none";
          document.body.appendChild(preloadVideo);

          setTimeout(() => {
            if (document.body.contains(preloadVideo)) {
              document.body.removeChild(preloadVideo);
            }
          }, 5000);
        });
      }
    });
  }

  // Ленивая загрузка YouTube превью
  const observerOptions = {
    root: null,
    rootMargin: "100px",
    threshold: 0.1,
  };

  const lazyLoadObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const youtubeImg = card.querySelector(".youtube-preview img");
        if (youtubeImg && youtubeImg.dataset.src) {
          youtubeImg.src = youtubeImg.dataset.src;
          youtubeImg.removeAttribute("data-src");
        }
        lazyLoadObserver.unobserve(card);
      }
    });
  }, observerOptions);

  // Добавляем data-src для ленивой загрузки
  document
    .querySelectorAll('.video-card[data-source="youtube"]')
    .forEach((card) => {
      const youtubeImg = card.querySelector(".youtube-preview img");
      if (youtubeImg && !youtubeImg.dataset.src) {
        youtubeImg.dataset.src = youtubeImg.src;
        youtubeImg.src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'%3E%3Cpath fill='%23f0f0f0' d='M0 0h640v480H0z'/%3E%3C/svg%3E";
        lazyLoadObserver.observe(card);
      }
    });

  // ==== УПРАВЛЕНИЕ КЛАВИАТУРОЙ ДЛЯ ФИЛЬТРОВ ====
  document.addEventListener("keydown", (e) => {
    // Tab для навигации по фильтрам
    if (e.target.classList.contains("filter-btn")) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const currentIndex = Array.from(filterButtons).indexOf(e.target);
        const nextIndex = (currentIndex + 1) % filterButtons.length;
        filterButtons[nextIndex].focus();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const currentIndex = Array.from(filterButtons).indexOf(e.target);
        const prevIndex =
          (currentIndex - 1 + filterButtons.length) % filterButtons.length;
        filterButtons[prevIndex].focus();
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.target.click();
      }
    }
  });

  // ==== ИНИЦИАЛИЗАЦИЯ АНИМАЦИЙ =====
  const animatedCards = document.querySelectorAll(".video-card");
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.animationDelay = `${index * 0.05}s`;
            entry.target.classList.add("animated");
          }, 100);
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  animatedCards.forEach((card) => {
    cardObserver.observe(card);
  });

  console.log("Страница видео инициализирована в новом стиле");
}
