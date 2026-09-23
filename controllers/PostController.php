<?php
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/Post.php';

class PostController {
    private $postModel;

    public function __construct($pdo) {
        $this->postModel = new Post($pdo);
    }

    public function getAllPosts() {
        $viewer = currentUser();
        return $this->postModel->getPostsWithCommentsAndLikes($viewer['id'] ?? 0);
    }

    public function getUserPosts($user_id) {
        $viewer = currentUser();
        return $this->postModel->getPostsWithCommentsAndLikes($viewer['id'] ?? 0, $user_id);
    }

    // Traite les formulaires du fil d'actualité (création / suppression)
    public function handlePost() {
        requireLogin();
        if (!checkCsrf()) {
            flash('danger', "Session expirée, veuillez réessayer.");
            redirect('index.php?page=feed');
        }

        $user = currentUser();
        $action = $_POST['action'] ?? '';

        if ($action === 'create') {
            $content = trim($_POST['content'] ?? '');
            if ($content === '') {
                flash('danger', "La publication ne peut pas être vide.");
            } else {
                $this->postModel->createPost($user['id'], $content);
                flash('success', "Publication créée !");
            }
        } elseif ($action === 'delete') {
            if ($this->postModel->deletePost((int)($_POST['post_id'] ?? 0), $user['id'])) {
                flash('success', "Publication supprimée.");
            }
        }

        redirect('index.php?page=feed');
    }
}
