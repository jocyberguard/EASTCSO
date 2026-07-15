<?php
/* announcements.php - CRUD for Announcements */
require 'config.php';

if ($_METHOD === 'GET') {
    $stmt = $pdo->query("SELECT id, title, body, sort_order FROM announcements ORDER BY sort_order, id");
    jsonResponse($stmt->fetchAll());
}

if ($_METHOD === 'POST') {
    requireAdmin();
    $data = getJsonInput();
    $stmt = $pdo->prepare("INSERT INTO announcements (title, body, sort_order) VALUES (?, ?, ?)");
    $stmt->execute([
        $data['title'] ?? '',
        $data['body'] ?? '',
        $data['sort_order'] ?? 0
    ]);
    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
}

if ($_METHOD === 'PUT') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    $stmt = $pdo->prepare("UPDATE announcements SET title = ?, body = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $data['title'] ?? '',
        $data['body'] ?? '',
        $data['sort_order'] ?? 0,
        $data['id']
    ]);
    jsonResponse(['success' => true, 'message' => 'Announcement updated']);
}

if ($_METHOD === 'DELETE') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
    $stmt->execute([$data['id']]);
    jsonResponse(['success' => true, 'message' => 'Announcement deleted']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
?>