
import { deleteAppointmentsApi } from "./deleteAppointMents";
import { addNewAppointmentsApi } from "./addNewAppointments";
export const updateAppointmentsApi = async (appointment, user_id) => {
    console.log("Sending update request to API:", { appointment, user_id });
    try {
        console.log("Deleting appointment:", appointment.id);
        await deleteAppointmentsApi(appointment.id);
        await addNewAppointmentsApi(appointment, user_id);
        return true;
    } catch (error) {
        console.error("Error in updateAppointmentsApi:", error);
        throw error;
    }
}
