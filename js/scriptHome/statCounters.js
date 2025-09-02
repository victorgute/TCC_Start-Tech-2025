export function initStatCounters() {
  const stats = document.querySelectorAll(".stat-item");
  if (stats.length === 0) return;
  const animateCount = (element) => {
    const target = +element.dataset.target;
    const suffix = element.dataset.suffix || "";
    const duration = 2000;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      element.textContent = Math.floor(progress * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else element.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };
  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        const strongElement = entry.target.querySelector("strong[data-target]");
        if (strongElement && !strongElement.dataset.counted) {
          strongElement.dataset.counted = "true";
          animateCount(strongElement);
        }
        observerInstance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  stats.forEach(stat => observer.observe(stat));
}