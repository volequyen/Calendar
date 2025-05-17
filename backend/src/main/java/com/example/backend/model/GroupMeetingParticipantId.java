package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMeetingParticipantId implements Serializable {
    @Column(name = "appointment_id")
    private Integer appointmentId;
    
    @Column(name = "user_id")
    private Integer userId;
}