type User = {
    id: number,
    name: string,
    email: string,
    email_verified_at: string | null,
    phone: string | null,
    city: string | null,
    avatar: string | null
}

class AuthStore {
    user: User | null = null

    setUser(user: User | null) {
        this.user = user
    }

    get isAuthenticated() {
        return !!this.user
    }

    get userId() {
        return this.user?.id;
    }

    isVerified(): boolean {
        return !!this.user?.email_verified_at;
    }
}

export const authStore = new AuthStore()