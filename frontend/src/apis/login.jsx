import axiosPrivate from "./axios";

export const loginApi = async (email, password) => {
    const response = await axiosPrivate.post('/auth/login', { email, password });
    return response.data;
}
