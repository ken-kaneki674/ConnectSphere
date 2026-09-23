<?php
class Message {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Utilisateurs avec qui l'utilisateur a une conversation
    public function getContacts($user_id) {
        $stmt = $this->pdo->prepare("
            SELECT u.id, u.username,
                   (SELECT COUNT(*) FROM messages m
                     WHERE m.conversation_id = c.id AND m.sender_id <> ? AND m.is_read = 0) AS unread
            FROM conversations c
            JOIN users u ON u.id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
            WHERE c.user1_id = ? OR c.user2_id = ?
            ORDER BY c.updated_at DESC
        ");
        $stmt->execute([$user_id, $user_id, $user_id, $user_id]);
        return $stmt->fetchAll();
    }

    public function findConversation($user_id, $other_id) {
        $stmt = $this->pdo->prepare("
            SELECT id FROM conversations
            WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
        ");
        $stmt->execute([$user_id, $other_id, $other_id, $user_id]);
        $conversation = $stmt->fetch();
        return $conversation ? (int)$conversation['id'] : null;
    }

    public function createConversation($user_id, $other_id) {
        $stmt = $this->pdo->prepare("INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)");
        $stmt->execute([$user_id, $other_id]);
        return (int)$this->pdo->lastInsertId();
    }

    // Messages d'une conversation, marqués comme lus pour le lecteur
    public function getMessages($conversation_id, $reader_id) {
        $stmt = $this->pdo->prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY sent_at ASC, id ASC");
        $stmt->execute([$conversation_id]);
        $messages = $stmt->fetchAll();

        $this->pdo->prepare("UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id <> ? AND is_read = 0")
            ->execute([$conversation_id, $reader_id]);

        return $messages;
    }

    public function send($conversation_id, $sender_id, $content) {
        $stmt = $this->pdo->prepare("INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)");
        $stmt->execute([$conversation_id, $sender_id, $content]);
        $this->pdo->prepare("UPDATE conversations SET updated_at = NOW() WHERE id = ?")->execute([$conversation_id]);
        return (int)$this->pdo->lastInsertId();
    }
}
