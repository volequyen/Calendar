package com.example.backend.service;

import com.example.backend.model.Appointment;
import com.example.backend.model.Reminder;
import com.example.backend.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ReminderService {
    
    @Autowired
    private ReminderRepository reminderRepository;
    
    public List<Reminder> getAllReminders() {
        return reminderRepository.findAll();
    }
    
    public List<Reminder> getRemindersByAppointment(Appointment appointment) {
        return reminderRepository.findByAppointment(appointment);
    }
    
    public Optional<Reminder> getReminderById(Integer id) {
        return reminderRepository.findById(id);
    }
    
    public Reminder createReminder(Reminder reminder) {
        return reminderRepository.save(reminder);
    }
    
    public Reminder updateReminder(Reminder reminder) {
        return reminderRepository.save(reminder);
    }
    
    public void deleteReminder(Integer id) {
        reminderRepository.deleteById(id);
    }

    // Thêm phương thức này vào ReminderService
    public List<Reminder> getRemindersInTimeRange(LocalDateTime start, LocalDateTime end) {
        return reminderRepository.findByReminderTimeBetweenAndSentFalse(start, end);
    }
}