<?php
require_once '../../config/config.php';
require_once '../../config/auth.php';
require_once '../../controllers/GroupMessageController.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if (empty($data['group_id']) || empty($data['message'])) {
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

$messageController = new GroupMessageController($db);
$result = $messageController->sendMessage($data['group_id'], $_SESSION['user_id'], $data['message']);

echo json_encode($result);
?>