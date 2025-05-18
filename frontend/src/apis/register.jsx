import { axiosPrivate } from "./axios";

const registerApi = async (email, password) => {
    const response = await axiosPrivate.post("/auth/register", {
        email,
        password
    });
    return response.data;
};

export default registerApi;