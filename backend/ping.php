<?php
/* ping.php - Simple health check */
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['status' => 'ok']);
