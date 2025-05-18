import { create } from 'zustand';
import { getAppointmentsTimeApi } from '../apis/getAppointmentsTime';
import { addNewAppointmentsApi } from '../apis/addNewAppointments';
import { updateAppointmentsApi } from '../apis/updateAppointments';
import { deleteAppointmentsApi } from '../apis/deleteAppointMents';

const useAppointmentsStore = create((set, get) => ({
  appointments: [],
  loading: false,
  error: null,

  fetchAppointments: async (userId) => {
    set({ loading: true, error: null });
    try {
      const data = await getAppointmentsTimeApi(userId);
      // Chuyển đổi mảng reminders từ string sang Date object
      const formattedData = data.map(appointment => ({
        ...appointment,
        reminders: appointment.reminders.map(reminder => new Date(reminder))
      }));
      set({ appointments: formattedData || [], loading: false });
    } catch (error) {
      set({ error: error.message || 'Lỗi khi tải lịch hẹn', loading: false });
    }
  },

  addAppointment: async (appointment, userId) => {
    set({ loading: true, error: null });
    try {
      // Chuyển đổi mảng reminders từ Date sang string trước khi gửi lên API
      const formattedAppointment = {
        ...appointment,
        reminders: appointment.reminders.map(reminder => reminder.toISOString())
      };
      const newAppointment = await addNewAppointmentsApi(formattedAppointment, userId);
      // Chuyển đổi mảng reminders từ string sang Date object trước khi cập nhật state
      const formattedNewAppointment = {
        ...newAppointment,
        reminders: newAppointment.reminders.map(reminder => new Date(reminder))
      };
      set((state) => ({
        appointments: [...state.appointments, formattedNewAppointment],
        loading: false
      }));
    } catch (error) {
      set({ error: error.message || 'Lỗi khi thêm lịch hẹn', loading: false });
    }
  },

  updateAppointment: async (appointment, userId) => {
    console.log("Updating appointment in store:", appointment);
    set({ loading: true, error: null });
    try {
      // Chuyển đổi mảng reminders từ Date sang string trước khi gửi lên API
      const formattedAppointment = {
        ...appointment,
        reminders: appointment.reminders.map(reminder => 
          reminder instanceof Date ? reminder.toISOString() : reminder
        )
      };
      
      console.log("Sending formatted appointment to API:", formattedAppointment);
      await updateAppointmentsApi(formattedAppointment, userId);
      
      // Cập nhật state với appointment mới
      set((state) => ({
        appointments: state.appointments.map(apt => 
          apt.id === appointment.id ? {
            ...appointment,
            reminders: appointment.reminders.map(reminder => 
              reminder instanceof Date ? reminder : new Date(reminder)
            )
          } : apt
        ),
        loading: false
      }));
    } catch (error) {
      console.error("Error updating appointment:", error);
      set({ error: error.message || 'Lỗi khi cập nhật lịch hẹn', loading: false });
      throw error;
    }
  },
  deleteAppointment: async (appointmentId, userId) => {
    set({ loading: true, error: null });
    try {
      await deleteAppointmentsApi(appointmentId, userId);
      set((state) => ({
        appointments: state.appointments.filter(apt => apt.id !== appointmentId), 
        loading: false
      }));
    } catch (error) {
      set({ error: error.message || 'Lỗi khi xóa lịch hẹn', loading: false });
      throw error;
    }
  }

  // updateAppointment, deleteAppointment có thể bổ sung tương tự
}));

export default useAppointmentsStore; 