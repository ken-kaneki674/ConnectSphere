<?php
function generateCsrfToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
function isLoggedIn() {
    // 1. Vérification de la session
    if (isset($_SESSION['user_id'])) {
        return true;
    }
    
    // 2. Vérification du cookie "Se souvenir de moi"
    if (isset($_COOKIE['remember_token'])) {
        require_once '../models/UserToken.php';
        $tokenModel = new UserToken($db);
        $userId = $tokenModel->verifyToken($_COOKIE['remember_token']);
        
        if ($userId) {
            $_SESSION['user_id'] = $userId;
            return true;
        }
    }
    
    return false;
}

