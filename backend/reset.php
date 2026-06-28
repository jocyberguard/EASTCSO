<?php
/* reset.php - Reset all data to defaults */
require 'config.php';
requireAdmin();

$pdo->exec("DELETE FROM leaders");
$pdo->exec("DELETE FROM events");
$pdo->exec("DELETE FROM announcements");
$pdo->exec("DELETE FROM activities");
$pdo->exec("DELETE FROM gallery");

// Reset site info to defaults
$pdo->prepare("UPDATE site_info SET title = ?, tagline = ?, welcome = ?, logo = ?, logo_file = NULL, mission = ?, footer = ? WHERE id = 1")
    ->execute([
        'EASTC Students Organization',
        'Empowering Students, Building Leaders',
        'Welcome to the official portal of the EASTC Students Organization! We are a vibrant community dedicated to enhancing student life, fostering academic excellence, and building tomorrow\'s leaders at the Eastern Africa Statistical Training Centre.',
        'img/logoo.png',
        "Promote academic excellence among all students\nFoster unity and cooperation within the student community\nOrganize social, cultural, and sporting activities\nRepresent student interests to the college administration\nProvide platforms for leadership development\nSupport students' welfare and personal growth",
        'Made with dedication for EASTC Students'
    ]);

// Re-insert defaults
$leaders = [
    ['John Student', 'President', 'Leading the organization with vision and dedication to serve all students.', 'fa-user-tie', 0],
    ['Amina Hassan', 'Vice President', 'Supporting organizational initiatives and driving student engagement.', 'fa-user-graduate', 1],
    ['Peter Joseph', 'Secretary', 'Managing communication and keeping accurate organizational records.', 'fa-user-edit', 2],
    ['Grace Mwamba', 'Treasurer', 'Overseeing financial planning and transparent budget management.', 'fa-user-shield', 3]
];
$stmt = $pdo->prepare("INSERT INTO leaders (name, role, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)");
foreach ($leaders as $l) { $stmt->execute($l); }

$events = [
    ["Freshers' Welcome Party", 'January 20, 2026', 'EASTC Main Hall', 0],
    ['Inter-College Sports Day', 'February 14, 2026', 'EASTC Sports Ground', 1],
    ['Academic Workshop: Data Science', 'March 5, 2026', 'Computer Lab 2', 2],
    ['Cultural Night', 'April 10, 2026', 'EASTC Auditorium', 3],
    ['Leadership Seminar', 'May 22, 2026', 'Conference Room A', 4]
];
$stmt = $pdo->prepare("INSERT INTO events (name, event_date, venue, sort_order) VALUES (?, ?, ?, ?)");
foreach ($events as $e) { $stmt->execute($e); }

$announcements = [
    ['Registration Deadline', 'All students must complete course registration by January 15, 2026.', 0],
    ['Library Hours Extended', 'The library will now remain open until 10:00 PM on weekdays during exam period.', 1],
    ['Student ID Replacement', 'Students who lost their IDs should visit the administration office for replacement.', 2],
    ['Scholarship Opportunities', 'New scholarship applications for the 2026/2027 academic year are now open.', 3],
    ['Health Check-Up', 'Free health screening will be available at the campus clinic from January 25-30, 2026.', 4]
];
$stmt = $pdo->prepare("INSERT INTO announcements (title, body, sort_order) VALUES (?, ?, ?)");
foreach ($announcements as $a) { $stmt->execute($a); }

$activities = [
    ['Debate Competition', '2026-02-10', 'Annual inter-class debate competition on current affairs.', 0],
    ['Community Clean-Up Day', '2026-03-15', 'Volunteer activity to clean and beautify the campus environment.', 1],
    ['Programming Workshop', '2026-04-05', 'Introductory workshop on Python programming for beginners.', 2]
];
$stmt = $pdo->prepare("INSERT INTO activities (name, activity_date, description, sort_order) VALUES (?, ?, ?, ?)");
foreach ($activities as $a) { $stmt->execute($a); }

jsonResponse(['success' => true, 'message' => 'All data reset to defaults.']);
?>