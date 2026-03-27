import { apiClient } from './apiClient';
import { ToaNha } from '@/types';

export const toaNhaService = {
    getAll: async () => {
        const data = await apiClient<any[]>('/toa-nha');
        return data.map(item => ({ ...item, _id: item.id.toString() })) as ToaNha[];
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/toa-nha/${id}`);
        return { ...data, _id: data.id.toString() } as ToaNha;
    },

    create: async (data: Partial<ToaNha>) => {
        const res = await apiClient<any>('/toa-nha', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as ToaNha;
    },

    update: async (id: number | string, data: Partial<ToaNha>) => {
        const res = await apiClient<any>(`/toa-nha/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as ToaNha;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/toa-nha/${id}`, {
            method: 'DELETE',
        });
    }
};
