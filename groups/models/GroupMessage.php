<?php
declare(strict_types=1);

class GroupMessage {
    private PDO $db;
    
    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Envoie un message dans un groupe
     */
    public function create(
        int $groupId,
        int $senderId,
        string $message
    ): int {
        $stmt = $this->db->prepare("
            INSERT INTO group_messages 
            (group_id, sender_id, message, sent_at)
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$groupId, $senderId, $message]);
        return (int)$this->db->lastInsertId();
    }

    /**
     * Récupère les messages d'un groupe
     */
    public function getMessages(
        int $groupId,
        int $limit = 50,
        int $offset = 0
    ): array {
        $stmt = $this->db->prepare("
            SELECT m.*, u.username, u.profile_picture
            FROM group_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.group_id = ?
            ORDER BY m.sent_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$groupId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Récupère les nouveaux messages depuis une date donnée
     */
    public function getNewMessagesSince(
        int $groupId,
        string $since
    ): array {
        $stmt = $this->db->prepare("
            SELECT m.*, u.username, u.profile_picture
            FROM group_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.group_id = ? AND m.sent_at > ?
            ORDER BY m.sent_at ASC
        ");
        $stmt->execute([$groupId, $since]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Récupère un message par son ID
     */
    public function getById(int $messageId): ?array {
        $stmt = $this->db->prepare("
            SELECT m.*, u.username
            FROM group_messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.id = ?
        ");
        $stmt->execute([$messageId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Supprime un message
     */
    public function delete(int $messageId): bool {
        $stmt = $this->db->prepare("DELETE FROM group_messages WHERE id = ?");
        return $stmt->execute([$messageId]);
    }

    /**
     * Marque un message comme lu par un utilisateur
     */
    public function markAsRead(int $messageId, int $userId): bool {
        $stmt = $this->db->prepare("
            INSERT INTO message_reads (message_id, user_id, read_at)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE read_at = NOW()
        ");
        return $stmt->execute([$messageId, $userId]);
    }
}