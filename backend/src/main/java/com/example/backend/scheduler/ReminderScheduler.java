package com.example.backend.scheduler;

import com.example.backend.model.Reminder;
import com.example.backend.model.User;
import com.example.backend.service.EmailService;
import com.example.backend.service.ReminderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.mail.MessagingException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

@Component
public class ReminderScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ReminderScheduler.class);
    
    @Autowired
    private ReminderService reminderService;
    
    @Autowired
    private EmailService emailService;
    
    // Chạy mỗi phút
    @Scheduled(fixedRate = 60000)
    public void checkAndSendReminders() {
        logger.info("Checking for reminders to send...");
        
        ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime nowZoned = ZonedDateTime.now(vietnamZone);
        LocalDateTime now = nowZoned.toLocalDateTime();
        LocalDateTime nextMinute = now.plusMinutes(1);
        
        // Tìm các reminder có thời gian nằm giữa now và nextMinute
        List<Reminder> dueReminders = reminderService.getRemindersInTimeRange(now, nextMinute);
        
        for (Reminder reminder : dueReminders) {
            User user = reminder.getAppointment().getUser();
            try {
                emailService.sendReminderEmail(reminder, user);
                logger.info("Sent reminder email for appointment: {} to user: {}", 
                        reminder.getAppointment().getName(), user.getEmail());
                
                // Đánh dấu reminder đã được gửi (optional)
                reminder.setSent(true);
                reminderService.updateReminder(reminder);
            } catch (MessagingException e) {
                logger.error("Failed to send reminder email: {}", e.getMessage());
            }
        }
    }
}