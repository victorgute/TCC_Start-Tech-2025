function calcularTI(inputs, results) {
    const descartados = parseInt(inputs.descartados.value) || 0;
    const reaproveitados = parseInt(inputs.reaproveitados.value) || 0;

    const taxa = descartados > 0 ? (reaproveitados / descartados) * 100 : 0;

    results.taxa.textContent = `${taxa.toFixed(1).replace('.', ',')} %`;
}

export function initTICalculator() {
    const form = document.querySelector('#ti .calculator-form');
    if (!form) return;

    const inputs = { 
        descartados: form.querySelector('#ti-descartados'), 
        reaproveitados: form.querySelector('#ti-reaproveitados') 
    };

    const results = { 
        taxa: form.querySelector('.results-box .result-item:nth-of-type(1) strong') 
    };

    Object.values(inputs).forEach(input => input.addEventListener('input', () => calcularTI(inputs, results)));

    calcularTI(inputs, results);
}