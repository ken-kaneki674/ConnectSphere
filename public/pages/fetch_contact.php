<?php
require_once __DIR__ . '/../../includes/db.php';
session_start();

if (!isset($_SESSION['user'])) exit;

$userId = $_SESSION['user']['id'];

$stmt = $pdo->prepare("
    SELECT u.id, u.username FROM users u
    JOIN (
        SELECT user1_id AS id FROM conversations WHERE user2_id = ?
        UNION
        SELECT user2_id AS id FROM conversations WHERE user1_id = ?
    ) AS conv ON u.id = conv.id
    WHERE u.id != ?
");
$stmt->execute([$userId, $userId, $userId]);
$contacts = $stmt->fetchAll();

foreach ($contacts as $contact) {
    echo "<div class='contact-item mb-2 p-2 border rounded' style='cursor:pointer' data-id='{$contact['id']}'>
            {$contact['username']}
        </div>";
}
