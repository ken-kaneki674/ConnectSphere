<?php
class UserToken {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    public function createToken($userId, $expiryDays = 30) {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 86400 * $expiryDays);
        
        $stmt = $this->db->prepare("
            INSERT INTO user_tokens (user_id, token, expires_at) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$userId, $token, $expires]);
        
        return $token;
    }

    public function verifyToken($token) {
        // Supprime d'abord les tokens expirés
        $this->db->exec("DELETE FROM user_tokens WHERE expires_at < NOW()");
        
        $stmt = $this->db->prepare("
            SELECT user_id FROM user_tokens 
            WHERE token = ? LIMIT 1
        ");
        $stmt->execute([$token]);
        
        return $stmt->fetchColumn();
    }
}