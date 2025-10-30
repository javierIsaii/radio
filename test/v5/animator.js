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
    const elements = document.querySelectorAll(".welcomeLine, .anotherImg, .album-art, .track-info, .player-buttons, .card");
    
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add("fade-in-up");
      }, index * 250);
    });

    // Calculamos el tiempo total para disparar el último
    const totalTime = elements.length * 250;

    setTimeout(() => {
      const liveIndicator = document.querySelector(".live-status-container");
      if (liveIndicator) {
        liveIndicator.classList.add("fade-in-up-live");
      }
    }, totalTime + 250); // +250ms para que aparezca un poco después del último
  }, 2800);
});
