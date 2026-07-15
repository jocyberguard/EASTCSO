<?php
/* events.php - CRUD for Events */
require 'config.php';

if ($_METHOD === 'GET') {
    $stmt = $pdo->query("SELECT id, name, event_date as date, venue, image, sort_order FROM events ORDER BY sort_order, id");
    jsonResponse($stmt->fetchAll());
}

if ($_METHOD === 'POST') {
    requireAdmin();
    $data = getJsonInput();
    $stmt = $pdo->prepare("INSERT INTO events (name, event_date, venue, image, sort_order) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['name'] ?? '',
        $data['date'] ?? '',
        $data['venue'] ?? '',
        $data['image'] ?? null,
        $data['sort_order'] ?? 0
    ]);
    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
}

if ($_METHOD === 'PUT') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    $stmt = $pdo->prepare("UPDATE events SET name = ?, event_date = ?, venue = ?, image = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $data['name'] ?? '',
        $data['date'] ?? '',
        $data['venue'] ?? '',
        $data['image'] ?? null,
        $data['sort_order'] ?? 0,
        $data['id']
    ]);
    jsonResponse(['success' => true, 'message' => 'Event updated']);
}

if ($_METHOD === 'DELETE') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    $stmt->execute([$data['id']]);
    jsonResponse(['success' => true, 'message' => 'Event deleted']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
?>