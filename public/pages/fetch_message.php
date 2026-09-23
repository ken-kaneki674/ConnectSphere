<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/MessageController.php';

(new MessageController($pdo))->messages((int)($_GET['receiver_id'] ?? 0));
