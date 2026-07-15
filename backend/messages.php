<?php
/* messages.php - Handle contact submissions & admin retrieval */
require 'config.php';

if ($_METHOD === 'GET') {
    requireAdmin();
    try {
        $stmt = $pdo->query("SELECT id, name, email, message, created_at FROM messages ORDER BY id DESC");
        jsonResponse($stmt->fetchAll());
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), "doesn't exist") !== false || strpos($e->getMessage(), "not found") !== false) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )");
                jsonResponse([]);
            } catch (PDOException $ex) {
                jsonResponse(['error' => 'Database error: ' . $ex->getMessage()], 500);
            }
        } else {
            jsonResponse(['error' => 'Database query failed: ' . $e->getMessage()], 500);
        }
    }
}

if ($_METHOD === 'POST') {
    $data = getJsonInput();
    
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $message = trim($data['message'] ?? '');
    
    if (empty($name) || empty($email) || empty($message)) {
        jsonResponse(['error' => 'All fields (name, email, message) are required.'], 400);
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Invalid email address.'], 400);
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)");
        $stmt->execute([$name, $email, $message]);
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), "doesn't exist") !== false || strpos($e->getMessage(), "not found") !== false) {
            try {
                $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )");
                $stmt = $pdo->prepare("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)");
                $stmt->execute([$name, $email, $message]);
            } catch (PDOException $ex) {
                jsonResponse(['error' => 'Failed to create table and insert: ' . $ex->getMessage()], 500);
            }
        } else {
            jsonResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
        }
    }
    
    jsonResponse(['success' => true, 'message' => 'Message stored successfully.', 'id' => $pdo->lastInsertId()]);
}

if ($_METHOD === 'DELETE') {
    requireAdmin();
    $data = getJsonInput();
    if (empty($data['id'])) {
        jsonResponse(['error' => 'ID required'], 400);
    }
    
    $stmt = $pdo->prepare("DELETE FROM messages WHERE id = ?");
    $stmt->execute([$data['id']]);
    jsonResponse(['success' => true, 'message' => 'Message deleted successfully.']);
}

jsonResponse(['error' => 'Method not allowed'], 405);
?>
