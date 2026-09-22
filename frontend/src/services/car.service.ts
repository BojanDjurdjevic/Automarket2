import { api } from '../api/axios';
import type { Car, PaginatedCars } from '../types/car.types';

export const carService = {

  async getAll(page = 1, query = '') {
    const res = await api.get(
      `/api/cars?page=${page}&${query}`
    );

    return res.data;
  },

  async getOne(id: number): Promise<Car> {
    const res = await api.get(`/api/cars/${id}`);
    return res.data.data;
  },

  async create(data: FormData) {
    const res = await api.post('/api/cars', data);
    return res.data.data;
  },

  async update(id: number, data: FormData) {
    data.append('_method', 'PUT');
    const res = await api.post(`/api/cars/${id}`, data);
    return res.data.data;
  },

  async delete(id: number) {
    await api.delete(`/api/cars/${id}`);
  },

  async deleteImage(carId: number, imageId: number) {
    await api.delete(
      `/api/cars/${carId}/images/${imageId}`
    );
  },

  async setPrimaryImage(carId: number, imageId: number) {
    await api.put(
      `/api/cars/${carId}/images/${imageId}/primary`
    );
  },

  async myCars(page = 1, search = '') {

    const params = new URLSearchParams();

    params.append('page', String(page));

    if (search.trim()) {
      params.append('search', search);
    }

    const res = await api.get(
      `/api/my-cars?${params.toString()}`
    );

    return res.data;
  },

  async getByFilter(query = ''): Promise<PaginatedCars> {
    const res = await api.get(`/api/cars?${query}`);
    return res.data;
  },

  async getByUser(userId: number) {

    const res = await api.get(
      `/api/users/${userId}/cars`
    );

    return res.data.data ?? res.data;
  },
};