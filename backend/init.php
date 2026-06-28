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

// Insert default leaders if not exists
$stmt = $pdo->query("SELECT COUNT(*) FROM leaders");
if ($stmt->fetchColumn() == 0) {
    $leaders = [
        ['John Student', 'President', 'Leading the organization with vision and dedication to serve all students.', 'fa-user-tie', 0],
        ['Amina Hassan', 'Vice President', 'Supporting organizational initiatives and driving student engagement.', 'fa-user-graduate', 1],
        ['Peter Joseph', 'Secretary', 'Managing communication and keeping accurate organizational records.', 'fa-user-edit', 2],
        ['Grace Mwamba', 'Treasurer', 'Overseeing financial planning and transparent budget management.', 'fa-user-shield', 3]
    ];
    $stmt = $pdo->prepare("INSERT INTO leaders (name, role, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)");
    foreach ($leaders as $l) {
        $stmt->execute($l);
    }
}

// Insert default events if not exists
$stmt = $pdo->query("SELECT COUNT(*) FROM events");
if ($stmt->fetchColumn() == 0) {
    $events = [
        ["Freshers' Welcome Party", 'January 20, 2026', 'EASTC Main Hall', 0],
        ['Inter-College Sports Day', 'February 14, 2026', 'EASTC Sports Ground', 1],
        ['Academic Workshop: Data Science', 'March 5, 2026', 'Computer Lab 2', 2],
        ['Cultural Night', 'April 10, 2026', 'EASTC Auditorium', 3],
        ['Leadership Seminar', 'May 22, 2026', 'Conference Room A', 4]
    ];
    $stmt = $pdo->prepare("INSERT INTO events (name, event_date, venue, sort_order) VALUES (?, ?, ?, ?)");
    foreach ($events as $e) {
        $stmt->execute($e);
    }
}

// Insert default announcements if not exists
$stmt = $pdo->query("SELECT COUNT(*) FROM announcements");
if ($stmt->fetchColumn() == 0) {
    $announcements = [
        ['Registration Deadline', 'All students must complete course registration by January 15, 2026.', 0],
        ['Library Hours Extended', 'The library will now remain open until 10:00 PM on weekdays during exam period.', 1],
        ['Student ID Replacement', 'Students who lost their IDs should visit the administration office for replacement.', 2],
        ['Scholarship Opportunities', 'New scholarship applications for the 2026/2027 academic year are now open.', 3],
        ['Health Check-Up', 'Free health screening will be available at the campus clinic from January 25-30, 2026.', 4]
    ];
    $stmt = $pdo->prepare("INSERT INTO announcements (title, body, sort_order) VALUES (?, ?, ?)");
    foreach ($announcements as $a) {
        $stmt->execute($a);
    }
}

// Insert default activities if not exists
$stmt = $pdo->query("SELECT COUNT(*) FROM activities");
if ($stmt->fetchColumn() == 0) {
    $activities = [
        ['Debate Competition', '2026-02-10', 'Annual inter-class debate competition on current affairs.', 0],
        ['Community Clean-Up Day', '2026-03-15', 'Volunteer activity to clean and beautify the campus environment.', 1],
        ['Programming Workshop', '2026-04-05', 'Introductory workshop on Python programming for beginners.', 2]
    ];
    $stmt = $pdo->prepare("INSERT INTO activities (name, activity_date, description, sort_order) VALUES (?, ?, ?, ?)");
    foreach ($activities as $a) {
        $stmt->execute($a);
    }
}

jsonResponse(['success' => true, 'message' => 'Database initialized successfully with default data.']);
