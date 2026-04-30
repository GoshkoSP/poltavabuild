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

  const priceOutput = document.getElementById("price-output");
  if (!priceOutput) return;

  // ID Google таблицы
  const SPREADSHEET_ID = "2PACX-1vT-PcOUHHy_cgnRnXMUVDU8DOE2ScrrE4PplRj8Pqow1xE6mLQRobdOBxW4oWaGgQGM5x7cpMzeJsAB";
  
  // Загружаем данные через Google Sheets API (без CORS проблем)
  function loadGoogleSheet(gid, callback) {
    const url = `https://docs.google.com/spreadsheets/d/e/${SPREADSHEET_ID}/pub?gid=${gid}&single=true&output=csv`;
    
    // Используем fetch с режимом no-cors
    fetch(url, { mode: 'no-cors' })
      .then(response => response.text())
      .then(csvText => callback(csvText))
      .catch(() => {
        // Если fetch не работает, создаем скрытый iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        setTimeout(() => {
          document.body.removeChild(iframe);
          priceOutput.innerHTML = '<div style="text-align:center;padding:40px;color:#e74c3c">Ошибка загрузки. Нажмите Enter в адресной строке для перезагрузки страницы</div>';
        }, 3000);
      });
  }

  // === ОСНОВНОЙ ПРАЙС (gid=0) ===
  const mainUrl = `https://docs.google.com/spreadsheets/d/e/${SPREADSHEET_ID}/pub?gid=0&single=true&output=csv`;
  
  fetch(mainUrl)
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.text();
    })
    .then(csvText => {
      priceOutput.innerHTML = "";
      const rows = csvText.split(/\r?\n/);

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
          }
          continue;
        }

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
        priceOutput.innerHTML = '<div style="text-align:center;padding:40px;color:#666">Нет данных</div>';
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
      console.error("Ошибка:", err);
      priceOutput.innerHTML = `
        <div style="text-align:center;padding:40px">
          <p style="color:#e74c3c">Не удалось загрузить прайс</p>
          <p style="font-size:14px;color:#666">Проверьте настройки публикации Google Sheets:</p>
          <ol style="text-align:left;display:inline-block;font-size:13px">
            <li>Файл → Поделиться → Опубликовать в интернете</li>
            <li>Выбрать лист "Main" → Опубликовать</li>
            <li>Нажать "Опубликовать"</li>
          </ol>
        </div>
      `;
    });

  // === СПЕЦИАЛЬНЫЙ ПРАЙС (gid=2137597371) ===
  const specialContainers = {
    frez: document.getElementById("price-milling"),
    shlif: document.getElementById("price-grinding"),
    polir: document.getElementById("price-polishing"),
  };

  if (specialContainers.frez || specialContainers.shlif || specialContainers.polir) {
    const specialUrl = `https://docs.google.com/spreadsheets/d/e/${SPREADSHEET_ID}/pub?gid=2137597371&single=true&output=csv`;
    
    fetch(specialUrl)
      .then(response => response.text())
      .then(csv => {
        const csvClean = csv.replace(/^\uFEFF/, "").trim();
        const rows = csvClean.split(/\r?\n/).filter(row => row.trim()).map(r => r.split(","));
        if (rows.length > 0 && rows[0][0] === "Категория") rows.shift();

        // Очищаем контейнеры
        Object.values(specialContainers).forEach(c => { if (c) c.innerHTML = ""; });

        const grouped = { frez: [], shlif: [], polir: [] };
        
        rows.forEach(row => {
          if (row.length < 5) return;
          let cat = row[0]?.toLowerCase().replace(/"/g, '').trim();
          if (grouped[cat]) {
            grouped[cat].push({
              col1: row[1]?.replace(/"/g, '') || "",
              col2: row[2]?.replace(/"/g, '') || "",
              col3: row[3]?.replace(/"/g, '') || "",
              price: row[4]?.replace(/"/g, '') || ""
            });
          }
        });

        const headers = {
          frez: ["Глубина / Этап", "Описание", "Технология / Износ", "Цена (грн/м²)"],
          shlif: ["Этап", "Описание", "Технология / Износ", "Цена (грн/м²)"],
          polir: ["Этап", "Описание", "Технология / Износ", "Цена (грн/м²)"]
        };

        for (let cat of ["frez", "shlif", "polir"]) {
          const container = specialContainers[cat];
          if (container && grouped[cat].length > 0) {
            const table = document.createElement("table");
            table.className = "price-table price-responsive-table";
            table.innerHTML = `<thead><tr>${headers[cat].map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody></tbody>`;
            const tbody = table.querySelector("tbody");
            grouped[cat].forEach(item => {
              const row = tbody.insertRow();
              row.insertCell(0).textContent = item.col1;
              row.insertCell(1).textContent = item.col2;
              row.insertCell(2).textContent = item.col3;
              row.insertCell(3).textContent = item.price;
              if (row.cells[3]) row.cells[3].className = "price-value";
            });
            container.appendChild(table);
          } else if (container) {
            container.innerHTML = '<p style="color:#999;text-align:center">Нет данных</p>';
          }
        }
      })
      .catch(err => console.error("Special price error:", err));
  }
}
