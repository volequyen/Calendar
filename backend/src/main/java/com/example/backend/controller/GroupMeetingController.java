package com.example.backend.controller;

import com.example.backend.model.Appointment;
import com.example.backend.model.GroupMeetingParticipant;
import com.example.backend.model.GroupMeetingParticipantId;
import com.example.backend.model.Reminder;
import com.example.backend.model.User;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.service.AppointmentService;
import com.example.backend.service.GroupMeetingParticipantService;
import com.example.backend.service.ReminderService;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/group-meetings")
public class GroupMeetingController {
    
    @Autowired
    private GroupMeetingParticipantService participantService;
    
    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private ReminderService reminderService;

    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @GetMapping("/appointment/{appointmentId}/participants")
    public ResponseEntity<List<Map<String, Object>>> getParticipantsByAppointment(@PathVariable Integer appointmentId) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(appointmentId);
        if (!appointment.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<GroupMeetingParticipant> participants = participantService.getParticipantsByAppointment(appointment.get());
        List<Map<String, Object>> result = participants.stream()
            .map(participant -> {
                Map<String, Object> map = new HashMap<>();
                map.put("appointmentId", participant.getAppointment().getId());
                map.put("userId", participant.getUser().getId());
                map.put("email", participant.getUser().getEmail());
                return map;
            })
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/user/{userId}/participations")
    public ResponseEntity<List<Map<String, Object>>> getParticipationsByUser(@PathVariable Integer userId) {
        Optional<User> user = userService.getUserById(userId);
        if (!user.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<GroupMeetingParticipant> participations = participantService.getParticipantsByUser(user.get());
        List<Map<String, Object>> result = participations.stream()
                .map(participation -> {
                    Appointment appointment = participation.getAppointment();
                    Map<String, Object> map = new HashMap<>();
                    map.put("appointmentId", appointment.getId());
                    map.put("name", appointment.getName());
                    map.put("startTime", appointment.getStartTime());
                    map.put("endTime", appointment.getEndTime());
                    map.put("location", appointment.getLocation() != null ? appointment.getLocation() : "");
                    map.put("ownerId", appointment.getUser().getId());
                    return map;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/appointment/{appointmentId}/participant/{userId}")
    public ResponseEntity<Map<String, Object>> addParticipant(
            @PathVariable Integer appointmentId,
            @PathVariable Integer userId) {
        
        Optional<Appointment> appointment = appointmentService.getAppointmentById(appointmentId);
        if (!appointment.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        Optional<User> user = userService.getUserById(userId);
        if (!user.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Verify that the appointment is a group meeting
        if (!appointment.get().getIsGroupMeeting()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "This appointment is not a group meeting"
            ));
        }
        
        // Check if the participant already exists
        Optional<GroupMeetingParticipant> existingParticipant = 
                participantService.getParticipant(appointmentId, userId);
        if (existingParticipant.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "User is already a participant in this meeting"
            ));
        }
        
        GroupMeetingParticipant participant = new GroupMeetingParticipant();
        participant.setAppointment(appointment.get());
        participant.setUser(user.get());
        GroupMeetingParticipant savedParticipant = participantService.addParticipant(participant);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "appointmentId", savedParticipant.getAppointment().getId(),
                "userId", savedParticipant.getUser().getId(),
                "email", savedParticipant.getUser().getEmail()
        ));
    }
    
    @DeleteMapping("/appointment/{appointmentId}/participant/{userId}")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable Integer appointmentId,
            @PathVariable Integer userId) {
        
        Optional<GroupMeetingParticipant> existingParticipant = 
                participantService.getParticipant(appointmentId, userId);
        if (!existingParticipant.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        participantService.removeParticipant(appointmentId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinGroupMeeting(@RequestBody Map<String, Object> request) {
        Integer appointmentId = (Integer) request.get("appointmentId");
        Integer userId = (Integer) request.get("userId");
        
        // Kiểm tra đầu vào
        if (appointmentId == null || userId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both appointmentId and userId are required"));
        }
        
        // Truy vấn trực tiếp từ database để tránh cache
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (!appointmentOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Appointment not found with id: " + appointmentId));
        }
        
        Optional<User> user = userService.getUserById(userId);
        if (!user.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            return ResponseEntity.notFound().build();
        }
        
        // Verify that the appointment is a group meeting
        if (!appointmentOpt.get().getIsGroupMeeting()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "This appointment is not a group meeting");
            return ResponseEntity.badRequest().body(error);
        }
        
        // Check if the participant already exists
        Optional<GroupMeetingParticipant> existingParticipant = 
                participantService.getParticipant(appointmentId, userId);
        if (existingParticipant.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User is already a participant in this meeting");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        
        // Tìm và xóa các cuộc hẹn xung đột (nếu có)
        List<Appointment> conflictingAppointments = appointmentService.findConflictingAppointments(
                user.get(), 
                appointmentOpt.get().getStartTime(), 
                appointmentOpt.get().getEndTime()
        );
        
        // Xóa các cuộc hẹn xung đột
        for (Appointment conflicting : conflictingAppointments) {
            try {
                // Xóa reminders
                List<Reminder> reminders = reminderService.getRemindersByAppointment(conflicting);
                for (Reminder reminder : reminders) {
                    reminderService.deleteReminder(reminder.getId());
                }
                
                // Xóa appointment
                appointmentService.deleteAppointment(conflicting.getId());
            } catch (Exception e) {
                // Log lỗi
            }
        }
        
        GroupMeetingParticipant participant = new GroupMeetingParticipant();
        participant.setAppointment(appointmentOpt.get());
        participant.setUser(user.get());
        GroupMeetingParticipant savedParticipant = participantService.addParticipant(participant);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Successfully joined the group meeting");
        response.put("appointmentId", savedParticipant.getAppointment().getId());
        response.put("userId", savedParticipant.getUser().getId());
        response.put("email", savedParticipant.getUser().getEmail());
        
        if (!conflictingAppointments.isEmpty()) {
            response.put("replacedAppointments", conflictingAppointments.size());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}