<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/bootstrap.php';

// Configuration sécurité
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Vérifications initiales
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Méthode non autorisée']));
}

if (!verifyCsrfToken($_POST['csrf_token'] ?? '')) {
    http_response_code(403);
    exit(json_encode(['success' => false, 'message' => 'Token de sécurité invalide']));
}

if (!isLoggedIn()) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'message' => 'Authentification requise']));
}

// Validation des données
$requiredFields = ['name', 'description', 'type'];
foreach ($requiredFields as $field) {
    if (empty(trim($_POST[$field] ?? ''))) {
        http_response_code(400);
        exit(json_encode(['success' => false, 'message' => "Le champ $field est requis"]));
    }
}

// Traitement de l'image
$coverImage = null;
if (isset($_FILES['cover_image']) && $_FILES['cover_image']['error'] === UPLOAD_ERR_OK) {
    try {
        $coverImage = processGroupCoverUpload($_FILES['cover_image']);
    } catch (RuntimeException $e) {
        http_response_code(400);
        exit(json_encode(['success' => false, 'message' => $e->getMessage()]));
    }
}

// Création du groupe
try {
    $db->beginTransaction();
    
    $groupData = [
        'name' => sanitizeInput($_POST['name']),
        'description' => sanitizeInput($_POST['description']),
        'creator_id' => $_SESSION['user_id'],
        'type' => $_POST['type'],
        'is_private' => isset($_POST['is_private']),
        'cover_image' => $coverImage
    ];

    $groupId = (new Group($db))->create(
        $groupData['name'], 
        $groupData['description'], 
        $groupData['type'], 
        $groupData['creator_id']
    );
    
    // Ajouter le créateur comme admin
    (new GroupMember($db))->addMember($groupId, $_SESSION['user_id'], 'admin');
    
    $db->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Groupe créé avec succès',
        'group_id' => $groupId,
        'redirect_url' => "/groups/view/$groupId"
    ]);

} catch (InvalidArgumentException $e) {
    $db->rollBack();
    cleanupUpload($coverImage);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    
} catch (Exception $e) {
    $db->rollBack();
    cleanupUpload($coverImage);
    error_log("Erreur création groupe: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur interne du serveur']);
}

// Fonctions helper
function processGroupCoverUpload(array $file): string {
    $allowedTypes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp'
    ];
    
    $maxSize = 2 * 1024 * 1024; // 2MB
    $uploadDir = __DIR__ . '/../../uploads/groups/';
    
    // Validation
    if (!array_key_exists($file['type'], $allowedTypes)) {
        throw new RuntimeException('Seuls les formats JPEG, PNG et WebP sont acceptés');
    }
    
    if ($file['size'] > $maxSize) {
        throw new RuntimeException('La taille maximale est de 2MB');
    }
    
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0755, true)) {
        throw new RuntimeException('Erreur système lors de la création du dossier');
    }
    
    // Génération nom de fichier sécurisé
    $extension = $allowedTypes[$file['type']];
    $filename = 'group_' . bin2hex(random_bytes(16)) . '.' . $extension;
    $destination = $uploadDir . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new RuntimeException('Échec du téléchargement de l\'image');
    }
    
    return $filename;
}

function cleanupUpload(?string $filename): void {
    if ($filename) {
        $filepath = __DIR__ . '/../../uploads/groups/' . $filename;
        if (file_exists($filepath)) {
            unlink($filepath);
        }
    }
}

function sanitizeInput(string $input): string {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}