function calcularResiduos(inputs, results) {
    const reciclavel = parseFloat(inputs.reciclavel.value) || 0;
    const organico = parseFloat(inputs.organico.value) || 0;
    const rejeito = parseFloat(inputs.rejeito.value) || 0;

    const total = reciclavel + organico + rejeito;
    const taxa = total > 0 ? (reciclavel / total) * 100 : 0;

    results.total.textContent = `${total.toFixed(2).replace('.', ',')} kg`;
    results.taxa.textContent = `${taxa.toFixed(1).replace('.', ',')} %`;
}

export function initWasteCalculator() {
    const form = document.querySelector('#residuos .calculator-form');
    if (!form) return;

    const inputs = { 
        reciclavel: form.querySelector('#residuos-reciclavel'), 
        organico: form.querySelector('#residuos-organico'), 
        rejeito: form.querySelector('#residuos-rejeito') 
    };

    const results = { 
        total: form.querySelector('.results-box .result-item:nth-of-type(1) .negrito'), 
        taxa: form.querySelector('.results-box .result-item:nth-of-type(2) .negrito') 
    };

    Object.values(inputs).forEach(input => input.addEventListener('input', () => calcularResiduos(inputs, results)));

    calcularResiduos(inputs, results);
}