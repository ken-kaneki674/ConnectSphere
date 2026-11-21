<?php
require_once '../../config/database.php';
require_once '../../models/User.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password required']);
    exit;
}

$user = new User();
$result = $user->login($data['username'], $data['password']);

if ($result) {
    $token = bin2hex(random_bytes(32));
    echo json_encode([
        'user' => $result,
        'token' => $token
    ]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
?>
