package com.example.backend.controller;

import com.example.backend.dto.AuthRequest;
import com.example.backend.dto.AuthResponse;
import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        // Check if email already exists
        Optional<User> existingUser = userService.getUserByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            AuthResponse response = new AuthResponse(null, null, false, "Email already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userService.createUser(user);
        
        AuthResponse response = new AuthResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                true,
                "Registration successful"
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        Optional<User> optionalUser = userService.getUserByEmail(request.getEmail());
        
        if (!optionalUser.isPresent()) {
            AuthResponse response = new AuthResponse(null, null, false, "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        User user = optionalUser.get();
        
        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            AuthResponse response = new AuthResponse(null, null, false, "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        AuthResponse response = new AuthResponse(
                user.getId(),
                user.getEmail(),
                true,
                "Login successful"
        );
        
        return ResponseEntity.ok(response);
    }
}