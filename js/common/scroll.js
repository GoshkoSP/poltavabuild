/* ===============================
    Плавная прокрутка по якорям на всех страницах
=============================== */
// js/common/scroll.js

export function initScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            // вверх страницы
            if (targetId === '#' || targetId === '#home') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const headerOffset = 100;
            const y =
                target.getBoundingClientRect().top +
                window.pageYOffset -
                headerOffset;

            window.scrollTo({ top: y, behavior: 'smooth' });
        });
    });
}
// ===== все работает =====