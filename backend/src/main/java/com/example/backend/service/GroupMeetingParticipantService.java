package com.example.backend.service;

import com.example.backend.model.Appointment;
import com.example.backend.model.GroupMeetingParticipant;
import com.example.backend.model.GroupMeetingParticipantId;
import com.example.backend.model.User;
import com.example.backend.repository.GroupMeetingParticipantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupMeetingParticipantService {
    
    @Autowired
    private GroupMeetingParticipantRepository participantRepository;
    
    public List<GroupMeetingParticipant> getParticipantsByAppointment(Appointment appointment) {
        return participantRepository.findByAppointment(appointment);
    }
    
    public List<GroupMeetingParticipant> getParticipantsByUser(User user) {
        return participantRepository.findByUser(user);
    }
    
    public Optional<GroupMeetingParticipant> getParticipant(Integer appointmentId, Integer userId) {
        GroupMeetingParticipantId id = new GroupMeetingParticipantId();
        id.setAppointmentId(appointmentId);
        id.setUserId(userId);
        return participantRepository.findById(id);
    }
    
    public GroupMeetingParticipant addParticipant(GroupMeetingParticipant participant) {
        return participantRepository.save(participant);
    }
    
    public void removeParticipant(Integer appointmentId, Integer userId) {
        GroupMeetingParticipantId id = new GroupMeetingParticipantId();
        id.setAppointmentId(appointmentId);
        id.setUserId(userId);
        participantRepository.deleteById(id);
    }
}