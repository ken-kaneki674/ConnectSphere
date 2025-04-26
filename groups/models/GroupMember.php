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
            SELECT u.id, u.username, u.email, u.profile_picture, 
                   gm.role, gm.joined_at as join_date
            FROM group_members gm
            JOIN users u ON gm.user_id = u.id
            WHERE gm.group_id = :group_id
            ORDER BY 
                CASE gm.role WHEN 'admin' THEN 1 ELSE 2 END,
                gm.joined_at ASC
        ");
        $stmt->bindValue(':group_id', $groupId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    /**
     * Vérifie si un utilisateur est membre d'un groupe
     */
    public function isMember(int $groupId, int $userId): bool {
        $stmt = $this->db->prepare("
            SELECT 1 FROM group_members 
            WHERE group_id = :group_id AND user_id = :user_id
        ");
        $stmt->bindValue(':group_id', $groupId, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->execute();
        
        return (bool)$stmt->fetch();
    }

    /**
     * Vérifie si un utilisateur est admin d'un groupe
     */
    public function isAdmin(int $groupId, int $userId): bool {
        return $this->hasRole($groupId, $userId, ['admin']);
    }

    /**
     * Vérifie si un utilisateur a un des rôles spécifiés
     */
    public function hasRole(int $groupId, int $userId, array $roles): bool {
        if (empty($roles)) {
            return false;
        }

        $placeholders = implode(',', array_fill(0, count($roles), '?'));
        $sql = "SELECT COUNT(*) FROM group_members 
                WHERE group_id = ? AND user_id = ? AND role IN ($placeholders)";
        
        $params = array_merge([$groupId, $userId], $roles);
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return (bool)$stmt->fetchColumn();
    }

    /**
     * Ajoute un membre à un groupe
     */
    public function addMember(int $groupId, int $userId, string $role = 'member'): bool {
        if ($this->isMember($groupId, $userId)) {
            return false;
        }

        $stmt = $this->db->prepare("
            INSERT INTO group_members (group_id, user_id, role, joined_at)
            VALUES (:group_id, :user_id, :role, NOW())
        ");
        $stmt->bindValue(':group_id', $groupId, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':role', $role, PDO::PARAM_STR);
        
        return $stmt->execute();
    }

    /**
     * Supprime un membre d'un groupe
     */
    public function removeMember(int $groupId, int $userId): bool {
        $stmt = $this->db->prepare("
            DELETE FROM group_members 
            WHERE group_id = :group_id AND user_id = :user_id
        ");
        $stmt->bindValue(':group_id', $groupId, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    /**
     * Change le rôle d'un membre
     */
    public function changeRole(int $groupId, int $userId, string $newRole): bool {
        $stmt = $this->db->prepare("
            UPDATE group_members 
            SET role = :role 
            WHERE group_id = :group_id AND user_id = :user_id
        ");
        $stmt->bindValue(':role', $newRole, PDO::PARAM_STR);
        $stmt->bindValue(':group_id', $groupId, PDO::PARAM_INT);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    /**
     * Compte le nombre de membres d'un groupe
     */
    public function countMembers(int $groupId): int {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) 
            FROM group_members 
            WHERE group_id = :group_id
        ");
        $stmt->bindValue(':group_id', $groupId, PDO::PARAM_INT);
        $stmt->execute();
        
        return (int)$stmt->fetchColumn();
    }
    public function canEditGroup(int $groupId, int $userId): bool {
        $group = $this->getGroup($groupId);
        if (!$group) {
            return false;
        }
        
        // Le créateur peut toujours éditer
        if ($group['creator_id'] === $userId) {
            return true;
        }
        
        // Vérifier les rôles admin/moderator
        return $this->hasRole($groupId, $userId, ['admin', 'moderator']);
    }

    /**
     * Récupère les informations de base d'un groupe
     */
    private function getGroup(int $groupId): ?array {
        $stmt = $this->db->prepare("SELECT id, creator_id FROM groups WHERE id = ?");
        $stmt->execute([$groupId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Récupère le rôle d'un membre dans un groupe
     */
    public function getMemberRole(int $groupId, int $userId): ?string {
        $stmt = $this->db->prepare("
            SELECT role FROM group_members 
            WHERE group_id = ? AND user_id = ?
        ");
        $stmt->execute([$groupId, $userId]);
        return $stmt->fetchColumn() ?: null;
    }

    /**
     * Supprime tous les membres d'un groupe (avant suppression du groupe)
     */
    public function removeAllMembers(int $groupId): bool {
        $stmt = $this->db->prepare("DELETE FROM group_members WHERE group_id = ?");
        return $stmt->execute([$groupId]);
    }

    /**
     * Vérifie si un utilisateur peut supprimer un membre d'un groupe
     */
    public function canRemoveMember(int $groupId, int $userId): bool {
        return $this->hasRole($groupId, $userId, ['admin', 'moderator']);
    }
}