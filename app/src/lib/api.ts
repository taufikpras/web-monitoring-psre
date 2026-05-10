import { authService } from './authService';

// @ts-ignore - Runtime config injected by Docker
const API_BASE = window.ENV?.API_BASE_URL || '/api';

const handleResponse = async (res: Response) => {
    if (res.status === 401 || res.status === 403) {
        authService.logout();
        window.location.href = '/login';
        throw new Error("Session expired or unauthorized. Please log in again.");
    }

    // Check if response is JSON (even if status is 4xx/5xx, it might be a JSON error)
    const contentType = res.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!res.ok) {
        let errorMsg = `Error ${res.status}: ${res.statusText}`;
        if (isJson) {
            try {
                const err = await res.json();
                errorMsg = err.detail || err.message || JSON.stringify(err);
            } catch (e) {
                // Ignore parsing error for error response
            }
        } else {
            // Peek at text content for debugging if it's HTML (likely proxy/server error)
            try {
                const text = await res.text();
                console.error("Non-JSON Error Response:", text.substring(0, 500));
            } catch (e) { }
        }
        throw new Error(errorMsg);
    }

    if (isJson) {
        return res.json();
    }

    // Success but not JSON?
    const text = await res.text();
    console.error("Received non-JSON success response:", text.substring(0, 500));
    throw new Error(`Expected JSON but got ${contentType}`);
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    if (authService.isTokenExpired()) {
        authService.logout();
        window.location.href = '/login';
        throw new Error("Session expired.");
    }

    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(url, { ...options, headers });
};

export const api = {
    getReport24H: async () => {
        const res = await fetchWithAuth(`${API_BASE}/report/show_va_report_24h`);
        return handleResponse(res);
    },

    getData: async (searchDn?: string) => {
        const query = searchDn ? `?search_dn=${encodeURIComponent(searchDn)}` : '';
        const res = await fetchWithAuth(`${API_BASE}/data/${query}`);
        return handleResponse(res);
    },

    deleteData: async (dn: string, keyid: string) => {
        const query = `?dn=${encodeURIComponent(dn)}&keyid=${encodeURIComponent(keyid)}`;
        const res = await fetchWithAuth(`${API_BASE}/data/${query}`, { method: 'DELETE' });
        return handleResponse(res);
    },

    deleteAllData: async () => {
        const res = await fetchWithAuth(`${API_BASE}/data/`, { method: 'DELETE' });
        return handleResponse(res);
    },

    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetchWithAuth(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
        });
        return handleResponse(res);
    },

    checkCrlVerifier: async () => {
        const res = await fetchWithAuth(`${API_BASE}/verifier/crl_verifier`);
        return handleResponse(res);
    },

    checkOcspVerifier: async () => {
        const res = await fetchWithAuth(`${API_BASE}/verifier/ocsp_verifier`);
        return handleResponse(res);
    },

    getFiles: async () => {
        const res = await fetchWithAuth(`${API_BASE}/list_file`);
        return handleResponse(res);
    },

    deleteFile: async (dn: string, keyid: string) => {
        const query = `?dn=${encodeURIComponent(dn)}&keyid=${encodeURIComponent(keyid)}`;
        const res = await fetchWithAuth(`${API_BASE}/delete_file${query}`, { method: 'DELETE' });
        return handleResponse(res);
    },

    deleteAllFiles: async () => {
        const res = await fetchWithAuth(`${API_BASE}/delete_all`, { method: 'DELETE' });
        return handleResponse(res);
    },

    getVAReport24h: async () => {
        const res = await fetchWithAuth(`${API_BASE}/report/show_va_report_24h`);
        return handleResponse(res);
    },

    getStats: async () => {
        const res = await fetchWithAuth(`${API_BASE}/stat`);
        return handleResponse(res);
    },

    getTickets: async (status: 'open' | 'closed' = 'open') => {
        const res = await fetchWithAuth(`${API_BASE}/tickets?status=${status}`);
        return handleResponse(res);
    },
    getVersion: async () => {
        const res = await fetchWithAuth(`${API_BASE}/version`);
        return handleResponse(res);
    },
    getAgentStatus: async () => {
        const res = await fetchWithAuth(`${API_BASE}/agent/status`);
        return handleResponse(res);
    },
    getAgentTasks: async () => {
        const res = await fetchWithAuth(`${API_BASE}/agent/tasks`);
        return handleResponse(res);
    }
};
