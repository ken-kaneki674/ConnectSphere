<?php
class GroupMember {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Vérifie si un utilisateur est membre d'un groupe
     */
    public function isMember($groupId, $userId) {
        $stmt = $this->db->prepare("SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?");
        $stmt->execute([$groupId, $userId]);
        return (bool)$stmt->fetch();
    }

    /**
     * Vérifie si un utilisateur est admin d'un groupe
     */
    public function isAdmin($groupId, $userId) {
        $stmt = $this->db->prepare("SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ? AND role = 'admin'");
        $stmt->execute([$groupId, $userId]);
        return (bool)$stmt->fetch();
    }

    /**
     * Ajoute un membre à un groupe
     */
    public function addMember($groupId, $userId, $role = 'member') {
        // Vérifie d'abord si l'utilisateur n'est pas déjà membre
        if ($this->isMember($groupId, $userId)) {
            return false;
        }

        $stmt = $this->db->prepare("INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)");
        return $stmt->execute([$groupId, $userId, $role]);
    }

    /**
     * Supprime un membre d'un groupe
     */
    public function removeMember($groupId, $userId) {
        $stmt = $this->db->prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?");
        return $stmt->execute([$groupId, $userId]);
    }

    /**
     * Change le rôle d'un membre
     */
    public function changeRole($groupId, $userId, $newRole) {
        $stmt = $this->db->prepare("UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?");
        return $stmt->execute([$newRole, $groupId, $userId]);
    }

    /**
     * Récupère tous les membres d'un groupe avec leurs informations
     */
    public function getMembersWithDetails($groupId) {
        $stmt = $this->db->prepare("
            SELECT u.id, u.username, u.email, u.profile_picture, gm.role, gm.joined_at 
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = ?
            ORDER BY gm.role DESC, gm.joined_at ASC
        ");
        $stmt->execute([$groupId]);
        return $stmt->fetchAll();
    }

    /**
     * Récupère les groupes d'un utilisateur
     */
    public function getUserGroups($userId) {
        $stmt = $this->db->prepare("
            SELECT g.*, gm.role 
            FROM groups g
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = ?
            ORDER BY g.created_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    /**
     * Compte le nombre de membres d'un groupe
     */
    public function countMembers($groupId) {
        $stmt = $this->db->prepare("SELECT COUNT(*) as count FROM group_members WHERE group_id = ?");
        $stmt->execute([$groupId]);
        return $stmt->fetch()['count'];
    }
}
?>