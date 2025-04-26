<?php
// 1. Configuration initiale
header('Content-Type: application/json');
ini_set('display_errors', 0);
ini_set('log_errors', 1);

require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../models/User.php';

// 2. Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// 3. Vérification du token CSRF
if (!verifyCsrfToken($_POST['csrf_token'] ?? '')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Token CSRF invalide']);
    exit;
}

// 4. Préparation du dossier d'upload
$uploadDir = __DIR__ . '/../../uploads/profiles/';
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        error_log("Erreur création dossier upload: $uploadDir");
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erreur système']);
        exit;
    }
}

// 5. Validation des données
$data = [
    'username' => trim($_POST['username'] ?? ''),
    'email' => filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL),
    'password' => $_POST['password'] ?? '',
    'password_confirm' => $_POST['password_confirm'] ?? '',
    'bio' => substr(trim($_POST['bio'] ?? ''), 0, 500)
];

$errors = [];

// Validation du username
if (empty($data['username'])) {
    $errors['username'] = 'Le nom d\'utilisateur est requis';
} elseif (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $data['username'])) {
    $errors['username'] = 'Seuls les caractères alphanumériques et _ sont autorisés (3-20 caractères)';
}

// Validation de l'email
if (empty($data['email'])) {
    $errors['email'] = 'L\'email est requis';
} elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Format d\'email invalide';
}

// Validation du mot de passe
if (strlen($data['password']) < 8) {
    $errors['password'] = 'Le mot de passe doit contenir au moins 8 caractères';
} elseif (!preg_match('/[A-Z]/', $data['password']) || !preg_match('/[0-9]/', $data['password'])) {
    $errors['password'] = 'Le mot de passe doit contenir au moins une majuscule et un chiffre';
} elseif ($data['password'] !== $data['password_confirm']) {
    $errors['password_confirm'] = 'Les mots de passe ne correspondent pas';
}

// 6. Gestion de l'upload de fichier
$profilePicture = null;
if (isset($_FILES['profile_picture']) && $_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
    $allowedTypes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/gif' => 'gif'
    ];
    
    $fileType = $_FILES['profile_picture']['type'];
    $fileSize = $_FILES['profile_picture']['size'];
    $maxSize = 2 * 1024 * 1024; // 2MB

    if (!array_key_exists($fileType, $allowedTypes)) {
        $errors['profile_picture'] = 'Seuls les formats JPEG, PNG et GIF sont acceptés';
    } elseif ($fileSize > $maxSize) {
        $errors['profile_picture'] = 'La taille maximale est de 2MB';
    } else {
        $extension = $allowedTypes[$fileType];
        $filename = 'profile_' . bin2hex(random_bytes(8)) . '.' . $extension;
        $destination = $uploadDir . $filename;

        if (!move_uploaded_file($_FILES['profile_picture']['tmp_name'], $destination)) {
            $errors['profile_picture'] = 'Erreur lors de l\'enregistrement du fichier';
            error_log("Upload error: " . print_r(error_get_last(), true));
        } else {
            $profilePicture = $filename;
        }
    }
}

// 7. Retour des erreurs si validation échoue
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Erreurs de validation',
        'errors' => $errors
    ]);
    exit;
}

// 8. Traitement de l'inscription
try {
    $db->beginTransaction();

    $userModel = new User($db);

    // Vérification de l'unicité
    if ($userModel->usernameExists($data['username'])) {
        throw new Exception('Ce nom d\'utilisateur est déjà pris');
    }

    if ($userModel->emailExists($data['email'])) {
        throw new Exception('Cet email est déjà utilisé');
    }

    // Hashage du mot de passe
    $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);

    // Insertion en base de données
    $stmt = $db->prepare("
        INSERT INTO users 
        (username, email, password, bio, profile_picture, is_active, created_at) 
        VALUES (?, ?, ?, ?, ?, 1, NOW())
    ");

    $stmt->execute([
        $data['username'],
        $data['email'],
        $hashedPassword,
        $data['bio'],
        $profilePicture
    ]);

    $userId = $db->lastInsertId();

    // Connexion automatique
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $data['email'];

    $db->commit();

    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Inscription réussie',
        'user' => [
            'id' => $userId,
            'username' => $data['username']
        ],
        'redirect' => $_SESSION['login_redirect'] ?? '/profile'
    ]);

} catch (Exception $e) {
    $db->rollBack();

    // Nettoyage du fichier uploadé en cas d'erreur
    if (isset($destination) && file_exists($destination)) {
        unlink($destination);
    }

    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    error_log("Registration error: " . $e->getMessage());
}