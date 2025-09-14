import { getUserToken } from './auth.js';

// A URL BASE volta a ficar vazia, para que os pedidos sejam feitos para o mesmo domínio do site (CloudFront)
const API_BASE_URL = '';

const makeAuthenticatedRequest = async (endpoint, method = 'GET', body = null) => {
    const token = await getUserToken();
    if (!token) {
        console.error("Tentativa de fazer um pedido sem estar autenticado. A redirecionar para o login.");
        window.location.href = '/html/login.html';
        throw new Error("Utilizador não autenticado.");
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
        // O endpoint agora será algo como "/api/calculator", que o CloudFront irá capturar
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Resposta de erro da API:", errorText);
            throw new Error('Erro na resposta da API. Verifique o console para mais detalhes.');
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        }
        return response; // Para o caso do download
    } catch (error) {
        console.error(`Erro no pedido para ${method} ${endpoint}:`, error);
        throw error;
    }
};

export const fetchCalculatorData = () => makeAuthenticatedRequest('/api/calculator');
export const postCalculatorData = (payload) => makeAuthenticatedRequest('/api/calculator', 'POST', payload);
export const updateUserProfile = (payload) => makeAuthenticatedRequest('/api/profile', 'POST', payload);
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

