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

// =============================================
// METHOD OVERRIDE - InfinityFree blocks PUT/DELETE
// The frontend sends POST with _method=PUT or _method=DELETE
// =============================================
$_METHOD = $_SERVER['REQUEST_METHOD'];
if ($_METHOD === 'POST') {
    // Check JSON body for _method override
    $rawBody = file_get_contents('php://input');
    $jsonData = json_decode($rawBody, true);
    if (isset($jsonData['_method'])) {
        $_METHOD = strtoupper($jsonData['_method']);
    }
    // Also check query string as fallback
    if (isset($_GET['_method'])) {
        $_METHOD = strtoupper($_GET['_method']);
    }
}

// =============================================
// TOKEN FILE STORAGE - Fallback for unreliable sessions
// =============================================
define('TOKEN_FILE', __DIR__ . '/uploads/.admin_token');

function saveTokenToFile($token) {
    $data = json_encode([
        'token' => $token,
        'created' => time(),
        'expires' => time() + 3600 // 1 hour expiry
    ]);
    @file_put_contents(TOKEN_FILE, $data);
}

function getTokenFromFile() {
    if (!file_exists(TOKEN_FILE)) return null;
    $data = @json_decode(@file_get_contents(TOKEN_FILE), true);
    if (!$data || !isset($data['token'])) return null;
    // Check expiry
    if (isset($data['expires']) && time() > $data['expires']) {
        @unlink(TOKEN_FILE);
        return null;
    }
    return $data['token'];
}

function clearTokenFile() {
    if (file_exists(TOKEN_FILE)) {
        @unlink(TOKEN_FILE);
    }
}

// CORS headers for development and hosting
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

// Helper: read JSON input (cached since we already read it for _method)
function getJsonInput() {
    global $rawBody, $jsonData;
    if ($jsonData !== null) {
        // Remove the _method key so it doesn't pollute the data
        $result = $jsonData;
        unset($result['_method']);
        return $result;
    }
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw, true) ?? [];
    unset($decoded['_method']);
    return $decoded;
}

// Helper: send JSON response
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

// Helper: authenticate admin - tries multiple sources for the token
function requireAdmin() {
    $token = '';
    
    // 1. Check request headers (works on most servers)
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $token = $headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $token = $headers['authorization'];
        }
    }
    
    // 2. Fallback: $_SERVER variables (CGI/FastCGI)
    if (empty($token)) {
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $token = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $token = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
    }
    
    // 3. Fallback: query parameter (for hosts that strip all auth headers)
    if (empty($token) && isset($_GET['_token'])) {
        $token = $_GET['_token'];
    }

    $token = str_replace('Bearer ', '', $token);
    
    // Validate against session token
    $sessionToken = isset($_SESSION['admin_token']) ? $_SESSION['admin_token'] : null;
    
    // Also try file-based token as fallback
    $fileToken = getTokenFromFile();
    
    if (empty($token)) {
        jsonResponse(['error' => 'Unauthorized - no token provided'], 401);
    }
    
    // Accept if token matches either session or file-based token
    if (($sessionToken && $token === $sessionToken) || ($fileToken && $token === $fileToken)) {
        return; // Authorized
    }
    
    jsonResponse(['error' => 'Unauthorized - invalid token'], 401);
}

// Session token manager
function generateToken() {
    return bin2hex(random_bytes(32));
}
?>