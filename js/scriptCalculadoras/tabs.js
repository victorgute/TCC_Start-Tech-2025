export function initCalculatorTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;
      tabButtons.forEach(btn => btn.classList.remove("active"));
      tabContents.forEach(content => content.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(targetTab)?.classList.add("active");

      tabContents.forEach(content => {
        if (content.id !== targetTab) {
          limparCampos(content);
        }
      });
    });
  });
}

function limparCampos(container) {
  const inputs = container.querySelectorAll("input, select, textarea");
  inputs.forEach(input => {
    if (input.id === 'tarifa' || input.id === 'agua-tarifa') return;
    input.value = "";
  });
}