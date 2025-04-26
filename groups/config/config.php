<?php
// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'connectsphere');
define('DB_USER', 'root');
define('DB_PASS', '');

// Configuration de l'application
define('APP_ROOT', dirname(dirname(__FILE__)));
define('URL_ROOT', 'http://localhost/connectsphere');
define('SITE_NAME', 'ConnectSphere');
define('ENVIRONMENT', 'development');

// Configuration des uploads
define('UPLOAD_DIR', APP_ROOT . '/public/uploads');
define('MAX_UPLOAD_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif']);

// Initialisation de la session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Fonction pour obtenir la connexion PDO
function getDBConnection(): PDO {
    static $db = null;
    
    if ($db === null) {
        try {
            $db = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            error_log('Database connection error: ' . $e->getMessage());
            if (ENVIRONMENT === 'development') {
                die('Database connection failed: ' . $e->getMessage());
            } else {
                die('Database connection failed. Please try again later.');
            }
        }
    }
    
    return $db;
}

// Fonction de sécurisation des entrées
function sanitize($data): string {
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// Génération de token CSRF
function generateCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

// Fonction de redirection
function redirect(string $location, int $statusCode = 302): void {
    header("Location: $location", true, $statusCode);
    exit;
}