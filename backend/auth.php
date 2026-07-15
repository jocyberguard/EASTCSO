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
    $token = generateToken();
    // Save to session
    $_SESSION['admin_token'] = $token;
    // Also save to file as fallback for unreliable sessions
    saveTokenToFile($token);
    jsonResponse(['success' => true, 'token' => $token]);
} else {
    jsonResponse(['error' => 'Invalid credentials'], 401);
}
?>