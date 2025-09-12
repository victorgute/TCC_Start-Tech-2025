export function initFeaturesAnimation() {
  const featureCards = document.querySelectorAll(".features .card");
  if (featureCards.length === 0) return;
  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observerInstance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  featureCards.forEach(card => observer.observe(card));
}