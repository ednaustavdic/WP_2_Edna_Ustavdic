<?php
$DB_HOST = '127.0.0.1';
$DB_USER = 'root';
$DB_PASS = '';
$DB_NAME = 'kontakt_baza';

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed: '.$mysqli->connect_error]);
    exit;
}

$mysqli->set_charset('utf8mb4');
?>
