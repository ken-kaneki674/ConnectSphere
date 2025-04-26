<?php
declare(strict_types=1);

// Vérification de la session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Vérifie le token CSRF
 */
function verifyCsrfToken(string $token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Vérifie si l'utilisateur est connecté
 */
function isLoggedIn(): bool {
    if (empty($_SESSION['user_id'])) {
        return false;
    }
    
    // Vérification que l'ID est bien numérique
    if (!is_numeric($_SESSION['user_id'])) {
        unset($_SESSION['user_id']);
        return false;
    }
    
    return true;
}

/**
 * Redirection si non connecté
 */
function requireAuth(): void {
    if (!isLoggedIn()) {
        $_SESSION['login_redirect'] = $_SERVER['REQUEST_URI'];
        header('Location: /login');
        exit;
    }
}