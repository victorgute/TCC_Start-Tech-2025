import { charts } from './charts.js'; // CORRIGIDO: Importa de 'charts.js'

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
            
            const dynamicTitle = chartInstance.options.plugins.title.text;
            const finalFileName = dynamicTitle ? `${baseChartTitle} ${dynamicTitle}` : baseChartTitle;

            if (downloadType === 'jpg') {
                downloadChartAsJPG(chartInstance, finalFileName);
            } else if (downloadType === 'pdf') {
                downloadChartAsPDF(chartInstance, finalFileName);
            }
        });
    });
}

function downloadChartAsJPG(chartInstance, chartTitle) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = chartInstance.canvas.width;
  tempCanvas.height = chartInstance.canvas.height;
  const ctx = tempCanvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  ctx.drawImage(chartInstance.canvas, 0, 0);
  const image = tempCanvas.toDataURL('image/jpeg', 1.0);
  
  const link = document.createElement('a');
  link.href = image;
  link.download = `${chartTitle.replace(/\s+/g, '_').toLowerCase()}.jpg`;
  link.click();
}

function downloadChartAsPDF(chartInstance, chartTitle) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = chartInstance.canvas.width;
    tempCanvas.height = chartInstance.canvas.height;
    const ctx = tempCanvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(chartInstance.canvas, 0, 0);

    const image = tempCanvas.toDataURL('image/png');
    const imgProps = doc.getImageProperties(image);
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * (pdfWidth - 20)) / imgProps.width;

    doc.text(chartTitle, 14, 15);
    doc.addImage(image, 'PNG', 10, 25, pdfWidth - 20, pdfHeight);
    doc.save(`${chartTitle.replace(/\s+/g, '_').toLowerCase()}.pdf`);
}