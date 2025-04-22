<?php
class User {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Enregistre un nouvel utilisateur
     */
    public function register($username, $email, $password, $bio = null, $profilePicture = null) {
        // Vérifie si l'email ou le username existe déjà
        if ($this->emailExists($email)) {
            return ['success' => false, 'message' => 'Cet email est déjà utilisé'];
        }

        if ($this->usernameExists($username)) {
            return ['success' => false, 'message' => 'Ce nom d\'utilisateur est déjà pris'];
        }

        // Hash du mot de passe
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        try {
            $stmt = $this->db->prepare("
                INSERT INTO users (username, email, password, bio, profile_picture, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->execute([$username, $email, $hashedPassword, $bio, $profilePicture]);

            return [
                'success' => true,
                'user_id' => $this->db->lastInsertId()
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'message' => 'Erreur lors de l\'inscription: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Connecte un utilisateur
     */
    public function login($email, $password) {
        $user = $this->getUserByEmail($email);

        if (!$user) {
            return ['success' => false, 'message' => 'Email ou mot de passe incorrect'];
        }

        if (!password_verify($password, $user['password'])) {
            return ['success' => false, 'message' => 'Email ou mot de passe incorrect'];
        }

        // Met à jour la date de dernière connexion
        $this->updateLastLogin($user['id']);

        return [
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'profile_picture' => $user['profile_picture']
            ]
        ];
    }

    /**
     * Récupère un utilisateur par son ID
     */
    public function getUserById($id) {
        $stmt = $this->db->prepare("
            SELECT id, username, email, bio, profile_picture, created_at, last_login 
            FROM users 
            WHERE id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Récupère un utilisateur par son email
     */
    public function getUserByEmail($email) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Met à jour le profil utilisateur
     */
    public function updateProfile($userId, $data) {
        $updatableFields = ['username', 'email', 'bio', 'profile_picture'];
        $updates = [];
        $params = [];

        foreach ($data as $key => $value) {
            if (in_array($key, $updatableFields) && $value !== null) {
                $updates[] = "$key = ?";
                $params[] = $value;
            }
        }

        if (empty($updates)) {
            return ['success' => false, 'message' => 'Aucune donnée à mettre à jour'];
        }

        $params[] = $userId;
        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return ['success' => true];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => 'Erreur de mise à jour: ' . $e->getMessage()];
        }
    }

    /**
     * Vérifie si un email existe déjà
     */
    public function emailExists($email) {
        $stmt = $this->db->prepare("SELECT 1 FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return (bool)$stmt->fetch();
    }

    /**
     * Vérifie si un nom d'utilisateur existe déjà
     */
    public function usernameExists($username) {
        $stmt = $this->db->prepare("SELECT 1 FROM users WHERE username = ?");
        $stmt->execute([$username]);
        return (bool)$stmt->fetch();
    }

    /**
     * Met à jour la date de dernière connexion
     */
    public function updateLastLogin($userId) {
        $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$userId]);
    }

    /**
     * Recherche des utilisateurs
     */
    public function searchUsers($query) {
        $stmt = $this->db->prepare("
            SELECT id, username, email, profile_picture 
            FROM users 
            WHERE username LIKE ? OR email LIKE ?
            LIMIT 10
        ");
        $searchTerm = "%$query%";
        $stmt->execute([$searchTerm, $searchTerm]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Change le mot de passe
     */
    public function changePassword($userId, $currentPassword, $newPassword) {
        $user = $this->getUserById($userId);
        
        if (!password_verify($currentPassword, $user['password'])) {
            return ['success' => false, 'message' => 'Mot de passe actuel incorrect'];
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->db->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $userId]);

        return ['success' => true, 'message' => 'Mot de passe mis à jour'];
    }

    /**
     * Supprime un compte utilisateur
     */
    public function deleteAccount($userId) {
        try {
            // Commencer une transaction
            $this->db->beginTransaction();

            // Supprimer les dépendances d'abord (posts, commentaires, etc.)
            // ... ajoutez ici les suppressions nécessaires ...

            // Puis supprimer l'utilisateur
            $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$userId]);

            $this->db->commit();
            return ['success' => true];
        } catch (PDOException $e) {
            $this->db->rollBack();
            return ['success' => false, 'message' => 'Erreur lors de la suppression: ' . $e->getMessage()];
        }
    }
}