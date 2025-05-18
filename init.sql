CREATE DATABASE IF NOT EXISTS calendar_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE calendar_app;

CREATE TABLE IF NOT EXISTS User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Appointment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    user_id INT NOT NULL,
    is_group_meeting BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS GroupMeetingParticipant (
    appointment_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (appointment_id, user_id),
    FOREIGN KEY (appointment_id) REFERENCES Appointment(id),
    FOREIGN KEY (user_id) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS Reminder (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    reminder_time DATETIME NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(id)
);