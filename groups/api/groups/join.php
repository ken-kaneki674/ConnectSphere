<?php
require_once '../../config/config.php';
require_once '../../config/auth.php';
require_once '../../controllers/GroupController.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if (empty($data['group_id'])) {
    echo json_encode(['success' => false, 'message' => 'ID de groupe manquant']);
    exit;
}

$groupController = new GroupController($db);
$result = $groupController->joinGroup($data['group_id'], $_SESSION['user_id']);

echo json_encode($result);
?>