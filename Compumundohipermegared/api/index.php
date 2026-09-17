<?php
// api/index.php

ob_start();

require_once 'autoload.php';
\App\Utils\EnvLoader::load(__DIR__ . '/.env');
\App\Utils\EnvLoader::load(dirname(__DIR__) . '/.env');

$debug = getenv('APP_DEBUG');
$debugEnabled = is_string($debug) && in_array(strtolower($debug), ['1', 'true', 'yes', 'on'], true);

if ($debugEnabled) {
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(E_ALL);
}

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/database.php';

try {
    $db = (new Database())->getConnection();
} catch (Exception $e) {
    ob_clean();
    error_log('DB connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'No se pudo conectar al servidor. Intentá de nuevo más tarde.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$base = getenv('API_BASE_PATH') ?: '/api';
$router = new \App\Utils\Router($base, $db);

require_once 'routes.php';

ob_get_clean();
$router->run();
