import { axiosPrivate } from "./axios";

export const checkGroupSimilarApi = async (group, user_id) => {
    console.log("Group:", group);
    const response = await axiosPrivate.post('/appointments/check-similar-group-meeting', {
        name: group.name,
        startTime: group.startTime,
        endTime: group.endTime,
        userId: user_id,
    });
    console.log("API response:", response.data);
    return response.data;
}