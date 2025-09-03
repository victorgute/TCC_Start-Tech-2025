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
  const inputs = container.querySelectorAll("input");
  const resultados = container.querySelectorAll(".negrito")

  const resetMap = {
    valorMonetario: "R$ 0,00",
    energiaConsumida: "0,00 kWh",
    aguaConsumida: "0 L",
    residuosGerados: "0Kg",
    economiaPercentual: "0%"
  }

  resultados.forEach(item => {
    for (const classe in resetMap) {
      if (item.classList.contains(classe) && item.textContent !== resetMap[classe]) {
        item.textContent = resetMap[classe];
        break;
      }
    }
  })

  inputs.forEach(input => {
    if (input.id === 'tarifa' || input.id === 'agua-tarifa') return;
    input.value = "";
  });
}