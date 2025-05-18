package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "GroupMeetingParticipant")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMeetingParticipant {
    @EmbeddedId
    private GroupMeetingParticipantId id = new GroupMeetingParticipantId();
    
    @ManyToOne
    @MapsId("appointmentId")
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;
    
    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
        if (this.id != null) {
            this.id.setAppointmentId(appointment.getId());
        }
    }
    
    public void setUser(User user) {
        this.user = user;
        if (this.id != null) {
            this.id.setUserId(user.getId());
        }
    }
}