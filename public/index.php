<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

require_once __DIR__ . '/../config/database.php';
include __DIR__ . '/../views/layout/header.php';

$page = $_GET['page'] ?? 'home';

echo "<main class='container mt-5'>";

switch ($page) {

    case 'home':
        echo "
        <div class='container d-flex justify-content-center align-items-center' style='min-height: 80vh; background-color: #F5F5F5;'>
            <div class='text-center p-5 rounded shadow' style='background-color: #FFFFFF;'>
        ";
    
        if (isset($_SESSION['user'])) {
            echo "
                <h1 class='mb-3' style='color: #5865F2;'>Bienvenue, " . htmlspecialchars($_SESSION['user']['username']) . " 👋</h1>
                <a href='controllers/AuthController.php?action=logout' class='btn' style='background-color: #F04747; color: white;'>Se déconnecter</a>
            ";
        } else {
            echo "
                <h1 class='mb-4' style='color: #5865F2;'>Bienvenue sur <span style='color: #2C2F33;'>ConnectSphere</span></h1>
                <a href='?page=login' class='btn me-2' style='background-color: #5865F2; color: white;'>Connexion</a>
                <a href='?page=register' class='btn btn-outline-primary' style='border-color: #99AAB5; color: #5865F2;'>Créer un compte</a>
            ";
        }
    
        echo "</div></div>";
        break;
    
    case 'login':
        include __DIR__ . '/../views/auth/login.php';
        break;

    case 'register':
        include __DIR__ . '/../views/auth/register.php';
        break;

    case 'logout':
        require __DIR__ . '/../controllers/AuthController.php';
        break;

    case 'feed':
        // Flux de publications avec commentaires et likes
        require_once __DIR__ . '/../models/Post.php';
        require_once __DIR__ . '/../models/add_Comment.php';
        require_once __DIR__ . '/../models/add_Like.php';
        require_once __DIR__ . '/../controllers/PostController.php';

        $postController = new PostController($pdo);
        $posts = $postController->getAllPosts();

        $action = $_GET['action'] ?? '';
        if ($action === 'comment' || $action === 'like') {
            require_once __DIR__ . '/../controllers/CommentLikeController.php';
        }

        include __DIR__ . '/../views/posts/feed.php';
        break;

    default:
        echo "<div class='text-danger fw-bold'>❌ Page non trouvée</div>";
        break;
}

echo "</main>";

include __DIR__ . '/../views/layout/footer.php';
