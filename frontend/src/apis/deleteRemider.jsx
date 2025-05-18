import { axiosPrivate } from "./axios";

export const deleteRemiderApi = async (reminderId) => {
    const response = await axiosPrivate.delete(`/reminders/${reminderId}`);
    return response.data;
}
