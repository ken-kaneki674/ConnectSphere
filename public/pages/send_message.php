<?php
require_once __DIR__ . '/../../includes/db.php';
session_start();

if (!isset($_SESSION['user'])) exit;

$userId = $_SESSION['user']['id'];
$receiverId = $_POST['receiver_id'] ?? 0;
$content = trim($_POST['content'] ?? '');

if (empty($content)) exit;

$stmt = $pdo->prepare("
    SELECT * FROM conversations 
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
");
$stmt->execute([$userId, $receiverId, $receiverId, $userId]);
$convo = $stmt->fetch();

if (!$convo) {
    $stmt = $pdo->prepare("INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)");
    $stmt->execute([$userId, $receiverId]);
    $conversationId = $pdo->lastInsertId();
} else {
    $conversationId = $convo['id'];
}

$stmt = $pdo->prepare("INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)");
$stmt->execute([$conversationId, $userId, $content]);
