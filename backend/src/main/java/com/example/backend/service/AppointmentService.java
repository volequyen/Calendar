package com.example.backend.service;

import com.example.backend.model.Appointment;
import com.example.backend.model.User;
import com.example.backend.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    public List<Appointment> getAppointmentsByUser(User user) {
        return appointmentRepository.findByUser(user);
    }
    
    public Optional<Appointment> getAppointmentById(Integer id) {
        return appointmentRepository.findById(id);
    }
    
    @Transactional
    public Appointment createAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }
    
    public Appointment updateAppointment(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }
    
    @Transactional
    public void deleteAppointment(Integer id) {
        appointmentRepository.deleteById(id);
    }
    
    public List<Appointment> findConflictingAppointments(User user, LocalDateTime start, LocalDateTime end) {
        List<Appointment> appointments = appointmentRepository.findByUser(user);
        
        return appointments.stream()
                .filter(existing -> {
                    LocalDateTime existingStart = existing.getStartTime();
                    LocalDateTime existingEnd = existing.getEndTime();
                    
                    boolean startOverlap = (start.isEqual(existingStart) || start.isAfter(existingStart)) 
                                        && start.isBefore(existingEnd);
                    
                    boolean endOverlap = end.isAfter(existingStart) 
                                      && (end.isBefore(existingEnd) || end.isEqual(existingEnd));
                    
                    boolean encompass = start.isBefore(existingStart) && end.isAfter(existingEnd);
                    
                    return startOverlap || endOverlap || encompass;
                })
                .collect(Collectors.toList());
    }
    
    public boolean hasTimeConflict(User user, LocalDateTime start, LocalDateTime end, Integer excludeAppointmentId) {
        List<Appointment> appointments = appointmentRepository.findByUser(user);
        
        // Loại bỏ appointment đang được cập nhật (nếu có)
        if (excludeAppointmentId != null) {
            appointments = appointments.stream()
                    .filter(app -> !app.getId().equals(excludeAppointmentId))
                    .collect(Collectors.toList());
        }
        
        // Kiểm tra xung đột - sửa logic cho đúng
        for (Appointment existing : appointments) {
            // 1. Start time mới nằm giữa appointment hiện tại (start hiện tại <= start mới < end hiện tại)
            // 2. End time mới nằm giữa appointment hiện tại (start hiện tại < end mới <= end hiện tại)
            // 3. Appointment mới bao trùm appointment hiện tại (start mới <= start hiện tại && end mới >= end hiện tại)
            
            LocalDateTime existingStart = existing.getStartTime();
            LocalDateTime existingEnd = existing.getEndTime();
            
            boolean startOverlap = (start.isEqual(existingStart) || start.isAfter(existingStart)) 
                                && start.isBefore(existingEnd);
            
            boolean endOverlap = end.isAfter(existingStart) 
                              && (end.isBefore(existingEnd) || end.isEqual(existingEnd));
            
            boolean encompass = start.isBefore(existingStart) && end.isAfter(existingEnd);
            
            if (startOverlap || endOverlap || encompass) {
                return true; // Có xung đột
            }
        }
        
        return false;
    }
    
    public List<Appointment> findGroupMeetings(User user) {
        return appointmentRepository.findByUserAndIsGroupMeeting(user, true);
    }
}