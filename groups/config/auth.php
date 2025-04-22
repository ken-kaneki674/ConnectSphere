<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: ../views/auth/login.php');
    exit;
}

// Vérification CSRF pour les formulaires
function verifyCsrfToken() {
    if (empty($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        die('Token CSRF invalide');
    }
}
?>