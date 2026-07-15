<?php
/* reset.php - Reset all data to defaults */
require 'config.php';
requireAdmin();

$pdo->exec("DELETE FROM leaders");
$pdo->exec("DELETE FROM events");
$pdo->exec("DELETE FROM announcements");
$pdo->exec("DELETE FROM activities");
$pdo->exec("DELETE FROM gallery");
$pdo->exec("DELETE FROM messages");

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

// Re-inserting default site information is done above.
// Dummy data for leaders, events, announcements, and activities has been removed.

jsonResponse(['success' => true, 'message' => 'All data reset to defaults.']);
?>