<?php
// Point d'entrée de la version PHP MVC.
// Afficher les erreurs uniquement en développement : APP_DEBUG=1
$debug = getenv('APP_DEBUG') === '1';
ini_set('display_errors', $debug ? '1' : '0');
error_reporting(E_ALL);

require_once __DIR__ . '/../includes/functions.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/PostController.php';
require_once __DIR__ . '/../controllers/GroupController.php';
require_once __DIR__ . '/../controllers/UserController.php';

$page = $_GET['page'] ?? 'home';
$isPost = $_SERVER['REQUEST_METHOD'] === 'POST';
$error = null;

// 1) Actions : traitées AVANT tout affichage pour que les redirections fonctionnent
switch ($page) {
    case 'login':
        if (isLoggedIn()) redirect('index.php?page=feed');
        if ($isPost) $error = (new AuthController($pdo))->login();
        break;
    case 'register':
        if (isLoggedIn()) redirect('index.php?page=feed');
        if ($isPost) $error = (new AuthController($pdo))->register();
        break;
    case 'logout':
        (new AuthController($pdo))->logout();
        break;
    case 'feed':
        if ($isPost) (new PostController($pdo))->handlePost();
        break;
    case 'groups':
        requireLogin();
        if ($isPost) (new GroupController($pdo))->handlePost();
        break;
    case 'profile':
        requireLogin();
        if ($isPost) (new UserController($pdo))->handlePost();
        break;
    case 'messages':
        requireLogin();
        redirect('pages/message.php');
        break;
}

// 2) Affichage
include __DIR__ . '/../views/layout/header.php';

echo "<main class='container mt-4 mb-5'>";

switch ($page) {
    case 'home':
        include __DIR__ . '/../views/home.php';
        break;

    case 'login':
        include __DIR__ . '/../views/auth/login.php';
        break;

    case 'register':
        include __DIR__ . '/../views/auth/register.php';
        break;

    case 'feed':
        $posts = (new PostController($pdo))->getAllPosts();
        include __DIR__ . '/../views/posts/feed.php';
        break;

    case 'groups':
        $groups = (new GroupController($pdo))->getGroups();
        include __DIR__ . '/../views/groups/list.php';
        break;

    case 'profile':
        $profile = (new UserController($pdo))->getProfile((int)($_GET['id'] ?? currentUser()['id']));
        include __DIR__ . '/../views/profile/view.php';
        break;

    default:
        http_response_code(404);
        echo "<div class='text-danger fw-bold'>❌ Page non trouvée</div>";
        break;
}

echo "</main>";

include __DIR__ . '/../views/layout/footer.php';
