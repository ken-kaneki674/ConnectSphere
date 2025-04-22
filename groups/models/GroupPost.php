<?php
class GroupPost {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    public function create($groupId, $userId, $content, $image = null) {
        $stmt = $this->db->prepare("INSERT INTO group_posts (group_id, user_id, content, image) VALUES (?, ?, ?, ?)");
        $stmt->execute([$groupId, $userId, $content, $image]);
        return $this->db->lastInsertId();
    }

    public function getPostsByGroup($groupId, $limit = 10, $offset = 0) {
        $stmt = $this->db->prepare("SELECT gp.*, u.username, u.profile_picture FROM group_posts gp JOIN users u ON gp.user_id = u.id WHERE gp.group_id = ? ORDER BY gp.created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute([$groupId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPostById($postId) {
        $stmt = $this->db->prepare("SELECT gp.*, u.username, u.profile_picture FROM group_posts gp JOIN users u ON gp.user_id = u.id WHERE gp.id = ?");
        $stmt->execute([$postId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deletePost($postId, $userId) {
        // Vérifie si l'utilisateur est l'auteur ou un admin du groupe
        $stmt = $this->db->prepare("DELETE gp FROM group_posts gp JOIN group_members gm ON gp.group_id = gm.group_id WHERE gp.id = ? AND (gp.user_id = ? OR gm.user_id = ? AND gm.role = 'admin')");
        return $stmt->execute([$postId, $userId, $userId]);
    }
}
?>