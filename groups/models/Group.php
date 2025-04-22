<?php
class Group {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    public function create($name, $description, $creatorId, $type, $isPrivate = false, $coverImage = null) {
        $stmt = $this->db->prepare("INSERT INTO groups (name, description, creator_id, group_type, is_private, cover_image) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $description, $creatorId, $type, $isPrivate, $coverImage]);
        return $this->db->lastInsertId();
    }

    public function getById($groupId) {
        $stmt = $this->db->prepare("SELECT * FROM groups WHERE id = ?");
        $stmt->execute([$groupId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getUserGroups($userId) {
        $stmt = $this->db->prepare("SELECT g.* FROM groups g JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = ?");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function search($query, $type = null) {
        $sql = "SELECT * FROM groups WHERE name LIKE ? AND is_private = false";
        $params = ["%$query%"];
        
        if ($type) {
            $sql .= " AND group_type = ?";
            $params[] = $type;
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function addMember($groupId, $userId, $role = 'member') {
        $stmt = $this->db->prepare("INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)");
        return $stmt->execute([$groupId, $userId, $role]);
    }

    public function removeMember($groupId, $userId) {
        $stmt = $this->db->prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?");
        return $stmt->execute([$groupId, $userId]);
    }

    public function getMembers($groupId) {
        $stmt = $this->db->prepare("SELECT u.id, u.username, u.profile_picture, gm.role FROM group_members gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ?");
        $stmt->execute([$groupId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>