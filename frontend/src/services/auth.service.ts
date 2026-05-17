import { api, getCsrfCooke } from "../api/axios"

export const authService = {
    async register(data: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        phone: string | null;
        city: string | null;
        //avatar: string | null;
    }) {
        await getCsrfCooke()
        const res = await api.post('/register', data);

        return res.data.user;
    },
    async login(email: string, password: string) {
        await getCsrfCooke()

        await api.post("/login", {
            email,
            password
        })

        return this.me()
    },

    async me() {
        const res = await api.get("/user") 
        return res.data     
    },

    async logout() {
        await api.post("/logout")
    }
}