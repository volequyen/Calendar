package com.example.backend.repository;

import com.example.backend.model.Appointment;
import com.example.backend.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Integer> {
    List<Reminder> findByAppointment(Appointment appointment);
    // Thêm phương thức này vào ReminderRepository
    List<Reminder> findByReminderTimeBetweenAndSentFalse(LocalDateTime start, LocalDateTime end);
}