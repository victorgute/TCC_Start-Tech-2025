import { getUserToken } from './auth.js';

// CORREÇÃO IMPORTANTE: Removido o 'localhost'.
// Agora, o frontend fará as chamadas para o mesmo domínio onde ele está hospedado.
// Ex: se o site é 'd123.cloudfront.net', a chamada será para 'd123.cloudfront.net/api/calculator'.
// Vamos configurar o CloudFront mais tarde para redirecionar isso para o seu backend.
const API_BASE_URL = ''; 

const makeAuthenticatedRequest = async (endpoint, method = 'GET', body = null) => {
    const token = await getUserToken();
    if (!token) {
        console.error("Tentativa de fazer um pedido sem estar autenticado.");
        // CORREÇÃO: Redireciona para o caminho absoluto correto.
        window.location.href = '/html/login.html';
        return null;
    }

    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro na resposta da API');
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

export const fetchCalculatorData = () => makeAuthenticatedRequest('/api/calculator');
export const postCalculatorData = (payload) => makeAuthenticatedRequest('/api/calculator', 'POST', payload);
export const saveDashboardConfig = (config) => makeAuthenticatedRequest('/api/dashboard/config', 'POST', { config });
export const getDashboardConfig = () => makeAuthenticatedRequest('/api/dashboard/config');
export const downloadDashboard = async () => {
    try {
        const response = await makeAuthenticatedRequest('/api/dashboard/download');
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
