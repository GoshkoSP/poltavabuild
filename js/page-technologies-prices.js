// js/page-technologies-prices.js
export function initPricesPage() {
  // ===== CSV ПАРСЕР =====
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

  // ===== ЗАГРУЗКА CSV =====
  async function loadCSV(url) {
    try {
      console.log("Загрузка:", url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let text = await res.text();
      text = text.replace(/^\uFEFF/, "");
      console.log(`Загружено ${text.length} символов из ${url}`);
      return text;
    } catch (e) {
      console.error(`Ошибка загрузки ${url}:`, e);
      throw e;
    }
  }

  // ===== ФОРМАТИРОВАНИЕ ЦЕНЫ =====
  function formatPriceForDisplay(price) {
    if (!price) return "-";

    let p = price.replace(/^['"]+|['"]+$/g, "").trim();

    const hasFromPrefix = p.toLowerCase().startsWith("от");
    const originalP = p;

    p = p.replace(/^от\s*/i, "");

    if (originalP.includes("%")) return originalP.replace(/^\+/, "");
    if (originalP.includes("-") || originalP.includes("–")) {
      const withoutGryvnia = originalP.replace(/\s*грн\.?\s*/gi, "").trim();
      return withoutGryvnia;
    }

    const num = parseFloat(p.replace(",", ".").replace(/[^\d.-]/g, ""));

    if (!isNaN(num)) {
      const formattedNum = num.toFixed(2).replace(".", ",");
      return hasFromPrefix ? "от " + formattedNum : formattedNum;
    }

    const withoutGryvnia = originalP.replace(/\s*грн\.?\s*/gi, "").trim();
    return withoutGryvnia || originalP;
  }

  // ===== MAIN PRICE =====
  const priceOutput = document.getElementById("price-output");
  if (!priceOutput) {
    console.log("Контейнер price-output не найден");
    return;
  }

  // Пробуем загрузить CSV файл из корня
  loadCSV("./prices-main.csv")
    .then((csvText) => {
      console.log("CSV загружен, начинаем парсинг...");
      priceOutput.innerHTML = "";

      const rows = csvText.split(/\r?\n/);
      console.log("Найдено строк:", rows.length);

      let currentCategory = "";
      let currentType = "";
      let currentTable = null;
      let currentTbody = null;
      let hasData = false;
      let currentCategoryContainer = null;

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
          const cleanType = isHighlightedType ? type.replace(/^!!!\s*/, "") : type;

          if (cleanType !== currentType) {
            closeCurrentTable();
            currentType = cleanType;

            const typeDiv = document.createElement("div");
            typeDiv.textContent = cleanType;
            typeDiv.style.textAlign = "center";
            typeDiv.style.fontWeight = "bold";
            typeDiv.style.fontSize = "18px";
            typeDiv.style.marginBottom = "15px";

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
        priceOutput.innerHTML = '<div style="text-align:center;padding:40px;color:#666">Нет данных. Проверьте файл prices-main.csv</div>';
      } else {
        console.log("Прайс успешно загружен!");
      }

      function createNewTable() {
        currentTable = document.createElement("table");
        currentTable.style.width = "100%";
        currentTable.style.borderCollapse = "collapse";
        currentTable.style.marginBottom = "25px";
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
        if (currentTable && currentTbody && currentTbody.children.length === 0) {
          currentTable.remove();
        }
        currentTable = null;
        currentTbody = null;
      }
    })
    .catch((err) => {
      console.error("Ошибка загрузки Main:", err);
      if (priceOutput) {
        priceOutput.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c">Ошибка загрузки прайса. Убедитесь, что файл <strong>prices-main.csv</strong> находится в корне сайта.</div>';
      }
    });

  // ===== SPECIAL PRICE =====
  const specialContainers = {
    frez: document.getElementById("price-milling"),
    shlif: document.getElementById("price-grinding"),
    polir: document.getElementById("price-polishing"),
  };

  const hasSpecialPriceContainers = specialContainers.frez || specialContainers.shlif || specialContainers.polir;

  if (hasSpecialPriceContainers) {
    loadCSV("./prices-special.csv")
      .then((csv) => {
        console.log("Special CSV загружен, парсим...");
        
        const rows = csv
          .split(/\r?\n/)
          .filter((row) => row.trim())
          .map((row) => parseCSVRow(row));

        // Убираем заголовок если есть
        if (rows.length > 0 && rows[0][0] === "Категория") {
          rows.shift();
        }

        console.log("Спец-строк найдено:", rows.length);

        // Очищаем контейнеры
        for (let cat in specialContainers) {
          if (specialContainers[cat]) {
            specialContainers[cat].innerHTML = "";
          }
        }

        // Группируем по категориям
        const groupedData = {
          frez: [],
          shlif: [],
          polir: []
        };

        rows.forEach((row) => {
          if (!row || row.length < 5) return;
          
          let category = row[0]?.toLowerCase().trim();
          if (category === "frez" || category === "shlif" || category === "polir") {
            groupedData[category].push({
              col1: row[1] || "",
              col2: row[2] || "",
              col3: row[3] || "",
              price: row[4] || ""
            });
          }
        });

        // Создаем таблицы для каждой категории
        const headers = {
          frez: ["Глубина / Этап", "Описание", "Технология / Износ", "Цена (грн/м²)"],
          shlif: ["Этап", "Описание", "Технология / Износ", "Цена (грн/м²)"],
          polir: ["Этап", "Описание", "Технология / Износ", "Цена (грн/м²)"]
        };

        for (let cat of ["frez", "shlif", "polir"]) {
          const container = specialContainers[cat];
          if (container && groupedData[cat].length > 0) {
            const table = document.createElement("table");
            table.className = "price-table price-responsive-table";
            
            // Создаем заголовок
            const thead = document.createElement("thead");
            const headerRow = document.createElement("tr");
            headers[cat].forEach(header => {
              const th = document.createElement("th");
              th.textContent = header;
              headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Создаем тело таблицы
            const tbody = document.createElement("tbody");
            groupedData[cat].forEach(item => {
              const tr = document.createElement("tr");
              
              const td1 = document.createElement("td");
              td1.textContent = item.col1;
              tr.appendChild(td1);
              
              const td2 = document.createElement("td");
              td2.textContent = item.col2;
              tr.appendChild(td2);
              
              const td3 = document.createElement("td");
              td3.textContent = item.col3;
              tr.appendChild(td3);
              
              const td4 = document.createElement("td");
              td4.textContent = item.price;
              td4.className = "price-value";
              tr.appendChild(td4);
              
              tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.appendChild(table);
            console.log(`Таблица ${cat} создана, строк: ${groupedData[cat].length}`);
          } else if (container) {
            container.innerHTML = '<p style="color:#999;text-align:center;">Нет данных</p>';
          }
        }
      })
      .catch((err) => {
        console.error("Ошибка special price:", err);
        for (let cat in specialContainers) {
          if (specialContainers[cat]) {
            specialContainers[cat].innerHTML = '<p style="color:#e74c3c;text-align:center;">Ошибка загрузки</p>';
          }
        }
      });
  }
}
