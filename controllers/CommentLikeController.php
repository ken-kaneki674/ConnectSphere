<?php
// controllers/CommentLikeController.php — réponses JSON pour assets/js/comments-likes.js
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/add_Comment.php';
require_once __DIR__ . '/../models/add_Like.php';

class CommentLikeController {
    private $commentModel;
    private $likeModel;

    public function __construct($pdo) {
        $this->commentModel = new Comment($pdo);
        $this->likeModel = new Like($pdo);
    }

    private function json($data, $status = 200) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public function handle() {
        $action = $_REQUEST['action'] ?? '';
        $postId = (int)($_REQUEST['post_id'] ?? 0);

        if ($action === 'get_comments' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $this->json(['comments' => $this->commentModel->getComments($postId)]);
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->json(['error' => 'Méthode non autorisée'], 405);
        }
        if (!isLoggedIn()) {
            $this->json(['error' => 'Vous devez être connecté'], 401);
        }
        if (!checkCsrf()) {
            $this->json(['error' => 'Jeton CSRF invalide'], 403);
        }

        $userId = currentUser()['id'];

        try {
            if ($action === 'add_comment') {
                $content = trim($_POST['content'] ?? '');
                if ($content === '') {
                    $this->json(['error' => 'Commentaire vide'], 400);
                }
                $this->commentModel->addComment($postId, $userId, $content);
                $this->json(['success' => true, 'comments' => $this->commentModel->getComments($postId)]);
            }

            if ($action === 'toggle_like') {
                $status = $this->likeModel->toggleLike($postId, $userId);
                $this->json(['status' => $status, 'count' => $this->likeModel->countLikes($postId)]);
            }
        } catch (PDOException $e) {
            error_log($e->getMessage());
            $this->json(['error' => 'Erreur serveur'], 500);
        }

        $this->json(['error' => 'Action inconnue'], 400);
    }
}
