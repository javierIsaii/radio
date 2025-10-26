document.addEventListener("DOMContentLoaded", function () {
    const animatedElements = document.querySelectorAll("[data-animate]");
    function animateElements() {
        animatedElements.forEach(function (element) {
            const delay = parseInt(element.getAttribute("data-delay-animate")) || 0;

            if (isElementInViewport(element)) {
                setTimeout(function () {
                    element.classList.add("animate");
                }, delay);
            } else {
                element.classList.remove("animate");
            }
        });
    }
    
    function isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom >= 0;
    }
    window.addEventListener("scroll", animateElements);
    window.addEventListener("resize", animateElements);
    animateElements();
});

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const elements = document.querySelectorAll(".welcomeLine, .anotherImg, .player-elements, .player-buttons, .card");
    elements.forEach((el, index) => {
      // Añadimos un pequeño delay incremental si querés efecto secuencial
      setTimeout(() => {
        el.classList.add("fade-in-up");
      }, index * 250); // cada elemento entra con 150ms de diferencia
    });
  }, 1800); // espera 1s antes de iniciar las apariciones
});



