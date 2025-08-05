package com.universalcrud.controller;

import com.universalcrud.dto.JwtResponse;
import com.universalcrud.dto.LoginRequest;
import com.universalcrud.dto.RegisterRequest;
import com.universalcrud.entity.User;
import com.universalcrud.service.UserService;
import com.universalcrud.util.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()));
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            User userDetails = (User) authentication.getPrincipal();
            JwtResponse jwtResponse = new JwtResponse(jwt,
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    userDetails.getRole().name());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", jwtResponse);
            response.put("message", "Login successful");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Invalid credentials: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Check if username exists
            if (userService.existsByUsername(registerRequest.getUsername())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Username is already taken!");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Check if email exists
            if (userService.existsByEmail(registerRequest.getEmail())) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Email is already in use!");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Create new user
            User user = new User(registerRequest.getUsername(),
                    registerRequest.getEmail(),
                    registerRequest.getPassword());
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());
            user.setRole(User.Role.USER);
            
            User savedUser = userService.createUser(user);
            
            // Generate JWT token
            String jwt = jwtUtils.generateTokenFromUsername(savedUser.getUsername());
            JwtResponse jwtResponse = new JwtResponse(jwt,
                    savedUser.getUsername(),
                    savedUser.getEmail(),
                    savedUser.getRole().name());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", jwtResponse);
            response.put("message", "User registered successfully!");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to register user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logoutUser() {
        SecurityContextHolder.clearContext();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "You've been signed out!");
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        try {
            User user = (User) authentication.getPrincipal();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", user);
            response.put("message", "User details retrieved successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get user details: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshToken(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        try {
            User user = (User) authentication.getPrincipal();
            String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
            
            JwtResponse jwtResponse = new JwtResponse(jwt,
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", jwtResponse);
            response.put("message", "Token refreshed successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to refresh token: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
