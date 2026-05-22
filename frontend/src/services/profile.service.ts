import { api } from '../api/axios';

export const profileService = {

  async me() {
    const res = await api.get('/profile');

    return res.data;
  },

  async update(data: any) {

    const res = await api.put('/profile', data);

    return res.data;
  },

  async changePassword(data: any) {

    const res = await api.put('/profile/password', data);

    return res.data;
  },

  async deleteAccount() {

    const res = await api.delete('/profile');

    return res.data;
  }

};