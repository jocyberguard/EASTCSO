<?php
/* site-info.php - Get/Update Site Info */
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM site_info WHERE id = 1");
    $info = $stmt->fetch();
    if ($info) {
        $info['mission'] = $info['mission'] ? explode("\n", $info['mission']) : [];
    }
    jsonResponse($info ?: ['error' => 'Not found'], $info ? 200 : 404);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    requireAdmin();
    $data = getJsonInput();
    $fields = [];
    $params = [];
    
    if (isset($data['title'])) { $fields[] = 'title = ?'; $params[] = $data['title']; }
    if (isset($data['tagline'])) { $fields[] = 'tagline = ?'; $params[] = $data['tagline']; }
    if (isset($data['welcome'])) { $fields[] = 'welcome = ?'; $params[] = $data['welcome']; }
    if (isset($data['logo'])) { $fields[] = 'logo = ?'; $params[] = $data['logo']; }
    if (isset($data['logo_file'])) { $fields[] = 'logo_file = ?'; $params[] = $data['logo_file']; }
    if (isset($data['mission'])) { $fields[] = 'mission = ?'; $params[] = is_array($data['mission']) ? implode("\n", $data['mission']) : $data['mission']; }
    if (isset($data['footer'])) { $fields[] = 'footer = ?'; $params[] = $data['footer']; }
    
    if (empty($fields)) {
        jsonResponse(['error' => 'No fields to update'], 400);
    }
    
    $sql = "UPDATE site_info SET " . implode(', ', $fields) . " WHERE id = 1";
    $pdo->prepare($sql)->execute($params);
    jsonResponse(['success' => true, 'message' => 'Site info updated']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
?>