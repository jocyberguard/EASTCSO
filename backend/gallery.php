<?php
/* gallery.php - CRUD for Gallery */
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT id, title, image, sort_order FROM gallery ORDER BY sort_order, id");
    jsonResponse($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    requireAdmin();
    $data = getJsonInput();
    $stmt = $pdo->prepare("INSERT INTO gallery (title, image, sort_order) VALUES (?, ?, ?)");
    $stmt->execute([
        $data['title'] ?? '',
        $data['image'] ?? '',
        $data['sort_order'] ?? 0
    ]);
    jsonResponse(['success' => true, 'id' => $pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    $stmt = $pdo->prepare("UPDATE gallery SET title = ?, image = ?, sort_order = ? WHERE id = ?");
    $stmt->execute([
        $data['title'] ?? '',
        $data['image'] ?? '',
        $data['sort_order'] ?? 0,
        $data['id']
    ]);
    jsonResponse(['success' => true, 'message' => 'Gallery item updated']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) jsonResponse(['error' => 'ID required'], 400);
    
    // Delete file if exists
    $stmt = $pdo->prepare("SELECT image FROM gallery WHERE id = ?");
    $stmt->execute([$data['id']]);
    $row = $stmt->fetch();
    if ($row && $row['image'] && file_exists('../' . $row['image'])) {
        unlink('../' . $row['image']);
    }
    
    $stmt = $pdo->prepare("DELETE FROM gallery WHERE id = ?");
    $stmt->execute([$data['id']]);
    jsonResponse(['success' => true, 'message' => 'Gallery item deleted']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
?>