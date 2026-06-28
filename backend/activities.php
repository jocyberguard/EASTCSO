<?php
/* activities.php - CRUD for Activities */
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT id, name, activity_date as date, description, sort_order FROM activities ORDER BY sort_order, id");
    jsonResponse($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdmin();
    $data = getJsonInput();
    $stmt = $pdo->prepare("INSERT INTO activities (name, activity_date, description, sort_order) VALUES (?, ?, ?, ?)");
    $stmt->execute([
        $data['name'] ?? '',
        $data['date'] ?? '',
        $data['description'] ?? '',
        $data['sort_order'] ?? 0
    ]);
    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    $stmt = $pdo->prepare("UPDATE activities SET name = ?, activity_date = ?, description = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $data['name'] ?? '',
        $data['date'] ?? '',
        $data['description'] ?? '',
        $data['sort_order'] ?? 0,
        $data['id']
    ]);
    jsonResponse(['success' => true, 'message' => 'Activity updated']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    $stmt = $pdo->prepare("DELETE FROM activities WHERE id = ?");
    $stmt->execute([$data['id']]);
    jsonResponse(['success' => true, 'message' => 'Activity deleted']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
?>