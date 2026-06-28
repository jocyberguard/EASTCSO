<?php
/* auth.php - Admin Login */
require 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$data = getJsonInput();
$user = $data['username'] ?? '';
$pass = $data['password'] ?? '';

if ($user === ADMIN_USER && $pass === ADMIN_PASS) {
    jsonResponse(['success' => true, 'token' => 'eastc-admin-token']);
} else {
    jsonResponse(['error' => 'Invalid credentials'], 401);
}
?>