package com.example.backend.service;

import com.example.backend.model.Appointment;
import com.example.backend.model.Reminder;
import com.example.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;
    
    public void sendReminderEmail(Reminder reminder, User user) throws MessagingException {
        Appointment appointment = reminder.getAppointment();
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        helper.setTo(user.getEmail());
        helper.setSubject("Reminder: " + appointment.getName());
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        String startTime = appointment.getStartTime().format(formatter);
        String endTime = appointment.getEndTime().format(formatter);
        
        String content = "<html><body>" +
                "<h2>Reminder for your appointment</h2>" +
                "<p>This is a reminder for your upcoming appointment:</p>" +
                "<p><strong>Title:</strong> " + appointment.getName() + "</p>" +
                "<p><strong>Start Time:</strong> " + startTime + "</p>" +
                "<p><strong>End Time:</strong> " + endTime + "</p>";
        
        if (appointment.getLocation() != null && !appointment.getLocation().isEmpty()) {
            content += "<p><strong>Location:</strong> " + appointment.getLocation() + "</p>";
        }
        
        content += "<p>Please be prepared for this appointment.</p>" +
                "<p>Regards,<br>Calendar App Team</p>" +
                "</body></html>";
        
        helper.setText(content, true);
        
        mailSender.send(message);
    }
}