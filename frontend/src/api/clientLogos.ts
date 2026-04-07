import api from './api';

export interface ClientLogo {
    id: number;
    caption: string;
    logo: string;
    site_link?: string;
    is_active: boolean;
    created_at: string;
}

export const listClientLogos = async (params = {}) => {
    return api.get<ClientLogo[]>('/api/client-logos/', { params });
};

export const getClientLogo = async (id: number) => {
    return api.get<ClientLogo>(`/api/client-logos/${id}/`);
};

export const createClientLogo = async (data: Partial<ClientLogo>) => {
    return api.post<ClientLogo>('/api/client-logos/', data);
};

export const updateClientLogo = async (id: number, data: Partial<ClientLogo>) => {
    return api.patch<ClientLogo>(`/api/client-logos/${id}/`, data);
};

export const deleteClientLogo = async (id: number) => {
    return api.delete(`/api/client-logos/${id}/`);
};
