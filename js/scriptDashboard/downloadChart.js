import { charts } from './initDashboards.js';

export function initChartDownload() {
    const downloadButtons = document.querySelectorAll('.download-buttons button');

    downloadButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const targetButton = event.currentTarget;
            const chartCard = targetButton.closest('.chart-card');
            if (!chartCard) return;

            const canvas = chartCard.querySelector('canvas');
            const baseChartTitle = chartCard.querySelector('h4').textContent;
            const downloadType = targetButton.dataset.type; // 'jpg' ou 'pdf'

            if (!canvas || !canvas.id) return;

            const chartKey = canvas.id.replace('Chart', '');
            const chartInstance = charts[chartKey];

            if (!chartInstance) return;

            // Pega o título dinâmico do gráfico (ex: "Janeiro 2025")
            const dynamicTitle = chartInstance.options.plugins.title.text;
            
            // Cria o nome final do arquivo: combina o título base com o título dinâmico (que já contém o ano).
            const finalFileName = dynamicTitle ? `${baseChartTitle} ${dynamicTitle}` : baseChartTitle;

            // Chama a função de download apropriada com base no tipo (jpg ou pdf)
            if (downloadType === 'jpg') {
                downloadChartAsJPG(chartInstance, finalFileName);
            } else if (downloadType === 'pdf') {
                downloadChartAsPDF(chartInstance, finalFileName);
            }
        });
    });
}

function downloadChartAsJPG(chartInstance, chartTitle) {
  const originalCanvas = chartInstance.canvas;

  // Cria um canvas temporário para adicionar o fundo branco
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = originalCanvas.width;
  tempCanvas.height = originalCanvas.height;

  const ctx = tempCanvas.getContext('2d');

  // 1. Preenche o fundo do canvas temporário com a cor branca.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // 2. Desenha a imagem do gráfico original sobre o fundo branco.
  ctx.drawImage(originalCanvas, 0, 0);

  // 3. Gera a imagem em formato JPG a partir do canvas temporário.
  const image = tempCanvas.toDataURL('image/jpeg', 1.0);
  
  // 4. Cria um link temporário para iniciar o download.
  const link = document.createElement('a');
  link.href = image;
  link.download = `${chartTitle.replace(/\s+/g, '_').toLowerCase()}.jpg`;
  link.click();
}

function downloadChartAsPDF(chartInstance, chartTitle) {
    const { jsPDF } = window.jspdf;
    // Inicializa o construtor de PDF no formato A4.
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    
    // Cria um canvas temporário para adicionar o fundo branco
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = chartInstance.canvas.width;
    tempCanvas.height = chartInstance.canvas.height;

    const ctx = tempCanvas.getContext('2d');

    // 1. Preenche o fundo do canvas temporário com a cor branca.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 2. Desenha a imagem do gráfico original sobre o fundo branco.
    ctx.drawImage(chartInstance.canvas, 0, 0);

    // 3. Gera a imagem em formato PNG a partir do canvas temporário.
    const image = tempCanvas.toDataURL('image/png');

    // Calcula as dimensões proporcionais da imagem para caber na largura da página A4, com margens.
    const imgProps = doc.getImageProperties(image);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * (pdfWidth - 20)) / imgProps.width;

    // Adiciona o título e a imagem ao documento PDF.
    doc.text(chartTitle, 14, 15);
    doc.addImage(image, 'PNG', 10, 25, pdfWidth - 20, pdfHeight);
    // Salva o documento PDF com um nome de arquivo formatado.
    doc.save(`${chartTitle.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}