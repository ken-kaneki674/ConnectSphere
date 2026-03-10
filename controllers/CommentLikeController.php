<?php
// controllers/CommentLikeController.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/add_Comment.php';
require_once __DIR__ . '/../models/add_Like.php';

session_start();

$commentModel = new Comment($pdo);
$likeModel = new Like($pdo);

// Ajouter un commentaire
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add_comment') {
    try {
        $newCommentId = $commentModel->addComment($_POST['post_id'], $_SESSION['user_id'], $_POST['content']);
        echo json_encode(['success' => true, 'comment_id' => $newCommentId]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Toggle like
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'toggle_like') {
    try {
        $result = $likeModel->toggleLike($_POST['post_id'], $_SESSION['user_id']);
        $likeCount = $likeModel->countLikes($_POST['post_id']);
        echo json_encode(['status' => $result, 'count' => $likeCount]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}