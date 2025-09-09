// A variável API_BASE_URL foi descomentada.
const API_BASE_URL = ''; // Esta linha está correta para produção

const makeRequest = async (endpoint, method = 'GET', body = null) => {
    // A LÓGICA DO TOKEN FOI REMOVIDA PARA O TESTE
    const options = {
        method,
        headers: {
            // Nenhum cabeçalho de autorização é enviado
        }
    };

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Resposta de erro da API:", errorText);
            throw new Error('Erro na resposta da API.');
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        }
        return response;
    } catch (error) {
        console.error(`Erro no pedido para ${method} ${endpoint}:`, error);
        throw error;
    }
};

// As chamadas continuam a ser as mesmas, mas usarão a função sem autenticação
export const fetchCalculatorData = () => makeRequest('/api/calculator');
export const postCalculatorData = (payload) => makeRequest('/api/calculator', 'POST', payload);
export const saveDashboardConfig = (config) => makeRequest('/api/dashboard/config', 'POST', { config });
export const getDashboardConfig = () => makeRequest('/api/dashboard/config');
export const downloadDashboard = async () => {
    try {
        const response = await makeRequest('/api/dashboard/download');
        if (!response) return;

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ecomanager_data.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        alert(`Não foi possível fazer o download: ${error.message}`);
    }
};

