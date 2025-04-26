<?php
require_once '../../config/config.php';
require_once '../../config/auth.php';
require_once '../../models/User.php';

header('Content-Type: application/json');

// Vérifier CSRF
if (!verifyCsrfToken($_POST['csrf_token'])) {
    echo json_encode(['success' => false, 'message' => 'Token CSRF invalide']);
    exit;
}

// Récupérer les données
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$password = $_POST['password'];
$remember = isset($_POST['remember']);

// Validation
if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'L\'email est requis']);
    exit;
}

if (empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Le mot de passe est requis']);
    exit;
}

// Authentification
$userModel = new User($db);
$response = $userModel->login($email, $password);

if ($response['success']) {
    // Créer la session
    $_SESSION['user_id'] = $response['user']['id'];
    $_SESSION['user_email'] = $response['user']['email'];
    
    // Cookie "Se souvenir de moi"
    if ($remember) {
        $token = bin2hex(random_bytes(32));
        setcookie('remember_token', $token, time() + 86400 * 30, '/', '', true, true);
        // Stocker le token en base (à implémenter)
    }
    
    // Réponse
    echo json_encode([
        'success' => true,
        'redirect' => isset($_SESSION['login_redirect']) ? $_SESSION['login_redirect'] : null
    ]);
} else {
    echo json_encode($response);
}