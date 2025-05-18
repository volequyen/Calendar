import { axiosPrivate } from "./axios";

export const addNewGroupApi = async (group) => {
    const response = await axiosPrivate.post('/groups', group);
    return response.data;
}

    