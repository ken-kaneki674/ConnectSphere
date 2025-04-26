<?php
class User {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function register($username, $email, $password, $bio = null, $profilePicture = null) {
        // Vérifier si l'email existe déjà
        if ($this->emailExists($email)) {
            return ['success' => false, 'message' => 'Cet email est déjà utilisé'];
        }

        // Vérifier si le username existe déjà
        if ($this->usernameExists($username)) {
            return ['success' => false, 'message' => 'Ce nom d\'utilisateur est déjà pris'];
        }

        // Hashage du mot de passe
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        try {
            $stmt = $this->db->prepare("
                INSERT INTO users 
                (username, email, password, bio, profile_picture, is_active, created_at) 
                VALUES (?, ?, ?, ?, ?, 1, NOW())
            ");
            
            $stmt->execute([
                $username,
                $email,
                $hashedPassword,
                $bio,
                $profilePicture
            ]);

            return [
                'success' => true,
                'user_id' => $this->db->lastInsertId()
            ];
        } catch (PDOException $e) {
            error_log("Erreur d'inscription: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erreur lors de l\'inscription'];
        }
    }

    public function emailExists($email) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return (bool)$stmt->fetch();
    }

    public function usernameExists($username) {
        $stmt = $this->db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return (bool)$stmt->fetch();
    }

    public function getUserById($id) {
        $stmt = $this->db->prepare("
            SELECT id, username, email, bio, profile_picture 
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}