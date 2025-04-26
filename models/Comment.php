<?php
// models/Comment.php
class Comment {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function addComment($post_id, $user_id, $content) {
        $stmt = $this->pdo->prepare("INSERT INTO post_comments (post_id, user_id, content) VALUES (?, ?, ?)");
        $stmt->execute([$post_id, $user_id, $content]);
        return $this->pdo->lastInsertId();
    }

    public function getComments($post_id) {
        $stmt = $this->pdo->prepare("
            SELECT pc.*, u.username, u.profile_picture 
            FROM post_comments pc
            JOIN users u ON pc.user_id = u.id
            WHERE pc.post_id = ?
            ORDER BY pc.created_at DESC
        ");
        $stmt->execute([$post_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>