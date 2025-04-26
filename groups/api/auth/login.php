<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../models/User.php';
require_once __DIR__ . '/../../models/UserToken.php';

header('Content-Type: application/json');

try {
    // 1. Vérification méthode HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        throw new RuntimeException('Méthode non autorisée');
    }

    // 2. Vérification CSRF
    if (!verifyCsrfToken($_POST['csrf_token'] ?? '')) {
        http_response_code(403);
        throw new RuntimeException('Token CSRF invalide');
    }

    // 3. Récupération et validation des données
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);

    if (empty($email)) {
        throw new InvalidArgumentException('L\'email est requis');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Email invalide');
    }

    if (empty($password)) {
        throw new InvalidArgumentException('Le mot de passe est requis');
    }

    // 4. Authentification
    $userModel = new User(getDBConnection());
    $authResult = $userModel->login($email, $password);

    if (!$authResult['success']) {
        http_response_code(401);
        echo json_encode($authResult);
        exit;
    }

    // 5. Création de la session
    $_SESSION['user_id'] = $authResult['user']['id'];
    $_SESSION['user_email'] = $authResult['user']['email'];
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); // Régénérer le token après login

    // 6. Gestion du "Se souvenir de moi"
    if ($remember) {
        $token = bin2hex(random_bytes(32));
        $expires = time() + 86400 * 30; // 30 jours
        
        setcookie(
            'remember_token',
            $token,
            [
                'expires' => $expires,
                'path' => '/',
                'domain' => '',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'Strict'
            ]
        );

        // Stockage du token en base
        $tokenModel = new UserToken(getDBConnection());
        $tokenModel->createToken($authResult['user']['id'], $token, $expires);
    }

    // 7. Réponse JSON
    echo json_encode([
        'success' => true,
        'redirect' => $_SESSION['login_redirect'] ?? '/',
        'user' => [
            'id' => $authResult['user']['id'],
            'email' => $authResult['user']['email']
        ]
    ]);

} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} catch (RuntimeException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    error_log('Login error: ' . $e->getMessage());
}