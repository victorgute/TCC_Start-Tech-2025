function calcularAgua(inputs, results) {
    const consumoM3 = parseFloat(inputs.consumo.value) || 0;
    const tarifa = parseFloat(inputs.tarifa.value.replace(',', '.')) || 0;
    const economia = parseFloat(inputs.economia.value) || 0;

    const custoEstimado = consumoM3 * tarifa;
    const economiaEstimada = economia * tarifa;
    const consumoTotal = consumoM3 * 1000;
    const consumoReal = consumoTotal - (economia * 1000);

    results.custo.textContent = `${custoEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    results.economia.textContent = `${Math.abs(economiaEstimada).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
    results.consumoTotal.textContent = `${consumoTotal.toLocaleString('pt-BR')} L`;
    results.consumoReal.textContent = `${consumoReal.toLocaleString('pt-BR')} L`;
}

export function initWaterCalculator() {
    const form = document.querySelector('#agua .calculator-form');
    if (!form) return;

    const inputs = {
        consumo: form.querySelector('#agua-consumo'),
        economia: form.querySelector('#agua-reutilizada'),
        tarifa: form.querySelector('#agua-tarifa')
    };

    const results = {
        custo: form.querySelector('.results-box .result-item:nth-of-type(1) .negrito'),
        economia: form.querySelector('.results-box .result-item:nth-of-type(2) .negrito'),
        consumoTotal: form.querySelector('.results-box .result-item:nth-of-type(3) .negrito'),
        consumoReal: form.querySelector('.results-box .result-item:nth-of-type(4) .negrito')
    };

    Object.values(inputs).forEach(input => input.addEventListener('input', () => calcularAgua(inputs, results)));

    calcularAgua(inputs, results);
}