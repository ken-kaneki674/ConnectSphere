<?php
// 1. Configuration et initialisation
declare(strict_types=1);
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/auth.php';
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Group.php';

// 2. Sécurité HTTP
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');

// 3. Routage intelligent
$request = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$request = str_replace(str_replace('/index.php', '', $_SERVER['SCRIPT_NAME']), '', $request);
$request = trim(preg_replace('/[^a-zA-Z0-9\/\-_]/', '', $request), '/');

[$page, $params] = array_pad(explode('/', $request, 2), 2, null);

// 4. Définition des routes (externalisable dans config/routes.php)
$routes = [
    'public' => [
        'home' => ['view' => 'views/home.php', 'title' => 'Accueil'],
        'login' => ['view' => 'views/auth/login.php', 'title' => 'Connexion'],
        'register' => ['view' => 'views/auth/register.php', 'title' => 'Inscription'],
    ],
    'protected' => [
        'profile' => [
            'view' => 'views/profile.php',
            'title' => 'Profil',
            'model' => 'User'
        ],
        'groups' => [
            'view' => 'views/groups/list.php',
            'title' => 'Groupes',
            'models' => ['Group', 'GroupMember'],
            'actions' => [
                'create' => [
                    'view' => 'views/groups/create.php', 
                    'title' => 'Créer un groupe',
                    'method' => 'GET']
            ]
        ]
    ]
];

// 5. Vérification d'accès
$isPublic = array_key_exists($page, $routes['public']);
$isProtected = array_key_exists($page, $routes['protected']);

if (!($isPublic || $isProtected)) {
    http_response_code(404);
    $page = '404';
    $route = ['view' => 'views/errors/404.php', 'title' => 'Page non trouvée'];
} else {
    $route = $isPublic ? $routes['public'][$page] : $routes['protected'][$page];
}

// 6. Gestion des accès
if ($isProtected && !isLoggedIn()) {
    $_SESSION['login_redirect'] = $request;
    header('Location: /login');
    exit;
}

if (isLoggedIn() && $isPublic && in_array($page, ['login', 'register'])) {
    header('Location: /');
    exit;
}

// 7. Chargement des dépendances
if ($isProtected) {
    if (isset($route['models'])) {
        foreach ($route['models'] as $model) {
            require_once __DIR__ . "/models/{$model}.php";
        }
    }
    
    $currentUser = (new User($db))->getUserById($_SESSION['user_id']);
    $pageTitle = $route['title'] ?? 'ConnectSphere';
}

// 8. Rendering avec gestion d'erreurs
try {
    ob_start();
    
    // En-tête
    require_once __DIR__ . '/templates/header.php';
    
    // Contenu principal
    if (!file_exists(__DIR__ . '/' . $route['view'])) {
        throw new RuntimeException("View file {$route['view']} not found");
    }
    
    require __DIR__ . '/' . $route['view'];
    
    // Pied de page
    require_once __DIR__ . '/templates/footer.php';
    
    ob_end_flush();
} catch (Throwable $e) {
    ob_end_clean();
    http_response_code(500);
    error_log("Error in index.php: " . $e->getMessage());
    require_once __DIR__ . '/views/errors/500.php';
    exit;
}