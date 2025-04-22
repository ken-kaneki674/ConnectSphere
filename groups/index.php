<?php
// 1. Configuration et initialisation
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/auth.php';

// 2. Gestion des sessions et sécurité
session_start();
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');

// 3. Routage intelligent
$request = $_SERVER['REQUEST_URI'];
$basePath = str_replace('/index.php', '', $_SERVER['SCRIPT_NAME']);
$request = str_replace($basePath, '', $request);

// Nettoyage de l'URL
$request = preg_replace('/[^a-zA-Z0-9\/\-_]/', '', $request);
$request = trim($request, '/');
$parts = explode('/', $request);

// 4. Détermination de la page et des paramètres
$page = $parts[0] ?: 'home';
$params = array_slice($parts, 1);

// 5. Liste des routes autorisées
$publicRoutes = [
    'home' => 'views/home.php',
    'login' => 'views/auth/login.php',
    'register' => 'views/auth/register.php',
    'forgot-password' => 'views/auth/forgot-password.php'
];

$protectedRoutes = [
    'profile' => 'views/profile.php',
    'groups' => 'groups/views/list.php',
    'posts' => 'views/posts/list.php',
    'messages' => 'views/messages/inbox.php',
    'settings' => 'views/user/settings.php'
];

// 6. Vérification d'accès
$isLoggedIn = isset($_SESSION['user_id']);
$isPublicRoute = array_key_exists($page, $publicRoutes);
$isProtectedRoute = array_key_exists($page, $protectedRoutes);

// 7. Gestion des accès non autorisés
if (!$isLoggedIn && $isProtectedRoute) {
    header('Location: /login');
    exit;
}

if ($isLoggedIn && ($page === 'login' || $page === 'register')) {
    header('Location: /');
    exit;
}

// 8. Gestion des erreurs 404
if (!$isPublicRoute && !$isProtectedRoute) {
    http_response_code(404);
    $page = '404';
    $pageFile = 'views/errors/404.php';
} else {
    $pageFile = $isPublicRoute ? $publicRoutes[$page] : $protectedRoutes[$page];
}

// 9. Chargement des dépendances nécessaires
if ($isProtectedRoute) {
    require_once __DIR__ . '/models/User.php';
    $currentUser = (new User($db))->getUserById($_SESSION['user_id']);
    
    if (strpos($page, 'groups') === 0) {
        require_once __DIR__ . '/groups/models/Group.php';
        require_once __DIR__ . '/groups/models/GroupMember.php';
    }
}

// 10. Affichage du template
ob_start();
try {
    // En-tête
    require_once __DIR__ . '/templates/header.php';
    
    // Contenu principal
    if (file_exists(__DIR__ . '/' . $pageFile)) {
        require_once __DIR__ . '/' . $pageFile;
    } else {
        throw new Exception("Template file not found");
    }
    
    // Pied de page
    require_once __DIR__ . '/templates/footer.php';
} catch (Exception $e) {
    ob_end_clean();
    http_response_code(500);
    require_once __DIR__ . '/views/errors/500.php';
    exit;
}

ob_end_flush();