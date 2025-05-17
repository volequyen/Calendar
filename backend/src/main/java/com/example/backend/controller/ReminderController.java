package com.example.backend.controller;

import com.example.backend.dto.BatchReminderDTO;
import com.example.backend.dto.ReminderDTO;
import com.example.backend.model.Appointment;
import com.example.backend.model.Reminder;
import com.example.backend.service.AppointmentService;
import com.example.backend.service.ReminderService;
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
@RequestMapping("/api/reminders")
public class ReminderController {
    
    @Autowired
    private ReminderService reminderService;
    
    @Autowired
    private AppointmentService appointmentService;
    
    @GetMapping
    public ResponseEntity<List<ReminderDTO>> getAllReminders() {
        List<Reminder> reminders = reminderService.getAllReminders();
        List<ReminderDTO> reminderDTOs = reminders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reminderDTOs);
    }
    
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<ReminderDTO>> getRemindersByAppointment(@PathVariable Integer appointmentId) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(appointmentId);
        if (!appointment.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        List<Reminder> reminders = reminderService.getRemindersByAppointment(appointment.get());
        List<ReminderDTO> reminderDTOs = reminders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reminderDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ReminderDTO> getReminderById(@PathVariable Integer id) {
        Optional<Reminder> reminder = reminderService.getReminderById(id);
        return reminder.map(value -> ResponseEntity.ok(convertToDTO(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<?> createReminder(@RequestBody ReminderDTO reminderDTO) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(reminderDTO.getAppointmentId());
        if (!appointment.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Appointment not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        // Kiểm tra thời gian
        if (reminderDTO.getReminderTime().isAfter(appointment.get().getStartTime()) || 
            reminderDTO.getReminderTime().isEqual(appointment.get().getStartTime())) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Reminder time must be before appointment start time");
            return ResponseEntity.badRequest().body(error);
        }
        
        Reminder reminder = new Reminder();
        reminder.setAppointment(appointment.get());
        reminder.setReminderTime(reminderDTO.getReminderTime());
        
        Reminder createdReminder = reminderService.createReminder(reminder);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(createdReminder));
    }

    @PostMapping("/batch")
    public ResponseEntity<?> createRemindersForAppointment(@RequestBody BatchReminderDTO batchDTO) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(batchDTO.getAppointmentId());
        if (!appointment.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Appointment not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        List<ReminderDTO> createdReminders = new ArrayList<>();
        List<Map<String, Object>> errors = new ArrayList<>();
        
        for (LocalDateTime reminderTime : batchDTO.getReminderTimes()) {
            // Kiểm tra thời gian nhắc
            if (reminderTime.isAfter(appointment.get().getStartTime()) || 
                reminderTime.isEqual(appointment.get().getStartTime())) {
                Map<String, Object> error = new HashMap<>();
                error.put("reminderTime", reminderTime);
                error.put("error", "Reminder time must be before appointment start time");
                errors.add(error);
                continue;
            }
            
            Reminder reminder = new Reminder();
            reminder.setAppointment(appointment.get());
            reminder.setReminderTime(reminderTime);
            
            Reminder createdReminder = reminderService.createReminder(reminder);
            createdReminders.add(convertToDTO(createdReminder));
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("appointmentId", batchDTO.getAppointmentId());
        response.put("createdReminders", createdReminders);
        if (!errors.isEmpty()) {
            response.put("errors", errors);
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
        
    @PostMapping("/{id}/update") // Thay vì @PutMapping("/{id}")
    public ResponseEntity<?> updateReminder(@PathVariable Integer id, @RequestBody ReminderDTO reminderDTO) {
        Optional<Reminder> existingReminder = reminderService.getReminderById(id);
        if (!existingReminder.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Reminder not found");
            return ResponseEntity.notFound().build();
        }
        
        Optional<Appointment> appointment = appointmentService.getAppointmentById(reminderDTO.getAppointmentId());
        if (!appointment.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Appointment not found");
            return ResponseEntity.badRequest().body(error);
        }
        
        // Kiểm tra thời gian
        if (reminderDTO.getReminderTime().isAfter(appointment.get().getStartTime()) || 
            reminderDTO.getReminderTime().isEqual(appointment.get().getStartTime())) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Reminder time must be before appointment start time");
            return ResponseEntity.badRequest().body(error);
        }
        
        Reminder reminder = existingReminder.get();
        reminder.setAppointment(appointment.get());
        reminder.setReminderTime(reminderDTO.getReminderTime());
        
        Reminder updatedReminder = reminderService.updateReminder(reminder);
        return ResponseEntity.ok(convertToDTO(updatedReminder));
    }
        
    @PostMapping("/{id}/delete") 
    public ResponseEntity<?> deleteReminder(@PathVariable Integer id) {
        Optional<Reminder> existingReminder = reminderService.getReminderById(id);
        if (!existingReminder.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Reminder not found");
            return ResponseEntity.notFound().build();
        }
        
        reminderService.deleteReminder(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Reminder deleted successfully");
        return ResponseEntity.ok(response);
    }
    
    private ReminderDTO convertToDTO(Reminder reminder) {
        ReminderDTO dto = new ReminderDTO();
        dto.setId(reminder.getId());
        dto.setAppointmentId(reminder.getAppointment().getId());
        dto.setReminderTime(reminder.getReminderTime());
        return dto;
    }
}