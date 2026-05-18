import { api } from '../api/axios';

export const profileService = {

  async me() {
    const res = await api.get('/profile');

    return res.data;
  }

};