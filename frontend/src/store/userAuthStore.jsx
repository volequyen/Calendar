import { create } from "zustand";
import axiosPrivate from "../apis/axios";

export const userAuthStore = create((set, get) => ({
    email: null,
    user_id: null,
    setEmail: (email) => set({ email }),
    getEmail: () => get().email,
    setUserId: (user_id) => set({ user_id }),
    getUserId: () => get().user_id,
    login: async (email, password) => {
        console.log(email, password);
        const response = await axiosPrivate.post('/auth/login', { email, password });
        set({ email: response.data.email, user_id: response.data.user_id });
        return response.data;
    },
    logout: async () => {
        const response = await axiosPrivate.post('/auth/logout');
        set({ email: null, user_id: null });
    },
    register: async (username, password, email) => {
        const response = await axiosPrivate.post('/auth/register', { username, password, email });
        set({ email: response.data.email, user_id: response.data.user_id });
    }
}))
