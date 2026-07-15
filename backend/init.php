<?php
/* =============================================
   EASTC Backend - Initialize Database
   Run this once after setting up your database
   ============================================= */
require 'config.php';

$queries = [
    "CREATE TABLE IF NOT EXISTS site_info (
        id INT PRIMARY KEY DEFAULT 1,
        title VARCHAR(255) DEFAULT 'EASTC Students Organization',
        tagline VARCHAR(255) DEFAULT 'Empowering Students, Building Leaders',
        welcome TEXT,
        logo VARCHAR(255) DEFAULT 'img/logoo.png',
        logo_file TEXT,
        mission TEXT,
        footer VARCHAR(255) DEFAULT 'Made with dedication for EASTC Students',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS leaders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100) DEFAULT 'fa-user',
        photo VARCHAR(255),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        event_date VARCHAR(100) NOT NULL,
        venue VARCHAR(255) NOT NULL,
        image VARCHAR(255),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        activity_date DATE NOT NULL,
        description TEXT NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255),
        image VARCHAR(255) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
];

foreach ($queries as $q) {
    $pdo->exec($q);
}

// Insert default site info if not exists
$stmt = $pdo->query("SELECT COUNT(*) FROM site_info");
if ($stmt->fetchColumn() == 0) {
    $pdo->prepare("INSERT INTO site_info (id, title, tagline, welcome, logo, mission, footer) VALUES (1, ?, ?, ?, ?, ?, ?)")
        ->execute([
            'EASTC Students Organization',
            'Empowering Students, Building Leaders',
            'Welcome to the official portal of the EASTC Students Organization! We are a vibrant community dedicated to enhancing student life, fostering academic excellence, and building tomorrow\'s leaders at the Eastern Africa Statistical Training Centre.',
            'img/logoo.png',
            "Promote academic excellence among all students\nFoster unity and cooperation within the student community\nOrganize social, cultural, and sporting activities\nRepresent student interests to the college administration\nProvide platforms for leadership development\nSupport students' welfare and personal growth",
            'Made with dedication for EASTC Students'
        ]);
}

// Removed default inserts for leaders, events, announcements, and activities to ensure the database starts clean.

jsonResponse(['success' => true, 'message' => 'Database initialized successfully with default data.']);
