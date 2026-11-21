<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

// Router simple
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$path = str_replace('/api', '', $path);

switch ($path) {
    case '/auth/login':
        require_once 'auth/login.php';
        break;
    case '/auth/register':
        require_once 'auth/register.php';
        break;
    case '/auth/profile':
        require_once 'auth/profile.php';
        break;
    case '/posts':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            require_once 'posts/get.php';
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            require_once 'posts/create.php';
        }
        break;
    case preg_match('/^\/posts\/(\d+)\/comments$/', $path, $matches):
        $_GET['post_id'] = $matches[1];
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            require_once 'comments/get.php';
        } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
            require_once 'comments/create.php';
        }
        break;
    case preg_match('/^\/posts\/(\d+)\/like$/', $path, $matches):
        $_GET['post_id'] = $matches[1];
        require_once 'likes/toggle.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>
