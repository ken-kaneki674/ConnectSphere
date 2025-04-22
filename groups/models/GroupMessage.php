<?php
class GroupMessage {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    public function sendMessage($groupId, $senderId, $message) {
        $stmt = $this->db->prepare("INSERT INTO group_messages (group_id, sender_id, message) VALUES (?, ?, ?)");
        return $stmt->execute([$groupId, $senderId, $message]);
    }

    public function getMessages($groupId, $limit = 50, $offset = 0) {
        $stmt = $this->db->prepare("SELECT gm.*, u.username, u.profile_picture FROM group_messages gm JOIN users u ON gm.sender_id = u.id WHERE gm.group_id = ? ORDER BY gm.sent_at DESC LIMIT ? OFFSET ?");
        $stmt->execute([$groupId, $limit, $offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getLastMessagesSince($groupId, $since) {
        $stmt = $this->db->prepare("SELECT gm.*, u.username, u.profile_picture FROM group_messages gm JOIN users u ON gm.sender_id = u.id WHERE gm.group_id = ? AND gm.sent_at > ? ORDER BY gm.sent_at ASC");
        $stmt->execute([$groupId, $since]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>