<?php
class Post {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Fonction pour créer une publication
    public function createPost($user_id, $content, $image_path = null) {
        $sql = "INSERT INTO posts (user_id, content, image_path) VALUES (?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$user_id, $content, $image_path]);
        return (int)$this->pdo->lastInsertId();
    }

    // Supprime une publication appartenant à l'utilisateur
    public function deletePost($post_id, $user_id) {
        $stmt = $this->pdo->prepare("DELETE FROM posts WHERE id = ? AND user_id = ?");
        $stmt->execute([$post_id, $user_id]);
        return $stmt->rowCount() > 0;
    }

    // Fonction pour récupérer toutes les publications
    public function getAllPosts() {
        return $this->getPostsWithCommentsAndLikes();
    }

    // Publications avec auteur, nombre de likes/commentaires et like de l'utilisateur courant
    public function getPostsWithCommentsAndLikes($viewer_id = 0, $author_id = null) {
        $query = "SELECT p.*, u.username, u.profile_picture,
                         (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likes_count,
                         (SELECT COUNT(*) FROM post_comments WHERE post_id = p.id) AS comments_count,
                         EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS liked
                  FROM posts p
                  JOIN users u ON p.user_id = u.id";
        $params = [(int)$viewer_id];

        if ($author_id !== null) {
            $query .= " WHERE p.user_id = ?";
            $params[] = (int)$author_id;
        }
        $query .= " ORDER BY p.created_at DESC, p.id DESC";

        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
