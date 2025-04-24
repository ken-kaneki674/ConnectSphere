<?php 
// models/User.php

class User {
    public static function searchUsers($pdo, $currentUserId) {
        $stmt = $pdo->prepare("
            SELECT id, username, profile_picture 
            FROM users 
            WHERE id != :id
        ");
        $stmt->execute(['id' => $currentUserId]);
        return $stmt->fetchAll();
    }

    public static function searchUsersByUsername($pdo, $currentUserId, $keyword) {
        // Utilisation de LIKE pour chercher les utilisateurs par pseudo
        $stmt = $pdo->prepare("
            SELECT id, username, profile_picture 
            FROM users 
            WHERE id != :id
            AND username LIKE :keyword
        ");
        $stmt->execute([
            'id' => $currentUserId,
            'keyword' => '%' . $keyword . '%'
        ]);
        return $stmt->fetchAll();
    }

    public static function areFriends($pdo, $user1, $user2) {
        $stmt = $pdo->prepare("
            SELECT 1 FROM friend_requests
            WHERE ((sender_id = :u1 AND receiver_id = :u2)
                OR (sender_id = :u2 AND receiver_id = :u1))
              AND status = 1
        ");
        $stmt->execute(['u1' => $user1, 'u2' => $user2]);
        return $stmt->fetch() !== false;
    }

    public static function hasPendingRequest($pdo, $user1, $user2) {
        $stmt = $pdo->prepare("
            SELECT 1 FROM friend_requests
            WHERE ((sender_id = :u1 AND receiver_id = :u2)
                OR (sender_id = :u2 AND receiver_id = :u1))
              AND status = 0
        ");
        $stmt->execute(['u1' => $user1, 'u2' => $user2]);
        return $stmt->fetch() !== false;
    }
}
?>
