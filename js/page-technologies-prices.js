// js/page-technologies-prices.js
export function initPricesPage() {
  // ===== CSV ПАРСЕР (универсальный) =====
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

  // ===== ОБЩАЯ ЗАГРУЗКА CSV (с fallback) =====
  async function loadCSV(url, fallbackUrl = null) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Fetch error");
      let text = await res.text();

      // 🔥 фикс BOM
      text = text.replace(/^\uFEFF/, "");

      return text;
    } catch (e) {
      console.warn("Ошибка загрузки, пробуем fallback:", e);

      if (fallbackUrl) {
        const res = await fetch(fallbackUrl);
        let text = await res.text();
        return text.replace(/^\uFEFF/, "");
      }

      throw e;
    }
  }

  // ===== MAIN PRICE =====
  const priceOutput = document.getElementById("price-output");
  if (!priceOutput) return;

  loadCSV(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-PcOUHHy_cgnRnXMUVDU8DOE2ScrrE4PplRj8Pqow1xE6mLQRobdOBxW4oWaGgQGM5x7cpMzeJsAB/pub?gid=0&single=true&output=csv",
    "./prices-main.csv" // fallback
  )
    .then((csvText) => {
      priceOutput.innerHTML = "";

      const rows = csvText.split(/\r?\n/); // 🔥 фикс переносов

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
          categoryContainer.innerHTML = `<div style="text-align:center;font-weight:bold;font-size:20px;margin:25px 0 10px;border-bottom:2px solid #000">${category}</div>`;

          priceOutput.appendChild(categoryContainer);
          currentCategoryContainer = categoryContainer;
        }

        if (type && type !== "") {
          const cleanType = type.replace(/^!!!\s*/, "");

          if (cleanType !== currentType) {
            closeCurrentTable();
            currentType = cleanType;

            const typeDiv = document.createElement("div");
            typeDiv.textContent = cleanType;
            typeDiv.style.fontWeight = "bold";
            typeDiv.style.marginBottom = "10px";

            currentCategoryContainer.appendChild(typeDiv);
          }
        }

        if (name && !name.startsWith("!!!") && !name.startsWith("→")) {
          if (!currentTable) createNewTable();

          const serviceRow = document.createElement("tr");
          serviceRow.innerHTML = `
            <td>${name}</td>
            <td>${unit || "-"}</td>
            <td>${formatPrice(price)}</td>
          `;

          currentTbody.appendChild(serviceRow);
          hasData = true;
        }
      }

      closeCurrentTable();

      if (!hasData) {
        priceOutput.innerHTML = "Нет данных";
      }

      function createNewTable() {
        currentTable = document.createElement("table");
        currentTable.className = "price-responsive-table";

        currentTable.innerHTML = `
          <thead>
            <tr>
              <th>Наименование</th>
              <th>Ед.</th>
              <th>Цена</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;

        currentTbody = currentTable.querySelector("tbody");
        currentCategoryContainer.appendChild(currentTable);
      }

      function closeCurrentTable() {
        currentTable = null;
        currentTbody = null;
      }

      function formatPrice(p) {
        if (!p) return "-";
        return p.replace(/\s*грн\.?/gi, "").trim();
      }
    })
    .catch(() => {
      priceOutput.innerHTML = "Ошибка загрузки прайса";
    });

  // ===== SPECIAL PRICE =====
  const containers = {
    frez: document.getElementById("price-milling"),
    shlif: document.getElementById("price-grinding"),
    polir: document.getElementById("price-polishing"),
  };

  if (containers.frez || containers.shlif || containers.polir) {
    loadCSV(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vT-PcOUHHy_cgnRnXMUVDU8DOE2ScrrE4PplRj8Pqow1xE6mLQRobdOBxW4oWaGgQGM5x7cpMzeJsAB/pub?gid=2137597371&single=true&output=csv",
      "./prices-special.csv"
    )
      .then((csv) => {
        const rows = csv
          .split(/\r?\n/)
          .filter((r) => r.trim())
          .map((r) => parseCSVRow(r));

        rows.shift();

        rows.forEach((row) => {
          if (row.length < 5) return;

          const cat = row[0]?.toLowerCase();
          if (!containers[cat]) return;

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${row[1]}</td>
            <td>${row[2]}</td>
            <td>${row[3]}</td>
            <td>${row[4]}</td>
          `;

          if (!containers[cat].querySelector("table")) {
            containers[cat].innerHTML =
              "<table><tbody></tbody></table>";
          }

          containers[cat]
            .querySelector("tbody")
            .appendChild(tr);
        });
      })
      .catch(() => {
        console.error("Ошибка special price");
      });
  }
}
