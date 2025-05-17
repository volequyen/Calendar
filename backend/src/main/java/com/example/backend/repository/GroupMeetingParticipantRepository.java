package com.example.backend.repository;

import com.example.backend.model.Appointment;
import com.example.backend.model.GroupMeetingParticipant;
import com.example.backend.model.GroupMeetingParticipantId;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMeetingParticipantRepository extends JpaRepository<GroupMeetingParticipant, GroupMeetingParticipantId> {
    List<GroupMeetingParticipant> findByAppointment(Appointment appointment);
    List<GroupMeetingParticipant> findByUser(User user);
}