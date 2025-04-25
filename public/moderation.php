<?php
declare(strict_types=1);

// Configuration de base
define('BASE_PATH', realpath(__DIR__.'/..'));
define('BASE_URL', '/connectsphere/public');

// Activation des erreurs
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

// Autoloader personnalisé
spl_autoload_register(function ($class) {
    // Remplacez les barres obliques inversées par des barres obliques
    $file = BASE_PATH . '/' . str_replace('\\', '/', $class) . '.php';
    
    // Vérifiez si le fichier existe
    if (file_exists($file)) {
        require $file;
    }
});

// Fichiers requis obligatoires
$requiredFiles = [
    BASE_PATH.'/config/database_functions.php',
    BASE_PATH.'/models/Report.php',
    BASE_PATH.'/controllers/ModerationController.php' // Ajout du contrôleur requis
];

foreach ($requiredFiles as $file) {
    if (!file_exists($file)) {
        die("<h1>Erreur Critique</h1><p>Fichier manquant: " . htmlspecialchars(basename($file)) . "</p>");
    }
    require_once $file;
}

// Initialisation session
session_start();

try {
    // Connexion DB
    $db = getDBConnection();
    
    // Instanciation du contrôleur
    $controller = new ModerationController($db);
    $controller->handleRequest();

} catch (Throwable $e) {
    // Gestion d'erreur basique
    http_response_code(500);
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Erreur Application</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .error-container { 
                background: #f8d7da; 
                border: 1px solid #f5c6cb;
                padding: 20px;
                border-radius: 5px;
                color: #721c24;
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <h1>Erreur Application</h1>
            <p><?= htmlspecialchars($e->getMessage()) ?></p>
        </div>
    </body>
    </html>
    <?php
    exit;
}