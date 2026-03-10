<?php
require_once __DIR__ . '/../../includes/db.php';
session_start();

if (!isset($_SESSION['user']) || empty($_POST['new_contact'])) {
    echo "Erreur : données manquantes.";
    exit;
}

$currentUserId = $_SESSION['user']['id'];
$newContactUsername = trim($_POST['new_contact']);

// Vérifier que l'utilisateur existe
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
$stmt->execute([$newContactUsername, $currentUserId]);
$targetUser = $stmt->fetch();

if (!$targetUser) {
    echo "Utilisateur introuvable.";
    exit;
}

$targetUserId = $targetUser['id'];

// Vérifier si une conversation existe déjà
$stmt = $pdo->prepare("SELECT id FROM conversations 
    WHERE (user1_id = ? AND user2_id = ?) 
       OR (user1_id = ? AND user2_id = ?)");
$stmt->execute([$currentUserId, $targetUserId, $targetUserId, $currentUserId]);

if ($stmt->fetch()) {
    echo "Conversation déjà existante.";
    exit;
}

// Créer une nouvelle conversation
$stmt = $pdo->prepare("INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)");
$stmt->execute([$currentUserId, $targetUserId]);

echo "Conversation démarrée avec $newContactUsername.";
?>
