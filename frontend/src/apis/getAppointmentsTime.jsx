import axiosPrivate from "./axios";

export const getAppointmentsTimeApi = async (user_id) => {
    const response = await axiosPrivate.get(`appointments/user/${user_id}`);
    return response.data;
}

