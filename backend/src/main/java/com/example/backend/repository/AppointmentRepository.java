package com.example.backend.repository;

import com.example.backend.model.Appointment;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findByUser(User user);
    
    @Query("SELECT a FROM Appointment a WHERE a.user = :user AND " +
           "((a.startTime BETWEEN :start AND :end) OR " +
           "(a.endTime BETWEEN :start AND :end) OR " +
           "(:start BETWEEN a.startTime AND a.endTime))")
    List<Appointment> findConflictingAppointments(User user, LocalDateTime start, LocalDateTime end);
    
    List<Appointment> findByUserAndIsGroupMeeting(User user, Boolean isGroupMeeting);
}