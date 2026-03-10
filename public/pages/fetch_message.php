<?php
require_once __DIR__ . '/../../includes/db.php';
session_start();

if (!isset($_SESSION['user'])) exit;

$userId = $_SESSION['user']['id'];
$receiverId = $_GET['receiver_id'] ?? 0;

$stmt = $pdo->prepare("
    SELECT * FROM conversations 
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
");
$stmt->execute([$userId, $receiverId, $receiverId, $userId]);
$convo = $stmt->fetch();

if (!$convo) exit;

$stmt = $pdo->prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY sent_at ASC");
$stmt->execute([$convo['id']]);
$messages = $stmt->fetchAll();

foreach ($messages as $msg) {
    $class = $msg['sender_id'] == $userId ? 'you' : 'them';
    echo "<div class='message $class mb-2'>
            <div class='p-2 bg-light rounded'>{$msg['content']}</div>
            <small class='text-muted'>{$msg['sent_at']}</small>
          </div>";
}
