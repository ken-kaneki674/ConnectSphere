<?php
require_once '../../config/config.php';
require_once '../../config/auth.php';
require_once '../../controllers/GroupPostController.php';

header('Content-Type: application/json');

$groupPostController = new GroupPostController($db);

// Gestion de l'upload d'image
$imagePath = null;
if (!empty($_FILES['image']['name'])) {
    $uploadDir = '../../uploads/posts/';
    $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
    $targetPath = $uploadDir . $fileName;
    
    if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        $imagePath = $fileName;
    }
}

$result = $groupPostController->createPost(
    $_POST['group_id'],
    $_SESSION['user_id'],
    $_POST['content'],
    $imagePath
);

echo json_encode($result);
?>