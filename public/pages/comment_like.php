<?php
// Endpoint AJAX des likes et commentaires (utilisé par assets/js/comments-likes.js)
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/CommentLikeController.php';

(new CommentLikeController($pdo))->handle();
