<?php
class PostController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAllPosts() {
        $stmt = $this->pdo->query("SELECT * FROM posts");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}