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
            const downloadType = targetButton.dataset.type;

            if (!canvas || !canvas.id) return;

            const chartKey = canvas.id.replace('Chart', '');
            const chartInstance = charts[chartKey];

            if (!chartInstance) return;

            // Pega o título do gráfico (mês)
            const dynamicTitle = chartInstance.options.plugins.title.text;
            const finalFileName = dynamicTitle 
                ? `${baseChartTitle} ${dynamicTitle}` 
                : baseChartTitle;

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

  // Preenche o fundo com branco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  // Desenha o gráfico original sobre o fundo branco
  ctx.drawImage(originalCanvas, 0, 0);

  // Gera a imagem a partir do canvas temporário e dispara o download
  const image = tempCanvas.toDataURL('image/jpeg', 1.0);
  const link = document.createElement('a');
  link.href = image;
  link.download = `${chartTitle.replace(/\s+/g, '_').toLowerCase()}.jpg`;
  link.click();
}

function downloadChartAsPDF(chartInstance, chartTitle) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    
    const image = chartInstance.canvas.toDataURL('image/png');
    const imgProps = doc.getImageProperties(image);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    doc.text(chartTitle, 14, 15);
    doc.addImage(image, 'PNG', 10, 25,);
    doc.save(`${chartTitle.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}