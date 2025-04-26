<?php
declare(strict_types=1);

// 1. Configuration et initialisation
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/auth.php';

// 2. Sécurité HTTP
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
header('Content-Security-Policy: default-src \'self\'');

// 3. Initialisation de la base de données
$db = getDBConnection();

// 4. Chargement des modèles et contrôleurs
require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Group.php';
require_once __DIR__ . '/models/GroupMember.php';
require_once __DIR__ . '/controllers/GroupController.php';

$userModel = new User($db);
$groupModel = new Group($db);
$groupMemberModel = new GroupMember($db);
$groupController = new GroupController($groupModel, $groupMemberModel, $userModel);

// 5. Traitement de la requête
$request = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$basePath = str_replace('/index.php', '', $_SERVER['SCRIPT_NAME'] ?? '');
$request = str_replace($basePath, '', $request);
$request = trim(preg_replace('/[^a-zA-Z0-9\/\-_]/', '', $request), '/');

$segments = explode('/', $request);
$page = $segments[0] ?? 'home';
$action = $segments[1] ?? null;
$param = $segments[2] ?? null;

// 6. Définition des routes
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
            'controller' => 'GroupController',
            'actions' => [
                'create' => [
                    'method' => 'GET|POST',
                    'controller_method' => 'createForm|create'
                ],
                'view' => [
                    'method' => 'GET',
                    'controller_method' => 'view',
                    'param_type' => 'int'
                ],
                'edit' => [
                    'method' => 'GET|POST',
                    'controller_method' => 'editForm|update',
                    'param_type' => 'int'
                ],
                'delete' => [
                    'method' => 'POST',
                    'controller_method' => 'delete',
                    'param_type' => 'int'
                ]
            ]
        ]
    ]
];

// 7. Vérification d'accès
$isPublic = array_key_exists($page, $routes['public']);
$isProtected = array_key_exists($page, $routes['protected']);

if (!($isPublic || $isProtected)) {
    http_response_code(404);
    include __DIR__ . '/views/errors/404.php';
    exit;
}

// 8. Vérification de l'authentification
if ($isProtected && !isLoggedIn()) {
    $_SESSION['login_redirect'] = $request;
    header('Location: /login');
    exit;
}

if (isLoggedIn() && $isPublic && in_array($page, ['login', 'register'])) {
    header('Location: /');
    exit;
}

// 9. Gestion des contrôleurs
if ($isProtected) {
    $routeConfig = $routes['protected'][$page];
    
    if ($action && isset($routeConfig['actions'][$action])) {
        $actionConfig = $routeConfig['actions'][$action];
        $allowedMethods = explode('|', $actionConfig['method']);
        
        if (!in_array($_SERVER['REQUEST_METHOD'], $allowedMethods)) {
            http_response_code(405);
            include __DIR__ . '/views/errors/405.php';
            exit;
        }
        
        $methodParts = explode('|', $actionConfig['controller_method']);
        $method = $methodParts[array_search($_SERVER['REQUEST_METHOD'], $allowedMethods)];
        
        // Validation du paramètre
        if (isset($actionConfig['param_type'])) {
            switch ($actionConfig['param_type']) {
                case 'int':
                    $param = filter_var($param, FILTER_VALIDATE_INT, [
                        'options' => ['min_range' => 1]
                    ]);
                    if ($param === false) {
                        http_response_code(400);
                        include __DIR__ . '/views/errors/400.php';
                        exit;
                    }
                    break;
            }
        }
        
        if (method_exists($groupController, $method)) {
            // Vérification des paramètres requis
            $reflection = new ReflectionMethod($groupController, $method);
            $params = $reflection->getParameters();
            
            $args = [];
            foreach ($params as $parameter) {
                $type = $parameter->getType();
                $name = $parameter->getName();
                
                if ($type && $type->getName() === 'int' && $name === 'groupId') {
                    $args[] = (int)$param;
                } else {
                    $args[] = null;
                }
            }
            
            $groupController->$method(...$args);
            exit;
        }
    }
    
    // Route par défaut si aucun contrôleur spécifique n'est appelé
    if (isset($routeConfig['controller'])) {
        $groupController->index();
        exit;
    }
}

// 10. Affichage des vues
try {
    ob_start();
    
    // En-tête commun
    include __DIR__ . '/templates/header.php';
    
    // Contenu spécifique
    $viewFile = $isPublic 
        ? $routes['public'][$page]['view'] 
        : $routes['protected'][$page]['view'];
    
    if (!file_exists(__DIR__ . '/' . $viewFile)) {
        throw new RuntimeException("View file {$viewFile} not found");
    }
    
    include __DIR__ . '/' . $viewFile;
    
    // Pied de page commun
    include __DIR__ . '/templates/footer.php';
    
    ob_end_flush();
} catch (Throwable $e) {
    ob_end_clean();
    http_response_code(500);
    error_log("Error in index.php: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    include __DIR__ . '/views/errors/500.php';
    exit;
}