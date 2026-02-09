// js/common/form.js
let formInitialized = false;

export function initForm() {
  if (formInitialized) return;

  const form = document.getElementById("contactForm");
  if (!form) return;

  formInitialized = true;

  const submitBtn = form.querySelector(".submit-btn");
  const originalText = submitBtn.textContent;
  const originalBackground = submitBtn.style.backgroundColor;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("SUBMIT HANDLER FROM form.js");

    if (submitBtn.disabled) return;

    // Добавляем класс loading
    submitBtn.classList.remove("success", "error");
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    submitBtn.textContent = "Отправка…";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      const result = await response.json();

      if (result.success) {
        // Успешная отправка
        submitBtn.classList.remove("loading");
        submitBtn.classList.add("success");
        submitBtn.textContent = "Отправлено ✓";
        form.reset();
      } else {
        throw new Error("Ошибка отправки");
      }
    } catch {
      // Ошибка отправки
      submitBtn.classList.remove("loading");
      submitBtn.classList.add("error");
      submitBtn.textContent = "Ошибка";
    }

    setTimeout(() => {
      submitBtn.classList.remove("loading", "success", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      if (originalBackground) {
        submitBtn.style.backgroundColor = originalBackground;
      }
    }, 3000);
  });
}
