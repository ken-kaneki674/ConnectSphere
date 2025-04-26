<?php
// Démarre la session si nécessaire
session_start();

// Inclure le fichier de configuration de la base de données
require_once '../config/database.php';

// Inclure les modèles
require_once '../models/Post.php';
require_once '../models/add_Comment.php';
require_once '../models/add_Like.php';

// Inclure le contrôleur pour gérer l'affichage des publications
require_once '../controllers/PostController.php';

// Instancier le contrôleur des publications
$controller = new PostController($pdo); // Ligne 17 corrigée


// Récupérer toutes les publications
$posts = $postController->getAllPosts();

// Inclure la vue pour afficher les publications
include '../views/posts/feed.php';

// Chargement des classes
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/../models/',
        __DIR__ . '/../controllers/'
    ];
    foreach ($paths as $path) {
        $file = $path . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

$action = $_GET['action'] ?? '';
switch ($action) {
    case 'comment':
        require_once __DIR__ . '/../controllers/CommentLikeController.php';
        break;
    // ... autres routes
}