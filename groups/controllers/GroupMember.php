<?php
declare(strict_types=1);

class GroupMember {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    /**
     * Récupère tous les membres d'un groupe
     */
    public function getMembers(int $groupId): array {
        $stmt = $this->db->prepare("
            SELECT u.id, u.username, u.profile_picture, gm.role, gm.joined_at
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = ?
            ORDER BY 
                CASE gm.role 
                    WHEN 'admin' THEN 1 
                    WHEN 'moderator' THEN 2 
                    ELSE 3 
                END,
                gm.joined_at ASC
        ");
        $stmt->execute([$groupId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Vérifie si un utilisateur est membre d'un groupe
     */
    public function isMember(int $groupId, int $userId): bool {
        $stmt = $this->db->prepare("
            SELECT 1 FROM group_members 
            WHERE group_id = ? AND user_id = ?
            LIMIT 1
        ");
        $stmt->execute([$groupId, $userId]);
        
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Vérifie si un utilisateur a un rôle spécifique dans un groupe
     */
    public function hasRole(int $groupId, int $userId, array $roles): bool {
        $placeholders = implode(',', array_fill(0, count($roles), '?'));
        $params = array_merge([$groupId, $userId], $roles);
        
        $stmt = $this->db->prepare("
            SELECT 1 FROM group_members 
            WHERE group_id = ? 
            AND user_id = ? 
            AND role IN ($placeholders)
            LIMIT 1
        ");
        $stmt->execute($params);
        
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Ajoute un membre à un groupe
     */
    public function addMember(int $groupId, int $userId, string $role = 'member'): bool {
        $stmt = $this->db->prepare("
            INSERT INTO group_members (group_id, user_id, role, joined_at)
            VALUES (?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE role = VALUES(role)
        ");
        return $stmt->execute([$groupId, $userId, $role]);
    }

    /**
     * Supprime un membre d'un groupe
     */
    public function removeMember(int $groupId, int $userId): bool {
        $stmt = $this->db->prepare("
            DELETE FROM group_members 
            WHERE group_id = ? AND user_id = ?
        ");
        return $stmt->execute([$groupId, $userId]);
    }
}