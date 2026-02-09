// js/app.js
import { initMenu } from "./common/menu.js";
import { initScroll } from "./common/scroll.js";
import { initForm } from "./common/form.js";

import { initIndexPage } from "./page-index.js";
import { initVideoPage } from "./page-video.js";
import { initTechnologiesPage } from "./page-technologies.js";
import { initPricesPage } from "./page-technologies-prices.js";
import { initOurProjects } from "./page_our_projects.js";

document.addEventListener("DOMContentLoaded", () => {
  // Общие модули
  initMenu();
  initScroll();
  initForm();

  // Страничные модули
  initIndexPage();
  initVideoPage();
  initTechnologiesPage();
  initPricesPage();
  initOurProjects();
});
