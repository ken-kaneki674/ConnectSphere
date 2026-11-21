<?php
require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Group.php';
require_once __DIR__ . '/PostController.php';

class UserController {
    private $userModel;
    private $groupModel;
    private $postController;

    public function __construct($pdo) {
        $this->userModel = new User($pdo);
        $this->groupModel = new Group($pdo);
        $this->postController = new PostController($pdo);
    }

    // Données de la page profil (null si l'utilisateur n'existe pas)
    public function getProfile($user_id) {
        $user = $this->userModel->findById($user_id);
        if (!$user) {
            return null;
        }
        return [
            'user' => $user,
            'posts' => $this->postController->getUserPosts($user_id),
            'groups_count' => $this->groupModel->countForUser($user_id),
            'is_own' => (int)$user_id === (int)currentUser()['id'],
        ];
    }

    public function handlePost() {
        requireLogin();
        $userId = currentUser()['id'];

        if (!checkCsrf()) {
            flash('danger', "Session expirée, veuillez réessayer.");
        } elseif (($_POST['action'] ?? '') === 'update_bio') {
            $bio = trim($_POST['bio'] ?? '');
            $this->userModel->updateBio($userId, $bio);
            $_SESSION['user']['bio'] = $bio;
            flash('success', "Profil mis à jour.");
        }

        redirect('index.php?page=profile&id=' . $userId);
    }
}
