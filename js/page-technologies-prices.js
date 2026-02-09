// js/page-technologies-prices.js
export function initPricesPage() {
  // CSV parser
  function parseCSVRow(row) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const next = row[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // Проверяем наличие контейнера для таблицы
  const priceOutput = document.getElementById("price-output");
  if (!priceOutput) return; // Если элемента нет на странице - выходим

  // === Основной прайс (Main) ===
  fetch(
    "https://script.google.com/macros/s/AKfycbyHkdvhMjtuhUV4_7Vz9eTo2z3okpWouf3LIc_dSwaZkcBrfBSUakBVg8EllSTG-I8/exec?gid=0",
  )
    .then((response) => response.text())
    .then((csvText) => {
      priceOutput.innerHTML = "";

      const rows = csvText.split("\n");

      let currentCategory = "";
      let currentType = "";
      let currentTable = null;
      let currentTbody = null;
      let hasData = false;
      let currentCategoryContainer = null;

      // КАРТА ЯКОРЕЙ ПО ПОДРАЗДЕЛАМ
      const sectionAnchorByType = {
        "Фрезеровка полов": "polished-frezering",
        "Шлифовка полов": "polished-grinding",
        "Полировка полов": "polished-polishing",
        "Мозаичные полы терраццо (традиционное терраццо)": "terrazzo-floors",
        "Полированные бетонные полы": "polished-concrete-info",
        "Топпинговые полы": "topping-floors",
      };

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const cells = parseCSVRow(row);
        if (cells.length < 3) continue;

        const category = cells[0] || "";
        let type = cells[1] || "";
        const name = cells[2] || "";
        const unit = cells[3] || "";
        let price = cells[4] || "";

        if (!category && !name) continue;

        // === КАТЕГОРИЯ ===
        if (category && category !== currentCategory) {
          closeCurrentTable();

          currentCategory = category;
          currentType = "";

          const categoryContainer = document.createElement("div");
          categoryContainer.className = "price-category-container";
          categoryContainer.style.border = "1px solid #ddd";
          categoryContainer.style.padding = "15px";
          categoryContainer.style.margin = "30px 0 20px";
          categoryContainer.style.backgroundColor = "#fff";

          const categoryTitle = document.createElement("div");
          categoryTitle.style.textAlign = "center";
          categoryTitle.style.fontWeight = "bold";
          categoryTitle.style.fontSize = "20px";
          categoryTitle.style.margin = "25px 0 10px";
          categoryTitle.style.paddingBottom = "10px";
          categoryTitle.style.borderBottom = "2px solid #000";
          categoryTitle.textContent = category;

          categoryContainer.appendChild(categoryTitle);
          priceOutput.appendChild(categoryContainer);

          currentCategoryContainer = categoryContainer;
        }

        // === ПОДРАЗДЕЛ ===
        if (type && type !== "") {
          const isHighlightedType = type.startsWith("!!!");
          const cleanType = isHighlightedType
            ? type.replace(/^!!!\s*/, "")
            : type;

          if (cleanType !== currentType) {
            closeCurrentTable();
            currentType = cleanType;

            const typeDiv = document.createElement("div");
            typeDiv.textContent = cleanType;

            typeDiv.style.textAlign = "center";
            typeDiv.style.fontWeight = "bold";
            typeDiv.style.fontSize = "18px";
            typeDiv.style.marginBottom = "15px";

            // === ВИЗУАЛЬНОЕ ВЫДЕЛЕНИЕ ===
            if (isHighlightedType) {
              typeDiv.style.textAlign = "left";
              typeDiv.style.background = "#f5f5f5";
              typeDiv.style.padding = "10px 15px";
              typeDiv.style.borderLeft = "4px solid #000";
              typeDiv.style.color = "#000";
            } else {
              typeDiv.style.color = "#555";
            }

            currentCategoryContainer.appendChild(typeDiv);
          }
        }

        // === ПОЯСНЕНИЯ (начинаются с !!!) ===
        if (name.startsWith("!!!")) {
          const explanationDiv = document.createElement("div");
          explanationDiv.style.fontStyle = "italic";
          explanationDiv.style.fontWeight = "bold";
          explanationDiv.style.padding = "8px 0 8px 15px";
          explanationDiv.style.margin = "5px 0 15px 0";
          explanationDiv.style.fontSize = "14px";
          explanationDiv.textContent = name.replace(/^!!!\s*/, "");

          if (currentCategoryContainer) {
            currentCategoryContainer.appendChild(explanationDiv);
          } else {
            priceOutput.appendChild(explanationDiv);
          }
          continue;
        }

        // === НАВИГАЦИОННАЯ СТРОКА ===
        if (name.startsWith("→")) {
          const anchorId = sectionAnchorByType[currentType];
          if (anchorId) {
            const navDiv = document.createElement("div");
            navDiv.style.textAlign = "left";
            navDiv.style.margin = "10px 0 20px";
            navDiv.style.paddingLeft = "0.5em";

            const link = document.createElement("a");
            link.href = `#${anchorId}`;
            link.textContent = name.replace(/^→\s*/, "");
            link.style.fontSize = "14px";
            link.style.color = "#0066cc";
            link.style.textDecoration = "underline";

            navDiv.appendChild(link);
            currentCategoryContainer.appendChild(navDiv);
          }
          continue;
        }

        // === УСЛУГА ===
        if (name && name !== "") {
          if (!currentTable) createNewTable();

          const formattedPrice = formatPriceForDisplay(price);

          const serviceRow = document.createElement("tr");
          serviceRow.innerHTML = `
                    <td style="padding-left: 0.5em">${name}</td>
                    <td class="unit-col">${unit || "-"}</td>
                    <td class="price-col">${formattedPrice}</td>
                `;
          currentTbody.appendChild(serviceRow);
          hasData = true;
        }
      }

      closeCurrentTable();

      if (!hasData) {
        priceOutput.innerHTML =
          '<div style="text-align:center;padding:40px;color:#666">Нет данных</div>';
      }

      function createNewTable() {
        currentTable = document.createElement("table");
        currentTable.style.width = "100%";
        currentTable.style.borderCollapse = "collapse";
        currentTable.style.marginBottom = "25px";
        // ДОБАВЛЕН КЛАСС ДЛЯ СТИЛЕЙ
        currentTable.className = "price-responsive-table";

        const thead = document.createElement("thead");
        thead.innerHTML = `
                <tr>
                    <th style="text-align:left;padding:10px;border-bottom:2px solid #000;background:#f5f5f5">Наименование работ</th>
                    <th style="width:120px;text-align:center;padding:10px;border-bottom:2px solid #000;background:#f5f5f5">Ед.</th>
                    <th style="width:140px;text-align:right;padding:10px;border-bottom:2px solid #000;background:#f5f5f5">Цена, грн</th>
                </tr>
            `;
        currentTable.appendChild(thead);

        currentTbody = document.createElement("tbody");
        currentTable.appendChild(currentTbody);
        currentCategoryContainer.appendChild(currentTable);
      }

      function closeCurrentTable() {
        if (currentTable && currentTbody.children.length === 0) {
          currentTable.remove();
        }
        currentTable = null;
        currentTbody = null;
      }

      function formatPriceForDisplay(price) {
        if (!price) return "-";

        let p = price.replace(/^['"]+|['"]+$/g, "").trim();

        // Проверяем, начинается ли с "от"
        const hasFromPrefix = p.toLowerCase().startsWith("от");
        const originalP = p;

        // Убираем "от" для парсинга, но сохраняем его
        p = p.replace(/^от\s*/i, "");

        // Если есть знак % или дефис/тире
        if (originalP.includes("%")) return originalP.replace(/^\+/, "");
        if (originalP.includes("-") || originalP.includes("–")) {
          // Для диапазонов убираем "грн" если есть
          const withoutGryvnia = originalP.replace(/\s*грн\.?\s*/gi, "").trim();
          return withoutGryvnia;
        }

        // Пытаемся распарсить число
        const num = parseFloat(p.replace(",", ".").replace(/[^\d.-]/g, ""));

        if (!isNaN(num)) {
          // Форматируем число и НЕ добавляем "грн"
          const formattedNum = num.toFixed(2).replace(".", ",");
          return hasFromPrefix ? "от " + formattedNum : formattedNum;
        }

        // Если не число, убираем "грн" если есть и возвращаем
        const withoutGryvnia = originalP.replace(/\s*грн\.?\s*/gi, "").trim();
        return withoutGryvnia || originalP;
      }
    })
    .catch((err) => {
      console.error("Ошибка загрузки Main:", err);
      if (priceOutput) {
        priceOutput.innerHTML =
          '<div style="text-align:center;padding:40px;color:#e74c3c">Ошибка загрузки</div>';
      }
    });

  // === Специальный прайс (special_price) ===
  // === Специальный прайс (special_price) ===
  const hasSpecialPriceContainers =
    document.getElementById("price-milling") ||
    document.getElementById("price-grinding") ||
    document.getElementById("price-polishing");

  if (hasSpecialPriceContainers) {
    fetch(
      "https://script.google.com/macros/s/AKfycbzX9TN-XOTXF6dHtxfy7FaxDeWl6qhjZXfEB1L-jRuOyPLE564ic84PA_09_BL4lVqq/exec?gid=2137597371",
    )
      .then((response) => response.text())
      .then((csv) => {
        // Убираем BOM и лишние пробелы
        const csvClean = csv.replace(/^\uFEFF/, "").trim();

        // Разделяем строки, фильтруем пустые
        const rows = csvClean
          .split("\n")
          .filter((row) => row.trim())
          .map((r) => r.split(","));

        // Убираем заголовок
        if (rows.length > 0) rows.shift();

        // Контейнеры для таблиц на странице
        const containers = {
          frez: document.getElementById("price-milling"),
          shlif: document.getElementById("price-grinding"),
          polir: document.getElementById("price-polishing"),
        };

        // Таблицы
        const tables = {
          frez: `<table class="price-table price-responsive-table"><thead><tr>
                <th>Глубина / Этап</th><th>Описание</th><th>Технология / Износ</th><th>Цена (грн/м²)</th>
              </tr></thead><tbody>`,
          shlif: `<table class="price-table price-responsive-table"><thead><tr>
                <th>Этап</th><th>Описание</th><th>Технология / Износ</th><th>Цена (грн/м²)</th>
              </tr></thead><tbody>`,
          polir: `<table class="price-table price-responsive-table"><thead><tr>
                <th>Этап</th><th>Описание</th><th>Технология / Износ</th><th>Цена (грн/м²)</th>
              </tr></thead><tbody>`,
        };

        // Универсальная функция для очистки текста и форматирования цены
        function cleanCell(str) {
          if (!str) return "";
          return str.replace(/^"+|"+$/g, "").trim();
        }

        function formatPrice(str) {
          str = cleanCell(str);
          return str.replace(/\d+(?:,\d+)?/g, (match) => {
            const num = parseFloat(match.replace(",", "."));
            return num.toFixed(2);
          });
        }

        // Универсальный маппинг категорий
        const categoryMap = {
          frez: "frez",
          shlif: "shlif",
          polir: "polir",
        };

        // Проходим по всем строкам CSV
        rows.forEach((row) => {
          if (!row || row.length < 5) return;

          let category = cleanCell(row[0]).toLowerCase();
          const mappedKey = categoryMap[category];
          if (!mappedKey) return; // если категория не найдена, пропускаем

          const col1 = cleanCell(row[1]);
          const col2 = cleanCell(row[2]);
          const col3 = cleanCell(row[3]);
          const price = formatPrice(row[4]);

          tables[mappedKey] += `
          <tr>
            <td>${col1}</td>
            <td>${col2}</td>
            <td>${col3}</td>
            <td class="price-value">${price}</td>
          </tr>
        `;
        });

        // Закрываем таблицы и вставляем на страницу
        for (let cat in tables) {
          tables[cat] += "</tbody></table>";
          if (containers[cat]) containers[cat].innerHTML += tables[cat];
        }
      })
      .catch((err) => {
        console.error("Ошибка загрузки special_price:", err);
      });
  }
}
// ===== все работает =====