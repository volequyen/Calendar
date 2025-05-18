import axiosPrivate from "./axios";

export const sendEmailApi = async (email) => {
    const response = await axiosPrivate.post(`/api/email-test/send-test`, { email });
    return response.data;
} 