package com.example.backend.controller;

import com.example.backend.dto.AppointmentDTO;
import com.example.backend.dto.ReminderDTO;
import com.example.backend.dto.UserDTO;
import com.example.backend.model.Appointment;
import com.example.backend.model.GroupMeetingParticipant;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    
    @Autowired
    private AppointmentService appointmentService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private ReminderService reminderService;
    
    @Autowired
    private GroupMeetingParticipantService participantService;

    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @GetMapping
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(appointmentDTOs);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AppointmentDTO>> getAppointmentsByUser(@PathVariable Integer userId) {
        Optional<User> user = userService.getUserById(userId);
        if (!user.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Appointment> appointments = appointmentService.getAppointmentsByUser(user.get());
        List<AppointmentDTO> appointmentDTOs = appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(appointmentDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDTO> getAppointmentById(@PathVariable Integer id) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(id);
        return appointment.map(value -> ResponseEntity.ok(convertToDTO(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentDTO appointmentDTO) {
        Optional<User> user = userService.getUserById(appointmentDTO.getUserId());
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        // Check for time conflicts
        boolean hasConflict = appointmentService.hasTimeConflict(
                user.get(), 
                appointmentDTO.getStartTime(), 
                appointmentDTO.getEndTime(),
                null
        );
        
        if (hasConflict) {
            Map<String, Object> response = new HashMap<>();
            response.put("conflict", true);
            response.put("message", "Time conflict detected with another appointment");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        
        Appointment appointment = convertToEntity(appointmentDTO);
        appointment.setUser(user.get());

        Appointment createdAppointment = appointmentRepository.saveAndFlush(appointment);
        Integer newId = createdAppointment.getId();
        
        // Save reminders if any
        if (appointmentDTO.getReminders() != null && !appointmentDTO.getReminders().isEmpty()) {
            List<Reminder> savedReminders = new ArrayList<>();
            
            for (ReminderDTO reminderDTO : appointmentDTO.getReminders()) {
                // Validate reminder time (must be before appointment start time)
                if (reminderDTO.getReminderTime().isAfter(createdAppointment.getStartTime()) || 
                    reminderDTO.getReminderTime().isEqual(createdAppointment.getStartTime())) {
                    continue; 
                }
                
                Reminder reminder = new Reminder();
                reminder.setAppointment(createdAppointment);
                reminder.setReminderTime(reminderDTO.getReminderTime());
                savedReminders.add(reminderService.createReminder(reminder));
            }
        }
        
        // Save participants if it's a group meeting
        if (createdAppointment.getIsGroupMeeting()) {
            // Add the creator as the first participant
            GroupMeetingParticipant creatorParticipant = new GroupMeetingParticipant();
            creatorParticipant.setAppointment(createdAppointment);
            creatorParticipant.setUser(user.get());
            participantService.addParticipant(creatorParticipant);
            
            // Add other participants if provided
            if (appointmentDTO.getParticipants() != null) {
                for (UserDTO participantDTO : appointmentDTO.getParticipants()) {
                    // Skip if it's the creator (already added)
                    if (participantDTO.getId().equals(user.get().getId())) {
                        continue;
                    }
                    
                    Optional<User> participantUser = userService.getUserById(participantDTO.getId());
                    if (participantUser.isPresent()) {
                        GroupMeetingParticipant participant = new GroupMeetingParticipant();
                        participant.setAppointment(createdAppointment);
                        participant.setUser(participantUser.get());
                        participantService.addParticipant(participant);
                    }
                }
            }
        }
        
        // Refresh the appointment to include reminders
        Optional<Appointment> refreshedAppointment = appointmentService.getAppointmentById(createdAppointment.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
            refreshedAppointment.isPresent() ? convertToDTO(refreshedAppointment.get()) : convertToDTO(createdAppointment)
        );
    }

    @PostMapping("/replace-conflict")
    public ResponseEntity<?> replaceConflictingAppointment(@RequestBody AppointmentDTO newAppointmentDTO) {
        Optional<User> user = userService.getUserById(newAppointmentDTO.getUserId());
        if (!user.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        // Tìm các cuộc hẹn xung đột
        List<Appointment> conflictingAppointments = appointmentService.findConflictingAppointments(
                user.get(), 
                newAppointmentDTO.getStartTime(), 
                newAppointmentDTO.getEndTime()
        );
        
        if (conflictingAppointments.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "No conflicting appointments found to replace");
            return ResponseEntity.badRequest().body(error);
        }
        
        // Xóa tất cả các cuộc hẹn xung đột
        for (Appointment conflicting : conflictingAppointments) {
            // Xóa các reminders liên quan
            List<Reminder> reminders = reminderService.getRemindersByAppointment(conflicting);
            for (Reminder reminder : reminders) {
                reminderService.deleteReminder(reminder.getId());
            }
            
            // Xóa các participants nếu là group meeting
            if (conflicting.getIsGroupMeeting()) {
                List<GroupMeetingParticipant> participants = 
                    participantService.getParticipantsByAppointment(conflicting);
                for (GroupMeetingParticipant participant : participants) {
                    participantService.removeParticipant(
                        participant.getAppointment().getId(),
                        participant.getUser().getId()
                    );
                }
            }
            
            // Xóa cuộc hẹn
            appointmentService.deleteAppointment(conflicting.getId());
        }
        
        // Tạo cuộc hẹn mới
        Appointment appointment = convertToEntity(newAppointmentDTO);
        appointment.setUser(user.get());
        
        Appointment createdAppointment = appointmentService.createAppointment(appointment);
        
        // Xử lý reminders
        if (newAppointmentDTO.getReminders() != null) {
            for (ReminderDTO reminderDTO : newAppointmentDTO.getReminders()) {
                // Kiểm tra thời gian nhắc
                if (reminderDTO.getReminderTime().isAfter(createdAppointment.getStartTime()) || 
                    reminderDTO.getReminderTime().isEqual(createdAppointment.getStartTime())) {
                    continue;
                }
                
                Reminder reminder = new Reminder();
                reminder.setAppointment(createdAppointment);
                reminder.setReminderTime(reminderDTO.getReminderTime());
                reminderService.createReminder(reminder);
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Successfully replaced " + conflictingAppointments.size() + " conflicting appointment(s)");
        response.put("replacedAppointments", conflictingAppointments.stream()
                                                .map(this::convertToDTO)
                                                .collect(Collectors.toList()));
        response.put("newAppointment", convertToDTO(createdAppointment));
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/update")
    public ResponseEntity<?> updateAppointment(@PathVariable Integer id, @RequestBody AppointmentDTO appointmentDTO) {
        Optional<Appointment> existingAppointment = appointmentService.getAppointmentById(id);
        if (!existingAppointment.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Appointment not found");
            return ResponseEntity.notFound().build();
        }
        
        Optional<User> user = userService.getUserById(appointmentDTO.getUserId());
        if (!user.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "User not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        // Check for time conflicts
        boolean hasConflict = appointmentService.hasTimeConflict(
                user.get(), 
                appointmentDTO.getStartTime(), 
                appointmentDTO.getEndTime(),
                id
        );
        
        if (hasConflict) {
            Map<String, Object> response = new HashMap<>();
            response.put("conflict", true);
            response.put("message", "Time conflict detected with another appointment");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        
        Appointment appointment = convertToEntity(appointmentDTO);
        appointment.setId(id);
        appointment.setUser(user.get());
        
        Appointment updatedAppointment = appointmentService.updateAppointment(appointment);
        
        // Xử lý reminders: Xóa tất cả reminders cũ và thêm mới nếu có
        List<Reminder> existingReminders = reminderService.getRemindersByAppointment(updatedAppointment);
        
        // Xóa tất cả reminders cũ
        for (Reminder reminder : existingReminders) {
            reminderService.deleteReminder(reminder.getId());
        }
        
        // Thêm reminders mới nếu có
        if (appointmentDTO.getReminders() != null && !appointmentDTO.getReminders().isEmpty()) {
            for (ReminderDTO reminderDTO : appointmentDTO.getReminders()) {
                // Kiểm tra thời gian nhắc
                if (reminderDTO.getReminderTime().isAfter(updatedAppointment.getStartTime()) || 
                    reminderDTO.getReminderTime().isEqual(updatedAppointment.getStartTime())) {
                    continue; // Bỏ qua reminder không hợp lệ
                }
                
                Reminder reminder = new Reminder();
                reminder.setAppointment(updatedAppointment);
                reminder.setReminderTime(reminderDTO.getReminderTime());
                reminderService.createReminder(reminder);
            }
        }
        
        return ResponseEntity.ok(convertToDTO(updatedAppointment));
    }
    
    @PostMapping("/{id}/delete")
    public ResponseEntity<?> deleteAppointment(@PathVariable Integer id) {
        Optional<Appointment> existingAppointment = appointmentService.getAppointmentById(id);
        if (!existingAppointment.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Appointment not found");
            return ResponseEntity.notFound().build();
        }
        
        Appointment appointment = existingAppointment.get();
        
        try {
            // 1. Xóa tất cả reminders liên quan
            List<Reminder> reminders = reminderService.getRemindersByAppointment(appointment);
            for (Reminder reminder : reminders) {
                reminderService.deleteReminder(reminder.getId());
            }
            
            // 2. Xóa tất cả participants nếu là group meeting
            if (appointment.getIsGroupMeeting()) {
                List<GroupMeetingParticipant> participants = 
                    participantService.getParticipantsByAppointment(appointment);
                for (GroupMeetingParticipant participant : participants) {
                    participantService.removeParticipant(
                        participant.getAppointment().getId(),
                        participant.getUser().getId()
                    );
                }
            }
            
            // 3. Cuối cùng xóa appointment
            appointmentService.deleteAppointment(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Appointment and all related data deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete appointment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/active-date")
    public ResponseEntity<LocalDateTime> getActiveDateTime() {
        return ResponseEntity.ok(LocalDateTime.now());
    }
    
    @GetMapping("/check-conflict")
    public ResponseEntity<Map<String, Object>> checkConflict(
            @RequestParam Integer userId,
            @RequestParam LocalDateTime startTime,
            @RequestParam LocalDateTime endTime,
            @RequestParam(required = false) Integer excludeId) {
        
        Optional<User> user = userService.getUserById(userId);
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        boolean hasConflict = appointmentService.hasTimeConflict(
                user.get(), startTime, endTime, excludeId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("conflict", hasConflict);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/group-meetings/{userId}")
    public ResponseEntity<List<AppointmentDTO>> findGroupMeetings(@PathVariable Integer userId) {
        Optional<User> user = userService.getUserById(userId);
        if (!user.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Appointment> groupMeetings = appointmentService.findGroupMeetings(user.get());
        List<AppointmentDTO> meetingDTOs = groupMeetings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(meetingDTOs);
    }
    
    private AppointmentDTO convertToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setName(appointment.getName());
        dto.setLocation(appointment.getLocation());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setUserId(appointment.getUser().getId());
        dto.setIsGroupMeeting(appointment.getIsGroupMeeting());
        
        // Get reminders
        List<Reminder> reminders = reminderService.getRemindersByAppointment(appointment);
        List<ReminderDTO> reminderDTOs = reminders.stream().map(reminder -> {
            ReminderDTO reminderDTO = new ReminderDTO();
            reminderDTO.setId(reminder.getId());
            reminderDTO.setAppointmentId(appointment.getId());
            reminderDTO.setReminderTime(reminder.getReminderTime());
            return reminderDTO;
        }).collect(Collectors.toList());
        dto.setReminders(reminderDTOs);
        
        // Get participants if it's a group meeting
        if (appointment.getIsGroupMeeting()) {
            List<GroupMeetingParticipant> participants = participantService.getParticipantsByAppointment(appointment);
            List<UserDTO> participantDTOs = participants.stream().map(participant -> {
                User user = participant.getUser();
                UserDTO userDTO = new UserDTO();
                userDTO.setId(user.getId());
                userDTO.setEmail(user.getEmail());
                return userDTO;
            }).collect(Collectors.toList());
            dto.setParticipants(participantDTOs);
        }
        
        return dto;
    }
    
    private Appointment convertToEntity(AppointmentDTO dto) {
        Appointment appointment = new Appointment();
        if (dto.getId() != null) {
            appointment.setId(dto.getId());
        }
        appointment.setName(dto.getName());
        appointment.setLocation(dto.getLocation());
        appointment.setStartTime(dto.getStartTime());
        appointment.setEndTime(dto.getEndTime());
        appointment.setIsGroupMeeting(dto.getIsGroupMeeting());
        return appointment;
    }

    // Thêm phương thức này vào AppointmentController
@PostMapping("/validate")
public ResponseEntity<Map<String, Object>> validateAppointment(@RequestBody AppointmentDTO appointmentDTO) {
    Map<String, Object> response = new HashMap<>();
    boolean isValid = true;
    
    // Kiểm tra tên
    if (appointmentDTO.getName() == null || appointmentDTO.getName().trim().isEmpty()) {
        isValid = false;
        response.put("nameError", "Appointment name cannot be empty");
    }
    
    // Kiểm tra thời gian
    if (appointmentDTO.getStartTime() == null) {
        isValid = false;
        response.put("startTimeError", "Start time is required");
    }
    
    if (appointmentDTO.getEndTime() == null) {
        isValid = false;
        response.put("endTimeError", "End time is required");
    }
    
    if (appointmentDTO.getStartTime() != null && appointmentDTO.getEndTime() != null) {
        if (appointmentDTO.getStartTime().isAfter(appointmentDTO.getEndTime())) {
            isValid = false;
            response.put("timeError", "Start time must be before end time");
        }
    }

    if (appointmentDTO.getReminders() != null && appointmentDTO.getStartTime() != null) {
        List<String> reminderErrors = new ArrayList<>();
        
        for (int i = 0; i < appointmentDTO.getReminders().size(); i++) {
            ReminderDTO reminder = appointmentDTO.getReminders().get(i);
            if (reminder.getReminderTime().isAfter(appointmentDTO.getStartTime()) || 
                reminder.getReminderTime().isEqual(appointmentDTO.getStartTime())) {
                isValid = false;
                reminderErrors.add("Reminder #" + (i+1) + " must be set before appointment start time");
            }
        }
        
        if (!reminderErrors.isEmpty()) {
            response.put("reminderErrors", reminderErrors);
        }
    }
    
    response.put("valid", isValid);
    return ResponseEntity.ok(response);
}

    @PostMapping("/check-similar-group-meeting")
    public ResponseEntity<Map<String, Object>> checkSimilarGroupMeeting(@RequestBody AppointmentDTO checkDTO) {
        Optional<User> user = userService.getUserById(checkDTO.getUserId());
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
        
        // Tìm tất cả các cuộc họp nhóm
        List<Appointment> groupMeetings = appointmentService.getAllAppointments()
                .stream()
                .filter(a -> a.getIsGroupMeeting() && !a.getUser().getId().equals(checkDTO.getUserId()))
                .collect(Collectors.toList());
        
        // Tìm các cuộc họp nhóm có tên giống và thời gian trùng khớp CHÍNH XÁC
        List<AppointmentDTO> similarMeetings = new ArrayList<>();
        
        for (Appointment meeting : groupMeetings) {
            boolean sameName = meeting.getName().equalsIgnoreCase(checkDTO.getName());
            boolean sameStartTime = meeting.getStartTime().isEqual(checkDTO.getStartTime());
            boolean sameEndTime = meeting.getEndTime().isEqual(checkDTO.getEndTime());
            
            // Chỉ xét trùng khớp khi cùng tên VÀ cùng thời gian chính xác
            if (sameName && sameStartTime && sameEndTime) {
                // Kiểm tra xem user đã tham gia cuộc họp này chưa
                boolean isAlreadyParticipant = participantService
                        .getParticipant(meeting.getId(), checkDTO.getUserId())
                        .isPresent();
                
                if (!isAlreadyParticipant) {
                    similarMeetings.add(convertToDTO(meeting));
                }
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("hasSimilarMeetings", !similarMeetings.isEmpty());
        response.put("similarMeetings", similarMeetings);
        
        return ResponseEntity.ok(response);
    }
}