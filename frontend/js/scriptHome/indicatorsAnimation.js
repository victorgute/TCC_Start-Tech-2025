export function initIndicatorsAnimation() {
  const indicatorCards = document.querySelectorAll(".indicators .card");
  if (indicatorCards.length === 0) return;
  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observerInstance.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });
  indicatorCards.forEach(card => {
    observer.observe(card);
  });
}