// js/gallery/gallery.js
import { openModal, closeModal } from "../common/modal.js";

const DEFAULTS = {
  itemsSelector: ".portfolio-item",
  basePath: "img/objects",
  maxImages: 40,
  withVideo: true,
  videoNames: ["Finish.mp4", "Process.mp4"], // Можно любые имена
};

export function initGallery(options = {}) {
  const config = { ...DEFAULTS, ...options };

  const items = document.querySelectorAll(config.itemsSelector);
  const lightbox = document.getElementById("lightbox");
  const previewGrid = document.getElementById("previewGrid");
  const viewer = lightbox.querySelector(".viewer");
  const viewerImage = document.getElementById("viewerImage");
  const viewerVideo = document.getElementById("viewerVideo");

  if (!items.length || !lightbox) return;

  let media = [];
  let currentIndex = 0;
  let mode = "preview"; // "preview" или "viewer"
  let isKeyListenerActive = false;

  /* ---------- utils ---------- */
  function checkImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function checkVideo(src) {
    return new Promise((resolve) => {
      const v = document.createElement("video");
      v.src = src;
      v.onloadedmetadata = () => resolve(true);
      v.onerror = () => resolve(false);
    });
  }

  async function findVideoPreview(base, videoName) {
    // Извлекаем имя без расширения: "Finish.mp4" → "finish"
    const baseName = videoName.replace(".mp4", "").toLowerCase();

    // Новый формат: video-{name}.webp в папке preview
    const previewPaths = [
      // Основной новый формат: preview/video-{name}.webp
      `${base}/preview/video-${baseName}.webp`,
      `${base}/preview/video-${baseName}.jpg`,

      // Альтернативный формат в папке video
      `${base}/video/preview-${baseName}.webp`,
      `${base}/video/preview-${baseName}.jpg`,

      // Старые форматы для обратной совместимости
      `${base}/preview/video-thumb.webp`,
      `${base}/preview/video-thumb.jpg`,
      `${base}/video/preview.webp`,
      `${base}/video/preview.jpg`,
    ];

    for (const path of previewPaths) {
      if (await checkImage(path)) {
        return path;
      }
    }

    return null;
  }

  async function loadMedia(folder) {
    const result = [];
    const base = `${config.basePath}/${folder}`;

    /* 1. ПРОВЕРЯЕМ ВСЕ ВИДЕО ИЗ КОНФИГА */
    if (config.withVideo && config.videoNames && config.videoNames.length > 0) {
      for (const videoName of config.videoNames) {
        let videoPath = null;

        // Основной путь к видео
        const videoSrc = `${base}/video/${videoName}`;
        // Альтернативный путь для некоторых проектов
        const altVideoSrc = `video/info/${folder}/${videoName}`;

        // Проверяем основное местоположение видео
        if (await checkVideo(videoSrc)) {
          videoPath = videoSrc;
        }
        // Проверяем альтернативное местоположение
        else if (await checkVideo(altVideoSrc)) {
          videoPath = altVideoSrc;
        }

        // Если видео найдено
        if (videoPath) {
          // Ищем стоп-кадр для этого видео
          const preview = await findVideoPreview(base, videoName);

          // Добавляем видео в массив
          result.push({
            type: "video",
            src: videoPath,
            preview: preview,
            name: videoName,
            baseName: videoName.replace(".mp4", "").toLowerCase(),
          });
        }
      }
    }

    /* 2. ЗАГРУЖАЕМ ИЗОБРАЖЕНИЯ */
    for (let i = 1; i <= config.maxImages; i++) {
      const n = String(i).padStart(2, "0");

      // Проверяем webp, потом jpg
      const previewWebp = `${base}/preview/${n}.webp`;
      const fullWebp = `${base}/full/${n}.webp`;
      const previewJpg = `${base}/preview/${n}.jpg`;
      const fullJpg = `${base}/full/${n}.jpg`;

      // Сначала пробуем webp
      if (await checkImage(previewWebp)) {
        result.push({
          type: "image",
          preview: previewWebp,
          full: fullWebp,
          index: i,
        });
      }
      // Если webp нет, пробуем jpg
      else if (await checkImage(previewJpg)) {
        result.push({
          type: "image",
          preview: previewJpg,
          full: fullJpg,
          index: i,
        });
      }
      // Если нет ни webp, ни jpg, и прошли первые 10, выходим
      else if (i > 10) break;
    }

    return result;
  }

  /* ---------- keyboard listener ---------- */
  function onKey(e) {
    if (!lightbox.classList.contains("open")) return;

    if (mode === "viewer") {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") closeAction();
    } else if (mode === "preview") {
      if (e.key === "Escape") closeAction();
    }
  }

  function addKeyListener() {
    if (!isKeyListenerActive) {
      document.addEventListener("keydown", onKey);
      isKeyListenerActive = true;
    }
  }

  function removeKeyListener() {
    if (isKeyListenerActive) {
      document.removeEventListener("keydown", onKey);
      isKeyListenerActive = false;
    }
  }

  /* ---------- режимы ---------- */
  function openPreviewMode() {
    mode = "preview";
    previewGrid.style.display = "grid";
    viewer.style.display = "none";
    viewerVideo.pause();
    viewerVideo.removeAttribute("src");
    viewerVideo.style.display = "none";
    viewerImage.style.display = "none";
    viewerImage.src = "";
  }

  function openViewerMode() {
    mode = "viewer";
    previewGrid.style.display = "none";
    viewer.style.display = "flex";
  }

  function openMedia(index) {
    currentIndex = index;
    const item = media[index];

    openViewerMode();

    if (item.type === "video") {
      viewerImage.style.display = "none";
      viewerVideo.style.display = "block";
      viewerVideo.src = item.src;
      // НЕ запускаем видео автоматически - ждем клика пользователя
    } else {
      viewerVideo.style.display = "none";
      viewerImage.style.display = "block";
      viewerImage.src = item.full;
    }
  }

  /* ---------- навигация в viewer ---------- */
  function next() {
    if (!media.length) return;
    viewerVideo.pause();
    currentIndex = (currentIndex + 1) % media.length;
    openMedia(currentIndex);
  }

  function prev() {
    if (!media.length) return;
    viewerVideo.pause();
    currentIndex = (currentIndex - 1 + media.length) % media.length;
    openMedia(currentIndex);
  }

  /* ---------- закрытие ---------- */
  function closeAction() {
    if (mode === "viewer") {
      viewerVideo.pause();
      viewerVideo.removeAttribute("src");
      openPreviewMode();
    } else {
      closeModal(lightbox);
      removeKeyListener();
      // Очистка данных
      media = [];
      currentIndex = 0;
      previewGrid.innerHTML = "";
      viewerImage.src = "";
    }
  }

  /* ---------- открытие проекта ---------- */
  async function openProject(folder) {
    previewGrid.innerHTML = "<p class='loading-text'>Загрузка...</p>";
    openPreviewMode();
    openModal(lightbox);
    addKeyListener();

    media = await loadMedia(folder);
    currentIndex = 0;

    if (!media.length) {
      previewGrid.innerHTML = `
        <div class="no-images">
          <i class="fas fa-image"></i>
          <p>Нет материалов для этого проекта</p>
        </div>
      `;
      return;
    }

    previewGrid.innerHTML = "";

    // Создаем миниатюры
    media.forEach((item, index) => {
      const thumbnail = document.createElement("div");
      thumbnail.className = "media-thumbnail";
      if (item.type === "video") {
        thumbnail.classList.add("video-thumbnail");
      }
      thumbnail.dataset.index = index;
      thumbnail.title =
        item.type === "video" ? `Видео: ${item.name}` : `Фото ${item.index}`;

      const img = document.createElement("img");
      img.src = item.preview || item.full;
      img.alt =
        item.type === "video"
          ? `Видео: ${item.name}`
          : `Фото проекта ${item.index}`;
      img.loading = "lazy";
      thumbnail.appendChild(img);

      // Добавляем иконку для видео
      if (item.type === "video") {
        thumbnail.insertAdjacentHTML(
          "beforeend",
          '<span class="play-icon">▶</span>',
        );
      }

      thumbnail.addEventListener("click", () => openMedia(index));
      previewGrid.appendChild(thumbnail);
    });
  }

  /* ---------- event listeners ---------- */
  // Открытие по клику на карточку проекта
  items.forEach((item) => {
    item.addEventListener("click", async () => {
      const folder = item.dataset.object;
      if (!folder) return;
      await openProject(folder);
    });
  });

  // Закрытие по клику на крестик
  lightbox.querySelector(".close").addEventListener("click", closeAction);

  // Закрытие по клику на фон
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeAction();
  });

  // Навигационные кнопки в viewer
  viewer.querySelector(".next")?.addEventListener("click", next);
  viewer.querySelector(".prev")?.addEventListener("click", prev);
}
