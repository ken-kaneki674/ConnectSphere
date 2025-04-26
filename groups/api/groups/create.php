<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../models/Group.php';

// Désactiver l'affichage des erreurs en production
if (ENVIRONMENT === 'production') {
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
}

// Vérifier la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit;
}

// Vérifier le token CSRF
if (!verifyCsrfToken($_POST['csrf_token'] ?? '')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Token CSRF invalide']);
    exit;
}

// Vérifier l'authentification
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non authentifié']);
    exit;
}

// Préparer le dossier d'upload
$uploadDir = __DIR__ . '/../../uploads/groups/';
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        error_log("Erreur création dossier upload: $uploadDir");
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erreur système']);
        exit;
    }
}

// Traitement de l'image
$coverImage = null;
if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
    $allowedTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png'];
    $fileType = $_FILES['cover_image']['type'];
    $maxSize = 2 * 1024 * 1024; // 2MB

    if (!array_key_exists($fileType, $allowedTypes)) {
        echo json_encode([
            'success' => false,
            'message' => 'Format d\'image non supporté (JPEG ou PNG uniquement)'
        ]);
        exit;
    }

    if ($_FILES['cover_image']['size'] > $maxSize) {
        echo json_encode([
            'success' => false,
            'message' => 'L\'image ne doit pas dépasser 2MB'
        ]);
        exit;
    }

    $extension = $allowedTypes[$fileType];
    $filename = 'cover_' . bin2hex(random_bytes(8)) . '.' . $extension;
    $destination = $uploadDir . $filename;

    if (!move_uploaded_file($_FILES['cover_image']['tmp_name'], $destination)) {
        error_log("Upload error: " . print_r(error_get_last(), true));
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de l\'enregistrement de l\'image'
        ]);
        exit;
    }

    $coverImage = $filename;
}

try {
    $db->beginTransaction();
    
    $groupModel = new Group($db);
    $groupId = $groupModel->create(
        trim($_POST['name']),
        trim($_POST['description']),
        $_SESSION['user_id'],
        $_POST['type'],
        (bool)($_POST['is_private'] ?? false),
        $coverImage
    );
    
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Groupe créé avec succès',
        'group_id' => $groupId
    ]);
    
} catch (InvalidArgumentException $e) {
    $db->rollBack();
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    
} catch (Exception $e) {
    $db->rollBack();
    
    // Nettoyer l'image uploadée en cas d'erreur
    if (isset($destination) && file_exists($destination)) {
        unlink($destination);
    }
    
    error_log("Group creation error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la création du groupe'
    ]);
}