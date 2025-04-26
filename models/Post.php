<?php
// Inclure la configuration de la base de données
require_once __DIR__ . '/../config/database.php';

// puis ta classe Post {...}


class Post {
    private $pdo;

    public function __construct() {
        global $pdo;  // Utilisation de la connexion PDO
        $this->pdo = $pdo;
    }

    // Fonction pour créer une publication
    public function createPost($user_id, $content, $image_path = null) {
        $sql = "INSERT INTO posts (user_id, content, image_path) VALUES (?, ?, ?)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$user_id, $content, $image_path]);
    }

    // Fonction pour récupérer toutes les publications
    public function getAllPosts() {
        $sql = "SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll();
    }

    // Fonction pour récupérer toutes les publications avec leur nombre de commentaires et de likes
    public function getPostsWithCommentsAndLikes() {
        $query = "SELECT p.*, 
                         (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likes_count 
                  FROM posts p";

        $stmt = $this->pdo->prepare($query);
        $stmt->execute();

        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $posts;
    }
}
?>
