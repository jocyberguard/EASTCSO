<?php
/* leaders.php - CRUD for Leaders */
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM leaders ORDER BY sort_order, id");
    jsonResponse($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdmin();
    $data = getJsonInput();
    $stmt = $pdo->prepare("INSERT INTO leaders (name, role, description, icon, photo, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['name'] ?? '',
        $data['role'] ?? '',
        $data['description'] ?? '',
        $data['icon'] ?? 'fa-user',
        $data['photo'] ?? null,
        $data['sort_order'] ?? 0
    ]);
    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    $stmt = $pdo->prepare("UPDATE leaders SET name = ?, role = ?, description = ?, icon = ?, photo = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $data['name'] ?? '',
        $data['role'] ?? '',
        $data['description'] ?? '',
        $data['icon'] ?? 'fa-user',
        $data['photo'] ?? null,
        $data['sort_order'] ?? 0,
        $data['id']
    ]);
    jsonResponse(['success' => true, 'message' => 'Leader updated']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    $stmt = $pdo->prepare("DELETE FROM leaders WHERE id = ?");
    $stmt->execute([$data['id']]);
    jsonResponse(['success' => true, 'message' => 'Leader deleted']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
?>