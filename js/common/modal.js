// js/common/modal.js

let activeModal = null;

function lockScroll() {
  document.body.style.overflow = "hidden";
}

function unlockScroll() {
  document.body.style.overflow = "";
}

export function openModal(modal) {
  if (!modal) return;

  if (activeModal && activeModal !== modal) {
    closeModal(activeModal);
  }

  modal.classList.add("open");
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");

  modal.setAttribute("tabindex", "-1");
  modal.focus();

  lockScroll();
  activeModal = modal;
}

export function closeModal(modal = activeModal) {
  if (!modal) return;

  modal.classList.remove("open");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");

  unlockScroll();
  activeModal = null;
}

export function getActiveModal() {
  return activeModal;
}
// ===== все работает =====