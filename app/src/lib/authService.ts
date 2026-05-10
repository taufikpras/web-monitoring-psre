import axios from 'axios';

// @ts-ignore - Runtime config injected by Docker
const API_BASE = window.ENV?.API_BASE_URL || '/api';
const API_URL = `${API_BASE}/users`;

export const authService = {
    setToken: (token: string, role: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
    },
    getToken: () => localStorage.getItem('token'),
    getRole: () => localStorage.getItem('role'),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
    },
    isTokenExpired: () => {
        const token = localStorage.getItem('token');
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp && payload.exp * 1000 < Date.now();
        } catch (e) {
            return true;
        }
    },
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        if (authService.isTokenExpired()) {
            authService.logout();
            return false;
        }
        return true;
    },
    isAdmin: () => localStorage.getItem('role') === 'admin',

    checkSetup: async () => {
        const res = await axios.get(`${API_URL}/setup-check`);
        return res.data.setup_required;
    },

    setupAdmin: async (data: any) => {
        return axios.post(`${API_URL}/setup-admin`, data);
    },

    register: async (data: any) => {
        return axios.post(`${API_URL}/register`, data);
    },

    login: async (data: FormData) => {
        const res = await axios.post(`${API_URL}/login`, data);
        return res.data;
    },

    getUsers: async () => {
        const res = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return res.data;
    },

    approveUser: async (id: string) => {
        return axios.put(`${API_URL}/${id}/approve`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    },

    updateRole: async (id: string, role: string) => {
        return axios.put(`${API_URL}/${id}/role`, { role }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    },

    deleteUser: async (id: string) => {
        return axios.delete(`${API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
    }
};
