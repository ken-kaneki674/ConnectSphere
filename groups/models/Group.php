<?php
declare(strict_types=1);

class Group {
    private $db;
    
    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function create(string $name, string $description, int $creatorId, string $type, bool $isPrivate = false, ?string $coverImage = null): int {
        $this->validateGroupData($name, $description, $type);
        
        try {
            $this->db->beginTransaction();
            
            $stmt = $this->db->prepare("
                INSERT INTO groups 
                (name, description, creator_id, group_type, is_private, cover_image, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                htmlspecialchars($name),
                htmlspecialchars($description),
                $creatorId,
                $this->validateGroupType($type),
                $isPrivate ? 1 : 0,
                $coverImage
            ]);
            
            $groupId = (int)$this->db->lastInsertId();
            
            // Ajouter le créateur comme admin
            $this->addMember($groupId, $creatorId, 'admin');
            
            $this->db->commit();
            
            return $groupId;
            
        } catch (PDOException $e) {
            $this->db->rollBack();
            throw new Exception("Erreur lors de la création du groupe: " . $e->getMessage());
        }
    }

    public function getById(int $groupId): array {
        $stmt = $this->db->prepare("
            SELECT g.*, 
                   (SELECT COUNT(*) FROM group_members WHERE group_id = ?) as member_count
            FROM groups g 
            WHERE id = ?
        ");
        $stmt->execute([$groupId, $groupId]);
        
        $group = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$group) {
            throw new Exception("Groupe non trouvé");
        }
        
        return $group;
    }

    public function getUserGroups(int $userId): array {
        $stmt = $this->db->prepare("
            SELECT g.*, gm.role 
            FROM groups g 
            JOIN group_members gm ON g.id = gm.group_id 
            WHERE gm.user_id = ?
            ORDER BY g.created_at DESC
        ");
        $stmt->execute([$userId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function search(string $query, ?string $type = null): array {
        $sql = "
            SELECT g.*, 
                   (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
            FROM groups g 
            WHERE name LIKE ? AND is_private = false
        ";
        
        $params = ["%" . htmlspecialchars($query) . "%"];
        
        if ($type) {
            $sql .= " AND group_type = ?";
            $params[] = $this->validateGroupType($type);
        }
        
        $sql .= " ORDER BY member_count DESC LIMIT 20";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function addMember(int $groupId, int $userId, string $role = 'member'): bool {
        $this->validateRole($role);
        
        try {
            $stmt = $this->db->prepare("
                INSERT INTO group_members (group_id, user_id, role, joined_at) 
                VALUES (?, ?, ?, NOW())
                ON DUPLICATE KEY UPDATE role = VALUES(role)
            ");
            
            return $stmt->execute([$groupId, $userId, $role]);
            
        } catch (PDOException $e) {
            throw new Exception("Erreur lors de l'ajout du membre: " . $e->getMessage());
        }
    }

    public function removeMember(int $groupId, int $userId): bool {
        $stmt = $this->db->prepare("
            DELETE FROM group_members 
            WHERE group_id = ? AND user_id = ?
        ");
        
        return $stmt->execute([$groupId, $userId]);
    }

    public function getMembers(int $groupId): array {
        $stmt = $this->db->prepare("
            SELECT u.id, u.username, u.email, u.profile_picture, gm.role, gm.joined_at 
            FROM group_members gm 
            JOIN users u ON gm.user_id = u.id 
            WHERE gm.group_id = ?
            ORDER BY 
                CASE gm.role WHEN 'admin' THEN 1 ELSE 2 END,
                gm.joined_at ASC
        ");
        $stmt->execute([$groupId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function countMembers(int $groupId): int {
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as count 
            FROM group_members 
            WHERE group_id = ?
        ");
        $stmt->execute([$groupId]);
        
        return (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    // === Méthodes de validation privées ===
    
    private function validateGroupData(string $name, string $description, string $type): void {
        if (strlen($name) < 3 || strlen($name) > 100) {
            throw new InvalidArgumentException("Le nom du groupe doit contenir entre 3 et 100 caractères");
        }
        
        if (strlen($description) > 500) {
            throw new InvalidArgumentException("La description ne doit pas dépasser 500 caractères");
        }
        
        $this->validateGroupType($type);
    }
    
    private function validateGroupType(string $type): string {
        $allowedTypes = ['publication', 'discussion'];
        
        if (!in_array($type, $allowedTypes)) {
            throw new InvalidArgumentException("Type de groupe invalide");
        }
        
        return $type;
    }
    
    private function validateRole(string $role): void {
        $allowedRoles = ['member', 'admin', 'moderator'];
        
        if (!in_array($role, $allowedRoles)) {
            throw new InvalidArgumentException("Rôle invalide");
        }
    }
}