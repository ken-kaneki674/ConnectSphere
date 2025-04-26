<?php
// models/Like.php
class Like {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function toggleLike($post_id, $user_id) {
        $stmt = $this->pdo->prepare("SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?");
        $stmt->execute([$post_id, $user_id]);

        if ($stmt->rowCount() > 0) {
            $this->pdo->prepare("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?")->execute([$post_id, $user_id]);
            return 'unliked';
        } else {
            $this->pdo->prepare("INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)")->execute([$post_id, $user_id]);
            return 'liked';
        }
    }

    public function countLikes($post_id) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM post_likes WHERE post_id = ?");
        $stmt->execute([$post_id]);
        return $stmt->fetchColumn();
    }
}
?>