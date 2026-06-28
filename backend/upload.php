<?php
/* upload.php - Image upload handler */
require 'config.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    jsonResponse(['error' => 'No file uploaded or upload error'], 400);
}

$file = $_FILES['image'];
$allowedMimeTypes = [
    'image/jpeg' => 'jpg',
    'image/pjpeg' => 'jpg',
    'image/png'  => 'png',
    'image/x-png' => 'png',
    'image/gif'  => 'gif',
    'image/webp' => 'webp'
];
$maxSize = 2 * 1024 * 1024; // 2MB

if (!array_key_exists($file['type'], $allowedMimeTypes)) {
    jsonResponse(['error' => 'Invalid file type. Only JPG, PNG, GIF, WebP allowed.'], 400);
}

if ($file['size'] > $maxSize) {
    jsonResponse(['error' => 'File too large. Max 2MB.'], 400);
}

$ext = $allowedMimeTypes[$file['type']];
$filename = 'upload_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$uploadPath = 'uploads/' . $filename;
$fullPath = __DIR__ . '/uploads/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
    jsonResponse(['error' => 'Failed to save file'], 500);
}

// Return relative path from project root
jsonResponse([
    'success' => true,
    'url' => 'backend/' . $uploadPath,
    'filename' => $filename
]);
?>