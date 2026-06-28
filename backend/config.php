<?php
/* =============================================
   EASTC Backend - Database Configuration
   ============================================= */

// Start session securely
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

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

// Helper: authenticate admin via session-stored dynamic token
function requireAdmin() {
    $token = '';
    
    // Check request headers
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $token = $headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $token = $headers['authorization'];
        }
    }
    
    // Fallback for servers not exposing Authorization in headers (e.g. CGI/FastCGI)
    if (empty($token)) {
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $token = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $token = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
    }

    $token = str_replace('Bearer ', '', $token);
    
    if (empty($token) || !isset($_SESSION['admin_token']) || $token !== $_SESSION['admin_token']) {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
}

// Session token manager (simple file-based)
function generateToken() {
    return bin2hex(random_bytes(32));
}
?>