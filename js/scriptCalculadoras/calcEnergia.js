function calcularEnergia(inputs, results) {
    // const FATOR_EMISSAO_BR = 0.0716;

    const potencia = parseFloat(inputs.potencia.value) || 0;
    const quantidade = parseInt(inputs.quantidade.value) || 0;
    const horas = parseFloat(inputs.horas.value) || 0;
    const dias = parseInt(inputs.dias.value) || 0;
    const tarifa = parseFloat(inputs.tarifa.value.replace(',', '.')) || 0;

    const consumoMensal = (potencia * quantidade * horas * dias) / 1000;
    const custoEstimado = consumoMensal * tarifa;
    // const emissoesCO2 = consumoMensal * FATOR_EMISSAO_BR;

    results.consumo.textContent = `${consumoMensal.toFixed(2).replace('.', ',')} kWh`;
    results.custo.textContent = `R$ ${custoEstimado.toFixed(2).replace('.', ',')}`;
}

export function initEnergyCalculator() {
    const form = document.querySelector('#energia .calculator-form');
    if (!form) return;

    const inputs = {
        potencia: form.querySelector('#potencia'),
        quantidade: form.querySelector('#quantidade'),
        horas: form.querySelector('#horas'),
        dias: form.querySelector('#dias'),
        tarifa: form.querySelector('#tarifa')
    };

    const results = {
        consumo: form.querySelector('.results-box .result-item:nth-of-type(1) .negrito'),
        custo: form.querySelector('.results-box .result-item:nth-of-type(2) .negrito'),
        emissoes: form.querySelector('.results-box .result-item:nth-of-type(3) .negrito')
    };

    inputs.horas.addEventListener('input', () => {
        const valor = parseFloat(inputs.horas.value);
        if (valor < 0 || valor > 24) {
            inputs.horas.value = 24;
        }   
        calcularEnergia(inputs, results);
    });

    inputs.dias.addEventListener('input', () => {
        const valor = parseInt(inputs.dias.value, 10);
        if (valor < 0 || valor > 31) {
            inputs.dias.value = 31;
        }
        calcularEnergia(inputs, results);
    });

    Object.values(inputs).forEach(input => input.addEventListener('input', () => calcularEnergia(inputs, results)));

    calcularEnergia(inputs, results);
}