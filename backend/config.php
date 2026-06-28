<?php
/* =============================================
   EASTC Backend - Database Configuration
   ============================================= */

// Database settings - UPDATE THESE for your hosting
$db_host = 'localhost';
$db_name = 'eastc_db';
$db_user = 'root';
$db_pass = '';

// Admin credentials (same as before)
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'eastc2026');

// CORS headers for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Helper: read JSON input
function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

// Helper: send JSON response
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

// Helper: authenticate admin via simple token
function requireAdmin() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);
    if ($token !== 'eastc-admin-token') {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
}

// Session token manager (simple file-based)
function generateToken() {
    return bin2hex(random_bytes(32));
}
?>