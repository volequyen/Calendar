package com.example.backend.controller;

import com.example.backend.model.Appointment;
import com.example.backend.model.Reminder;
import com.example.backend.model.User;
import com.example.backend.repository.AppointmentRepository;
import com.example.backend.repository.ReminderRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.mail.MessagingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/email-test")
public class EmailTestController {

    @Autowired
    private EmailService emailService;
    
    @Autowired
    private ReminderRepository reminderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/send-test")
    public ResponseEntity<?> sendTestEmail(@RequestParam String email) {
        try {
            // Find any user with that email or use the provided email directly
            Optional<User> userOpt = userRepository.findByEmail(email);
            User user;
            
            if (userOpt.isPresent()) {
                user = userOpt.get();
            } else {
                // Create a temporary user object just for testing
                user = new User();
                user.setEmail(email);
                user.setId(0); // Dummy ID
            }
            
            // Create a dummy appointment and reminder for testing
            Appointment dummyAppointment = new Appointment();
            dummyAppointment.setName("Test Appointment");
            dummyAppointment.setLocation("Test Location");
            dummyAppointment.setStartTime(java.time.LocalDateTime.now().plusHours(1));
            dummyAppointment.setEndTime(java.time.LocalDateTime.now().plusHours(2));
            
            Reminder dummyReminder = new Reminder();
            dummyReminder.setAppointment(dummyAppointment);
            dummyReminder.setReminderTime(java.time.LocalDateTime.now());
            
            // Send the test email
            emailService.sendReminderEmail(dummyReminder, user);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Test email sent successfully to " + email);
            
            return ResponseEntity.ok(response);
        } catch (MessagingException e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send email: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    @PostMapping("/send-reminder/{reminderId}")
    public ResponseEntity<?> sendReminderById(@PathVariable Integer reminderId) {
        try {
            Optional<Reminder> reminderOpt = reminderRepository.findById(reminderId);
            
            if (reminderOpt.isEmpty()) {
                Map<String, String> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Reminder not found with ID: " + reminderId);
                return ResponseEntity.badRequest().body(response);
            }
            
            Reminder reminder = reminderOpt.get();
            User user = reminder.getAppointment().getUser();
            
            // Send the email
            emailService.sendReminderEmail(reminder, user);
            
            // Mark reminder as sent
            reminder.setSent(true);
            reminderRepository.save(reminder);
            
            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Reminder email sent successfully to " + user.getEmail());
            
            return ResponseEntity.ok(response);
        } catch (MessagingException e) {
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Failed to send email: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
}