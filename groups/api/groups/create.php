<?php
require_once '../../config/config.php';
require_once '../../config/auth.php';
require_once '../../controllers/GroupController.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$groupController = new GroupController($db);
$result = $groupController->createGroup($data, $_SESSION['user_id']);

echo json_encode($result);
?>