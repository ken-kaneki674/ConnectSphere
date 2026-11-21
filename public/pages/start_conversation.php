<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/MessageController.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

(new MessageController($pdo))->startConversation($_POST['new_contact'] ?? '');
