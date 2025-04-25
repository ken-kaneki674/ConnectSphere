<?php
require 'db.php';
session_start();
include'index.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Vérifier si l'utilisateur est connecté
if (!isset($_SESSION['user_id'])) {
    die("Utilisateur non connecté.");
}

$user_id = $_SESSION['user_id'];
$content = $_POST['content'] ?? '';
$image_path = null;

// Traitement de l'image
if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = 'uploads/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true); // Assure-toi que le dossier est bien créé avec les bons droits
    }

    $extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '.' . $extension;
    $target_file = $upload_dir . $filename;

    if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
        $image_path = $target_file;
    } else {
        die("Échec du téléchargement de l'image.");
    }
}

// Insertion dans la base de données
$stmt = $pdo->prepare("INSERT INTO posts (user_id, content, image_path) VALUES (?, ?, ?)");
$stmt->execute([$user_id, $content, $image_path]);

$post_id = $pdo->lastInsertId();

// Récupération du post avec infos utilisateur
$stmt = $pdo->prepare("SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?");
$stmt->execute([$post_id]);
$post = $stmt->fetch();

// Nombre de likes
$stmt_likes = $pdo->prepare("SELECT COUNT(*) FROM post_likes WHERE post_id = ?");
$stmt_likes->execute([$post_id]);
$likeCount = $stmt_likes->fetchColumn();

// Vérifier si l'utilisateur a déjà liké
$stmt_user_like = $pdo->prepare("SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?");
$stmt_user_like->execute([$post_id, $user_id]);
$userHasLiked = $stmt_user_like->fetch() ? true : false;

// Commentaires
$stmt_comments = $pdo->prepare("SELECT pc.*, u.username FROM post_comments pc JOIN users u ON pc.user_id = u.id WHERE pc.post_id = ? ORDER BY pc.created_at ASC");
$stmt_comments->execute([$post_id]);
$comments = $stmt_comments->fetchAll();

